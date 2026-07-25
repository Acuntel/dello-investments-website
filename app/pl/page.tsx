import { generatePageMetadata } from "@/lib/metadata";
import HomePage from "@/components/HomePage";

export const metadata = generatePageMetadata({
  title:
    "Skup Domów w Chicago za Gotówkę | Oferta w 24 Godziny | Dello Investments",
  description:
    "Skup domów w Chicago, firma prowadzona przez kobiety. Uczciwe oferty w 24 godziny, finalizacja w 7-14 dni. Każdy stan, wszystkie 77 dzielnic. Bez remontów, bez prowizji, bez kosztów zamknięcia.",
  path: "",
  locale: "pl",
});

export default function Page() {
  return <HomePage locale="pl" />;
}
