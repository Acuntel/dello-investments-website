import Reveal from "@/components/ui/Reveal";
import CommercialForm from "@/components/ui/CommercialForm";
import { CONTACT } from "@/lib/constants";

// Closing band of /sell-commercial-property/, in place of the residential
// cash-offer call to action. Karen's final copy, word for word. The header
// button on that page jumps here (#property-form).
export default function CommercialCTA() {
  return (
    <section
      id="property-form"
      className="relative scroll-mt-20 overflow-hidden bg-navy"
    >
      <div
        className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-steel/40 blur-3xl"
        aria-hidden
      />
      <div className="container-custom relative section-padding">
        <div className="mx-auto max-w-2xl">
          <Reveal variant="fade-up" className="text-center">
            <h2 className="text-3xl !text-white sm:text-4xl">
              Tell us about your property.
            </h2>
            <p className="mt-5 text-white/75">
              Call or text us at{" "}
              <a
                href={CONTACT.phoneHref}
                className="font-semibold text-white underline decoration-mist underline-offset-4"
              >
                {CONTACT.phone}
              </a>
              , or send the basics here. We&apos;ll get back to you within one
              business day.
            </p>
          </Reveal>
          <div className="mt-10">
            <CommercialForm />
          </div>
        </div>
      </div>
    </section>
  );
}
