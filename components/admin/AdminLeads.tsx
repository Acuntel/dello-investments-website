"use client";

import { useEffect, useState } from "react";
import { Download, Loader2, MessageSquare, FileText } from "lucide-react";
import type { Lead } from "@/lib/admin/types";

function when(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// Excel treats a leading =, +, - or @ as a formula, so a pasted cell could run
// on open. Prefixing with an apostrophe keeps the value text.
function csvCell(value: string): string {
  const safe = /^[=+\-@]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

// The outside site that sent the visitor. Falls back to the utm_source tag
// (ChatGPT adds utm_source=chatgpt.com) when the browser hid the referrer.
function cameFrom(lead: Lead): string {
  try {
    if (lead.referrer)
      return new URL(lead.referrer).hostname.replace(/^www\./, "");
  } catch {
    // unparseable: fall through
  }
  const query = (lead.landingPage ?? "").split("?")[1] ?? "";
  return new URLSearchParams(query).get("utm_source") || "Direct or unknown";
}

function downloadCsv(leads: Lead[]) {
  const header = [
    "Date",
    "Source",
    "Name",
    "Phone",
    "Email",
    "Property",
    "Message",
    "Came from",
    "First page",
    "Sent from",
    "Referrer",
  ];
  const rows = leads.map((l) =>
    [
      l.at,
      l.source,
      l.name,
      l.phone,
      l.email,
      l.address,
      l.message,
      l.landingPage || l.referrer ? cameFrom(l) : "",
      l.landingPage,
      l.submitPage,
      l.referrer,
    ]
      .map((v) => csvCell(String(v ?? "")))
      .join(","),
  );
  const blob = new Blob([[header.join(","), ...rows].join("\n")], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `dello-enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminLeads({ passcode }: { passcode: string }) {
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    fetch("/api/admin/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode }),
    })
      .then(async (r) => {
        if (!r.ok) throw new Error("failed");
        const data = (await r.json()) as { leads: Lead[] };
        setLeads(data.leads ?? []);
        setState("ready");
      })
      .catch(() => setState("error"));
  }, [passcode]);

  if (state === "loading") {
    return (
      <p className="flex items-center gap-2 text-sm text-muted">
        <Loader2 className="h-4 w-4 animate-spin" /> Fetching your enquiries...
      </p>
    );
  }
  if (state === "error" || !leads) {
    return (
      <p className="max-w-xl text-sm leading-relaxed text-muted">
        Your enquiries could not be fetched just now. Try this tab again in a
        moment.
      </p>
    );
  }
  if (leads.length === 0) {
    return (
      <p className="max-w-xl text-sm leading-relaxed text-muted">
        No enquiries yet. Everything sent through the cash-offer form or the
        chat window lands here, newest first, and still goes to your inbox as
        well.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted">
          {leads.length} most recent{" "}
          {leads.length === 1 ? "enquiry" : "enquiries"}
        </p>
        <button
          type="button"
          onClick={() => downloadCsv(leads)}
          className="inline-flex items-center gap-2 rounded-full border border-mist bg-white px-5 py-2.5 text-sm font-semibold text-navy transition-colors duration-200 hover:border-mist hover:text-mist-ink"
        >
          <Download className="h-4 w-4" /> Download as a spreadsheet
        </button>
      </div>

      <ul className="flex flex-col gap-4">
        {leads.map((lead) => (
          <li
            key={lead.id}
            className="rounded-2xl bg-white p-5 shadow-card sm:p-6"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h3 className="font-heading text-lg text-navy">
                {lead.name || "No name given"}
              </h3>
              <span className="flex items-center gap-1.5 text-xs text-muted">
                {lead.source === "chat" ? (
                  <MessageSquare className="h-3.5 w-3.5" />
                ) : (
                  <FileText className="h-3.5 w-3.5" />
                )}
                {lead.source === "chat" ? "Chat" : "Cash offer form"} ·{" "}
                {when(lead.at)}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 text-sm">
              {lead.phone ? (
                <a
                  href={`tel:${lead.phone.replace(/[^\d+]/g, "")}`}
                  className="font-semibold text-navy hover:text-mist-ink"
                >
                  {lead.phone}
                </a>
              ) : null}
              {lead.email ? (
                <a
                  href={`mailto:${lead.email}`}
                  className="text-ink hover:text-mist-ink"
                >
                  {lead.email}
                </a>
              ) : null}
            </div>
            {lead.address ? (
              <p className="mt-2 text-sm text-ink">{lead.address}</p>
            ) : null}
            {lead.landingPage || lead.referrer ? (
              <p className="mt-2 text-xs text-muted">
                Came from {cameFrom(lead)} · First page{" "}
                {lead.landingPage || "unknown"} · Sent from{" "}
                {lead.submitPage || "unknown"}
              </p>
            ) : null}
            {lead.message ? (
              <p className="mt-3 whitespace-pre-wrap border-l-2 border-mist pl-4 text-sm leading-relaxed text-muted">
                {lead.message}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
