// All chat-widget UI strings, three locales. Record<ChatLocale, ChatStrings>
// is exhaustive, adding a locale is a compile error until every key exists.
export type ChatLocale = "en" | "es" | "pl";

export const CHAT_LOCALES: { code: ChatLocale; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "es", label: "ES" },
  { code: "pl", label: "PL" },
];

export function detectChatLocale(pathname: string | null): ChatLocale {
  if (!pathname) return "en";
  if (pathname === "/es" || pathname.startsWith("/es/")) return "es";
  if (pathname === "/pl" || pathname.startsWith("/pl/")) return "pl";
  return "en";
}

export const LANGUAGE_INSTRUCTION: Record<ChatLocale, string> = {
  en: "Reply in English.",
  es: "Responde siempre en español, incluso si el usuario escribe en otro idioma.",
  pl: "Odpowiadaj zawsze po polsku, nawet jeśli użytkownik pisze w innym języku.",
};

type ChatStrings = {
  headerTitle: string;
  launcherLabel: string;
  headerSubtitle: string;
  closeChat: string;
  leadFormIntro: string;
  namePlaceholder: string;
  emailPlaceholder: string;
  phonePlaceholder: string;
  startChat: string;
  preferToCall: (phone: string) => string;
  nameRequired: string;
  emailRequired: string;
  emailInvalid: string;
  greeting: (firstName: string) => string;
  callNow: string;
  inputPlaceholder: string;
  sendMessage: string;
  errorMessage: string;
  unavailableMessage: string;
  proactiveBubble: string;
  dismiss: string;
  openChat: string;
  languageAriaLabel: string;
};

export const CHAT_STRINGS: Record<ChatLocale, ChatStrings> = {
  en: {
    headerTitle: "Dello Concierge",
    launcherLabel: "Chat with us",
    headerSubtitle: "Ask us anything, we reply instantly",
    closeChat: "Close chat",
    leadFormIntro:
      "Tell us who you are and we'll answer any question about selling your home.",
    namePlaceholder: "Your name",
    emailPlaceholder: "Email address",
    phonePlaceholder: "Phone (optional)",
    startChat: "Start Chatting",
    preferToCall: (phone) => `Prefer to talk? Call or text ${phone}`,
    nameRequired: "Please enter your name.",
    emailRequired: "Please enter your email.",
    emailInvalid: "Please enter a valid email.",
    greeting: (firstName) =>
      `Hi ${firstName}! I'm the Dello Investments assistant, here for anything from an inherited house to a foreclosure timeline to "what's my place worth to you?" How can I help today?`,
    callNow: "Call Now",
    inputPlaceholder: "Type your question…",
    sendMessage: "Send message",
    errorMessage:
      "Sorry, something went wrong. Please try again or call (312) 975-5557.",
    unavailableMessage:
      "Chat is temporarily unavailable. Please call or text (312) 975-5557.",
    proactiveBubble: "Ask me anything about selling your Chicago home.",
    dismiss: "Dismiss",
    openChat: "Open chat",
    languageAriaLabel: "Chat language",
  },
  es: {
    headerTitle: "Concierge de Dello",
    launcherLabel: "Chatee con nosotros",
    headerSubtitle: "Pregúntenos lo que sea, respondemos al instante",
    closeChat: "Cerrar chat",
    leadFormIntro:
      "Díganos quién es y responderemos cualquier pregunta sobre la venta de su casa.",
    namePlaceholder: "Su nombre",
    emailPlaceholder: "Correo electrónico",
    phonePlaceholder: "Teléfono (opcional)",
    startChat: "Comenzar a Chatear",
    preferToCall: (phone) =>
      `¿Prefiere hablar? Llame o envíe texto al ${phone}`,
    nameRequired: "Por favor escriba su nombre.",
    emailRequired: "Por favor escriba su correo.",
    emailInvalid: "Por favor escriba un correo válido.",
    greeting: (firstName) =>
      `¡Hola ${firstName}! Soy el asistente de Dello Investments y puedo ayudarle con todo, desde una casa heredada hasta una ejecución hipotecaria o un simple "¿cuánto vale mi casa para ustedes?" ¿En qué puedo ayudarle hoy?`,
    callNow: "Llamar Ahora",
    inputPlaceholder: "Escriba su pregunta…",
    sendMessage: "Enviar mensaje",
    errorMessage:
      "Lo sentimos, algo salió mal. Intente de nuevo o llame al (312) 975-5557.",
    unavailableMessage:
      "El chat no está disponible por el momento. Llame o envíe texto al (312) 975-5557.",
    proactiveBubble: "Pregúnteme lo que quiera sobre la venta de su casa.",
    dismiss: "Cerrar",
    openChat: "Abrir chat",
    languageAriaLabel: "Idioma del chat",
  },
  pl: {
    headerTitle: "Concierge Dello",
    launcherLabel: "Porozmawiaj z nami",
    headerSubtitle: "Zapytaj o cokolwiek, odpowiadamy od razu",
    closeChat: "Zamknij czat",
    leadFormIntro:
      "Powiedz nam, kim jesteś, a odpowiemy na każde pytanie o sprzedaż Twojego domu.",
    namePlaceholder: "Twoje imię",
    emailPlaceholder: "Adres e-mail",
    phonePlaceholder: "Telefon (opcjonalnie)",
    startChat: "Rozpocznij Czat",
    preferToCall: (phone) => `Wolisz rozmowę? Zadzwoń lub napisz: ${phone}`,
    nameRequired: "Podaj swoje imię.",
    emailRequired: "Podaj swój e-mail.",
    emailInvalid: "Podaj prawidłowy e-mail.",
    greeting: (firstName) =>
      `Cześć ${firstName}! Jestem asystentem Dello Investments i pomogę Ci we wszystkim, od domu ze spadku po egzekucję albo zwykłe "ile mój dom jest dla was wart?" W czym mogę dziś pomóc?`,
    callNow: "Zadzwoń Teraz",
    inputPlaceholder: "Wpisz swoje pytanie…",
    sendMessage: "Wyślij wiadomość",
    errorMessage:
      "Przepraszamy, coś poszło nie tak. Spróbuj ponownie lub zadzwoń: (312) 975-5557.",
    unavailableMessage:
      "Czat jest chwilowo niedostępny. Zadzwoń lub napisz: (312) 975-5557.",
    proactiveBubble: "Zapytaj mnie o cokolwiek w sprawie sprzedaży domu.",
    dismiss: "Zamknij",
    openChat: "Otwórz czat",
    languageAriaLabel: "Język czatu",
  },
};
