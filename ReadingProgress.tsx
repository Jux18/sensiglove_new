import { Hand, Radar, Activity } from "lucide-react";
import ReadAloudButton from "@/components/ReadAloudButton";
import RevealSection from "@/components/RevealSection";
import { Lang, t } from "@/lib/translations";

interface HowItWorksProps {
  lang: Lang;
  inline?: boolean;
}

const steps = [
  { icon: Hand, titleKey: "howStep1Title", descKey: "howStep1Desc" },
  { icon: Radar, titleKey: "howStep2Title", descKey: "howStep2Desc" },
  { icon: Activity, titleKey: "howStep3Title", descKey: "howStep3Desc" },
] as const;

const HowItWorks = ({ lang, inline }: HowItWorksProps) => {
  const T = (key: string) => t(key, lang);

  const cards = (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {steps.map((step, i) => {
        const Icon = step.icon;
        return (
          <div
            key={step.titleKey}
            className="rounded-lg border-2 border-border bg-card p-6 text-center flex flex-col items-center gap-4 hover:border-accent transition-colors"
          >
            <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center">
              <Icon size={28} className="text-accent" aria-hidden="true" />
            </div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {lang === "de" ? `Schritt ${i + 1}` : `Step ${i + 1}`}
            </span>
            <h3 className="text-xl font-bold text-foreground">{T(step.titleKey)}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{T(step.descKey)}</p>
          </div>
        );
      })}
    </div>
  );

  if (inline) return cards;

  const readText = `${T("howHeading")}. ${steps.map((s) => `${T(s.titleKey)}: ${T(s.descKey)}`).join(". ")}`;

  return (
    <section aria-labelledby="how-heading" className="py-section">
      <RevealSection className="container max-w-4xl">
        <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
          <h2 id="how-heading" className="text-heading text-primary">
            {T("howHeading")}
          </h2>
          <ReadAloudButton label={T("howReadAloud")} text={readText} lang={lang} />
        </div>
        {cards}
      </RevealSection>
    </section>
  );
};

export default HowItWorks;
