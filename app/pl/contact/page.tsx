import { generatePageMetadata } from "@/lib/metadata";
import ContactPage from "@/components/ContactPage";

export const metadata = generatePageMetadata({
  title: "Otrzymaj Bezpłatną Ofertę Gotówkową",
  description:
    "Opowiedz nam o swojej nieruchomości w Chicago i otrzymaj uczciwą, pisemną ofertę w 24 godziny. Zadzwoń lub napisz: (312) 975-5557, otwarte 7 dni w tygodniu.",
  path: "/contact",
  locale: "pl",
});

export default function Page() {
  return <ContactPage locale="pl" />;
}
