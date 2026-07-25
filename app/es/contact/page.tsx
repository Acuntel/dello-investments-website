import { generatePageMetadata } from "@/lib/metadata";
import ContactPage from "@/components/ContactPage";

export const metadata = generatePageMetadata({
  title: "Obtenga Su Oferta Gratis en Efectivo",
  description:
    "Cuéntenos sobre su propiedad en Chicago y reciba una oferta justa por escrito en 24 horas. Llame o envíe texto al (312) 975-5557 — abierto los 7 días.",
  path: "/contact",
  locale: "es",
});

export default function Page() {
  return <ContactPage locale="es" />;
}
