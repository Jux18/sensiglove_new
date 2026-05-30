import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { Lang, t } from "@/lib/translations";

interface BackToTopProps {
  lang: Lang;
}

const BackToTop = ({ lang }: BackToTopProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label={t("backToTop", lang)}
      className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <ArrowUp size={22} />
    </button>
  );
};

export default BackToTop;
