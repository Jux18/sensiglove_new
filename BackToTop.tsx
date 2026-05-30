import { Moon, Sun, AArrowUp, AArrowDown, Languages } from "lucide-react";
import { Lang, t } from "@/lib/translations";

interface AccessibilityToolbarProps {
  lang: Lang;
  onLangChange: (lang: Lang) => void;
  darkMode: boolean;
  onDarkModeChange: (dark: boolean) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
}

const AccessibilityToolbar = ({
  lang,
  onLangChange,
  darkMode,
  onDarkModeChange,
  fontSize,
  onFontSizeChange,
}: AccessibilityToolbarProps) => {
  const btnClass =
    "p-2 rounded-md border-2 border-border bg-card text-foreground hover:bg-muted transition-colors focus-visible:outline-3 focus-visible:outline-offset-2";
  const fontUpClass =
    "p-2 rounded-md border-2 border-primary bg-primary/10 text-primary hover:bg-primary/20 transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 font-bold";

  return (
    <div className="flex items-center gap-2" role="toolbar" aria-label="Barrierefreiheit-Werkzeuge">
      <button
        onClick={() => onFontSizeChange(Math.min(fontSize + 1, 5))}
        className={fontUpClass}
        aria-label={t("fontIncrease", lang)}
        title={t("fontIncrease", lang)}
        disabled={fontSize >= 5}
      >
        <AArrowUp size={22} />
      </button>

      <button
        onClick={() => onFontSizeChange(Math.max(fontSize - 1, 0))}
        className={btnClass}
        aria-label={t("fontDecrease", lang)}
        title={t("fontDecrease", lang)}
        disabled={fontSize <= 0}
      >
        <AArrowDown size={22} />
      </button>

      <button
        onClick={() => onDarkModeChange(!darkMode)}
        className={btnClass}
        aria-label={darkMode ? t("lightMode", lang) : t("darkMode", lang)}
        title={darkMode ? t("lightMode", lang) : t("darkMode", lang)}
      >
        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <button
        onClick={() => onLangChange(lang === "de" ? "en" : "de")}
        className={btnClass}
        aria-label={t("langSwitch", lang)}
        title={t("langSwitch", lang)}
      >
        <Languages size={20} />
      </button>
    </div>
  );
};

export default AccessibilityToolbar;
