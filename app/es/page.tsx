import { generatePageMetadata } from "@/lib/metadata";
import HomePage from "@/components/HomePage";

export const metadata = generatePageMetadata({
  title:
    "Compramos Casas en Chicago al Contado | Oferta en 24 Horas | Dello Investments",
  description:
    "Compradores de casas en Chicago, empresa de mujeres. Ofertas justas en 24 horas, cierre en 7-14 días. Cualquier condición, los 77 vecindarios. Sin reparaciones, sin comisiones, sin costos de cierre.",
  path: "",
  locale: "es",
});

export default function Page() {
  return <HomePage locale="es" />;
}
