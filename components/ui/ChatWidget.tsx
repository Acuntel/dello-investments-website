"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X, ArrowUp, Phone, Loader2 } from "lucide-react";
import { CONTACT } from "@/lib/constants";
import { attribution, countEvent } from "@/lib/leadTracking";
import {
  CHAT_LOCALES,
  CHAT_STRINGS,
  ChatLocale,
  detectChatLocale,
} from "@/lib/chat-translations";

interface Message {
  role: "user" | "assistant";
  content: string;
}
interface LeadInfo {
  name: string;
  email: string;
  phone: string;
}
type WidgetState = "closed" | "lead-form" | "chatting";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id: string) => void;
    };
  }
}

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export default function ChatWidget() {
  const pathname = usePathname();
  const [locale, setLocale] = useState<ChatLocale>("en");
  const [state, setState] = useState<WidgetState>("closed");
  const [leadInfo, setLeadInfo] = useState<LeadInfo>({
    name: "",
    email: "",
    phone: "",
  });
  const [formError, setFormError] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showBubble, setShowBubble] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const turnstileContainer = useRef<HTMLDivElement>(null);
  const turnstileWidgetId = useRef<string | null>(null);
  const sessionTokenRef = useRef<string | null>(null);
  const messagesRef = useRef<Message[]>([]);
  messagesRef.current = messages;

  // Follow the page's language; the user can still override with the tabs.
  useEffect(() => {
    setLocale(detectChatLocale(pathname));
  }, [pathname]);

  const t = CHAT_STRINGS[locale];

  // Proactive bubble after 18s, once per tab.
  useEffect(() => {
    if (sessionStorage.getItem("dello-chat-dismissed")) return;
    const timer = setTimeout(() => {
      if (state === "closed") setShowBubble(true);
    }, 18000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ---- Turnstile (lazy; widget works with no keys configured) ----
  function ensureTurnstileScript() {
    if (!TURNSTILE_SITE_KEY) return;
    if (document.getElementById("cf-turnstile-script")) return;
    const script = document.createElement("script");
    script.id = "cf-turnstile-script";
    script.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    document.head.appendChild(script);
  }

  function runTurnstile(): Promise<string | null> {
    return new Promise((resolve) => {
      if (!TURNSTILE_SITE_KEY || !turnstileContainer.current) {
        resolve(null);
        return;
      }
      // Safety net: a stuck challenge never hangs a send.
      const timeout = setTimeout(() => resolve(null), 15000);
      const tryRender = () => {
        if (!window.turnstile || !turnstileContainer.current) {
          setTimeout(tryRender, 250);
          return;
        }
        if (turnstileWidgetId.current !== null) {
          window.turnstile.reset(turnstileWidgetId.current);
        }
        turnstileWidgetId.current = window.turnstile.render(
          turnstileContainer.current,
          {
            sitekey: TURNSTILE_SITE_KEY,
            size: "invisible",
            callback: (token: string) => {
              clearTimeout(timeout);
              resolve(token);
            },
            "error-callback": () => {
              clearTimeout(timeout);
              resolve(null);
            },
            "expired-callback": () => {
              clearTimeout(timeout);
              resolve(null);
            },
          },
        );
      };
      tryRender();
    });
  }

  async function getSessionToken(): Promise<string | null> {
    if (sessionTokenRef.current) return sessionTokenRef.current;
    if (!TURNSTILE_SITE_KEY) return null;
    const turnstileToken = await runTurnstile();
    if (!turnstileToken) return null;
    try {
      const res = await fetch("/api/chat/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ turnstileToken }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      sessionTokenRef.current = data.token;
      return data.token;
    } catch {
      return null;
    }
  }

  // ---- Lead capture ----
  function handleLeadSubmit(e: FormEvent) {
    e.preventDefault();
    if (!leadInfo.name.trim()) {
      setFormError(t.nameRequired);
      return;
    }
    if (!leadInfo.email.trim()) {
      setFormError(t.emailRequired);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(leadInfo.email)) {
      setFormError(t.emailInvalid);
      return;
    }
    setFormError("");
    setMessages([
      { role: "assistant", content: t.greeting(leadInfo.name.split(" ")[0]) },
    ]);
    setState("chatting");
    void sendLeadNotification(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  async function sendLeadNotification(isClose: boolean) {
    try {
      const res = await fetch("/api/chat/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...leadInfo,
          ...attribution(),
          isClose,
          transcript: isClose ? messagesRef.current : undefined,
        }),
      });
      if (!isClose && res.ok) countEvent("chat-lead");
    } catch {
      // never block UX on the notification
    }
  }

  function handleClose() {
    if (state === "chatting" && messagesRef.current.length > 1) {
      void sendLeadNotification(true);
    }
    setState("closed");
  }

  // ---- Streaming send (retries once on 401 with a fresh session) ----
  async function handleSendMessage(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput("");
    const history = [
      ...messagesRef.current,
      { role: "user" as const, content: text },
    ];
    setMessages([...history, { role: "assistant", content: "" }]);
    setIsStreaming(true);

    const send = async (): Promise<Response> => {
      const sessionToken = await getSessionToken();
      return fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          leadInfo,
          locale,
          sessionToken,
        }),
      });
    };

    try {
      let response = await send();
      if (response.status === 401) {
        sessionTokenRef.current = null;
        response = await send();
      }
      if (!response.ok) {
        let msg = t.errorMessage;
        if (response.status === 503) msg = t.unavailableMessage;
        try {
          const data = await response.json();
          if (data?.error && response.status !== 500) msg = data.error;
        } catch {
          // keep default message
        }
        setMessages([...history, { role: "assistant", content: msg }]);
        return;
      }
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No stream");
      const decoder = new TextDecoder();
      let assistantText = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantText += decoder.decode(value, { stream: true });
        setMessages([
          ...history,
          { role: "assistant", content: assistantText },
        ]);
      }
      if (!assistantText) {
        setMessages([
          ...history,
          { role: "assistant", content: t.errorMessage },
        ]);
      }
    } catch {
      setMessages([...history, { role: "assistant", content: t.errorMessage }]);
    } finally {
      setIsStreaming(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  function openWidget() {
    setShowBubble(false);
    sessionStorage.setItem("dello-chat-dismissed", "1");
    ensureTurnstileScript();
    setState(messages.length > 0 ? "chatting" : "lead-form");
  }

  const fieldCls =
    "rounded-xl bg-mist-faint px-4 py-3 text-base outline-none ring-1 ring-transparent transition-shadow focus:ring-mist";

  return (
    <div className="fixed bottom-5 right-4 z-50 sm:right-6">
      <div ref={turnstileContainer} className="hidden" />

      {/* Proactive bubble */}
      {showBubble && state === "closed" && (
        <div className="absolute bottom-16 right-0 w-64 rounded-2xl border border-mist bg-white p-4 shadow-lift">
          <button
            type="button"
            aria-label={t.dismiss}
            onClick={() => {
              setShowBubble(false);
              sessionStorage.setItem("dello-chat-dismissed", "1");
            }}
            className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-navy text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <p className="text-sm text-ink">{t.proactiveBubble}</p>
        </div>
      )}

      {/* Panel */}
      {state !== "closed" && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t.headerTitle}
          className="absolute bottom-16 right-0 flex max-h-[min(580px,calc(100vh-120px))] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-mist bg-white shadow-lift sm:w-[390px]"
        >
          {/* Header: gradient + monogram avatar */}
          <div className="shrink-0 bg-gradient-to-br from-navy via-navy-800 to-navy-700 px-5 pb-4 pt-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-mist font-heading text-lg text-navy">
                  D
                </span>
                <div>
                  <p className="font-heading text-lg leading-tight text-white">
                    {t.headerTitle}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-mist">
                    <span
                      className="inline-block h-1.5 w-1.5 rounded-full bg-mist"
                      aria-hidden
                    />
                    {t.headerSubtitle}
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label={t.closeChat}
                onClick={handleClose}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Language tabs (segmented strip under the header) */}
          <div
            role="group"
            aria-label={t.languageAriaLabel}
            className="flex shrink-0 border-b border-mist-light bg-mist-faint"
          >
            {CHAT_LOCALES.map(({ code, label }) => (
              <button
                key={code}
                type="button"
                aria-pressed={locale === code}
                onClick={() => setLocale(code)}
                className={`flex-1 border-b-2 py-2 text-xs font-semibold tracking-wide transition-colors ${
                  locale === code
                    ? "border-mist text-navy"
                    : "border-transparent text-muted hover:text-navy"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Lead form */}
          {state === "lead-form" && (
            <form
              onSubmit={handleLeadSubmit}
              className="flex flex-col gap-3 p-5"
            >
              <p className="text-sm text-muted">{t.leadFormIntro}</p>
              <input
                type="text"
                value={leadInfo.name}
                onChange={(e) =>
                  setLeadInfo({ ...leadInfo, name: e.target.value })
                }
                placeholder={t.namePlaceholder}
                aria-label={t.namePlaceholder}
                maxLength={200}
                className={fieldCls}
              />
              <input
                type="email"
                value={leadInfo.email}
                onChange={(e) =>
                  setLeadInfo({ ...leadInfo, email: e.target.value })
                }
                placeholder={t.emailPlaceholder}
                aria-label={t.emailPlaceholder}
                maxLength={200}
                className={fieldCls}
              />
              <input
                type="tel"
                value={leadInfo.phone}
                onChange={(e) =>
                  setLeadInfo({ ...leadInfo, phone: e.target.value })
                }
                placeholder={t.phonePlaceholder}
                aria-label={t.phonePlaceholder}
                maxLength={50}
                className={fieldCls}
              />
              {formError && (
                <p role="alert" className="text-sm text-red-600">
                  {formError}
                </p>
              )}
              <button type="submit" className="btn-navy w-full">
                {t.startChat}
              </button>
              <a
                href={CONTACT.phoneHref}
                className="flex items-center justify-center gap-2 text-sm text-steel transition-colors hover:text-navy"
              >
                <Phone className="h-3.5 w-3.5" />
                {t.preferToCall(CONTACT.phone)}
              </a>
            </form>
          )}

          {/* Chat */}
          {state === "chatting" && (
            <>
              <div
                aria-live="polite"
                className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto bg-white p-4"
              >
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`max-w-[85%] px-4 py-2.5 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "self-end rounded-xl bg-navy-700 text-white"
                        : "self-start rounded-xl border-l-2 border-mist bg-mist-faint text-ink"
                    }`}
                  >
                    {m.content === "" && isStreaming ? (
                      <Loader2 className="h-4 w-4 animate-spin text-mist-ink" />
                    ) : (
                      m.content
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <form
                onSubmit={handleSendMessage}
                className="flex shrink-0 items-center gap-2 border-t border-mist-light bg-mist-faint p-3"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t.inputPlaceholder}
                  aria-label={t.inputPlaceholder}
                  maxLength={5000}
                  className="min-w-0 flex-1 rounded-xl bg-white px-4 py-2.5 text-base outline-none ring-1 ring-mist transition-shadow focus:ring-mist"
                />
                <button
                  type="submit"
                  aria-label={t.sendMessage}
                  disabled={isStreaming || !input.trim()}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy text-mist transition-colors hover:bg-navy-700 disabled:opacity-40"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {/* Launcher: labeled pill, not an icon bubble */}
      <button
        type="button"
        aria-label={state === "closed" ? t.openChat : t.closeChat}
        onClick={() => (state === "closed" ? openWidget() : handleClose())}
        className="group flex items-center gap-2.5 rounded-full border border-mist/40 bg-navy py-3 pl-4 pr-5 text-white shadow-lift transition-all duration-300 ease-smooth hover:border-mist hover:bg-navy-700"
      >
        {state === "closed" ? (
          <>
            <MessageCircle className="h-5 w-5 text-mist" />
            <span className="text-sm font-semibold">{t.launcherLabel}</span>
          </>
        ) : (
          <>
            <X className="h-5 w-5 text-mist" />
            <span className="text-sm font-semibold">{t.closeChat}</span>
          </>
        )}
      </button>
    </div>
  );
}
