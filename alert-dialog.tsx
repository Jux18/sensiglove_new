import RevealSection from "@/components/RevealSection";
import ReadAloudButton from "@/components/ReadAloudButton";
import { Lang, t } from "@/lib/translations";
import teamMoritz from "@/assets/team-moritz.jpg";
import teamLucas from "@/assets/team-lucas.jpg";
import teamJulian from "@/assets/team-julian.jpg";
import teamMathis from "@/assets/team-mathis.jpg";

interface TeamSectionProps {
  lang: Lang;
}

const team = [
  { name: "Moritz Klösters", roleKey: "teamRole1", img: teamMoritz, altKey: "teamAlt1" },
  { name: "Lucas Schall", roleKey: "teamRole2", img: teamLucas, altKey: "teamAlt2" },
  { name: "Julian Seyboldt", roleKey: "teamRole3", img: teamJulian, altKey: "teamAlt3" },
  { name: "Mathis Biesinger", roleKey: "teamRole4", img: teamMathis, altKey: "teamAlt4" },
];

const TeamSection = ({ lang }: TeamSectionProps) => {
  const T = (key: string) => t(key, lang);

  const readText = `${T("teamHeading")}. ${team.map(m => `${m.name}, ${T(m.roleKey)}`).join(". ")}.`;

  return (
    <section id="team" aria-labelledby="team-heading" className="py-section section-alt">
      <RevealSection className="container max-w-4xl">
        <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
          <h2 id="team-heading" className="text-heading text-primary">{T("teamHeading")}</h2>
          <ReadAloudButton label={T("teamReadAloud")} text={readText} lang={lang} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {team.map((member) => (
            <div key={member.name} className="flex flex-col items-center text-center gap-3">
              <img
                src={member.img}
                alt={T(member.altKey)}
                className="w-32 h-32 rounded-full object-cover border-2 border-primary/20"
              />
              <div>
                <p className="font-semibold text-foreground">{member.name}</p>
                <p className="text-sm text-muted-foreground">{T(member.roleKey)}</p>
              </div>
            </div>
          ))}
        </div>
      </RevealSection>
    </section>
  );
};

export default TeamSection;
