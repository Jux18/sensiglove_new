import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import ExpandableSection from "@/components/ExpandableSection";
import ReadAloudButton from "@/components/ReadAloudButton";
import AccessibilityToolbar from "@/components/AccessibilityToolbar";
import BackToTop from "@/components/BackToTop";
import RevealSection from "@/components/RevealSection";
import ReadingProgress from "@/components/ReadingProgress";
import HowItWorks from "@/components/HowItWorks";

import TeamSection from "@/components/TeamSection";
import { Lang, t } from "@/lib/translations";
import logo from "@/assets/logo.jpg";
import productPhoto from "@/assets/product-photo.jpg";
import { Menu, X, LogIn, LogOut } from "lucide-react";
import AuthDialog from "@/components/AuthDialog";
import { getCurrentUser, logoutUser, onAuthChange } from "@/lib/auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Index = () => {
  const [scrolled, setScrolled] = useState(false);
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem("sg-lang") as Lang) || "de");
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("sg-dark") === "true");
  const [fontSize, setFontSize] = useState(() => Number(localStorage.getItem("sg-font")) || 1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getCurrentUser().then((email) => {
      if (mounted) setCurrentUser(email);
    });
    const unsub = onAuthChange((email) => setCurrentUser(email));
    return () => {
      mounted = false;
      unsub();
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const FONT_SIZES = ["text-base", "text-lg", "text-xl", "text-2xl", "text-3xl", "text-4xl"];

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("sg-dark", String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    document.body.classList.remove(...FONT_SIZES);
    document.body.classList.add(FONT_SIZES[fontSize] ?? "text-base");
    localStorage.setItem("sg-font", String(fontSize));
    return () => document.body.classList.remove(...FONT_SIZES);
  }, [fontSize]);

  useEffect(() => {
    document.documentElement.lang = lang;
    localStorage.setItem("sg-lang", lang);
  }, [lang]);

  // Close mobile menu on outside click
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [mobileMenuOpen]);

  const T = useCallback((key: string) => t(key, lang), [lang]);

  const heroReadText = useMemo(() => `${T("heroSlogan")}. ${T("heroSub1")} ${T("heroSub2")}`, [T]);
  const a11yReadText = useMemo(() => `${T("a11yHeading")}. ${T("a11yIntro")} ${T("a11yScreenreader")}. ${T("a11yHeadings")}. ${T("a11yKeyboard")}. ${T("a11yNoHover")}. ${T("a11yAlt")}. ${T("a11yOutro")}`, [T]);
  const funktionReadText = useMemo(() => `${T("funktionHeading")}. ${T("funktionIntro")} ${T("funktionFar")}: ${T("funktionFarDesc")}. ${T("funktionMid")}: ${T("funktionMidDesc")}. ${T("funktionNear")}: ${T("funktionNearDesc")}. ${T("funktionVeryNear")}: ${T("funktionVeryNearDesc")}. ${T("funktionOutro")}`, [T]);
  const kontaktReadText = useMemo(() => `${T("kontaktHeading")}. ${T("kontaktIntro")} ${T("kontaktEmail")}: sensigloveofficial@gmail.com. ${T("kontaktInstagram")}: @sensiglove.`, [T]);
  const vergleichReadText = useMemo(() => `${T("vergleichHeading")}. ${T("vergleichIntro")} ${T("vergleichQuote")} ${[1,2,3,4,5,6].map(i => `${T(`vgl${i}Title`)}. ${T(`vgl${i}Text`)} ${T(`vgl${i}Consequence`)}`).join(". ")}`, [T]);
  const einsatzReadText = useMemo(() => `${T("einsatzHeading")}. ${T("einsatzIntro")} ${T("einsatzIndoor")}: ${T("einsatzIndoor1")}. ${T("einsatzIndoor2")}. ${T("einsatzIndoor3")}. ${T("einsatzOutdoor")}: ${T("einsatzOutdoor1")}. ${T("einsatzOutdoor2")}. ${T("einsatzOutdoor3")}. ${T("einsatzSafety")}: ${T("einsatzSafety1")}. ${T("einsatzSafety2")}. ${T("einsatzSafety3")}.`, [T]);

  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const ids = ["funktion", "einsatz", "vergleich", "team", "kontakt"];

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowH = window.innerHeight;
      const docH = document.documentElement.scrollHeight;

      // At very top: nothing active
      if (scrollY < 200) {
        setActiveSection("");
        return;
      }

      // At very bottom: last section
      if (scrollY + windowH >= docH - 50) {
        setActiveSection(ids[ids.length - 1]);
        return;
      }

      // Find section whose top is closest to viewport top (with offset)
      const headerOffset = windowH * 0.3;
      let current = "";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= headerOffset) {
            current = id;
          }
        }
      }
      setActiveSection(current);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore when typing in inputs / contenteditable
      const target = e.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable) {
          return;
        }
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const key = e.key;
      switch (key) {
        case "?":
          e.preventDefault();
          setShowShortcuts((s) => !s);
          break;
        case "+":
        case "=":
          e.preventDefault();
          setFontSize((f) => Math.min(f + 1, 5));
          break;
        case "-":
        case "_":
          e.preventDefault();
          setFontSize((f) => Math.max(f - 1, 0));
          break;
        case "d":
        case "D":
          e.preventDefault();
          setDarkMode((d) => !d);
          break;
        case "l":
        case "L":
          e.preventDefault();
          setLang((l) => (l === "de" ? "en" : "de"));
          break;
        case "t":
        case "T":
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const navLinks = [
    { href: "#funktion", label: T("navFunktion") },
    { href: "#einsatz", label: T("navEinsatz") },
    { href: "#vergleich", label: T("navVergleich") },
    { href: "#kontakt", label: T("navKontakt") },
    { href: "#team", label: T("navTeam") },
  ];

  

  return (
    <div>
      <ReadingProgress />
      {/* Skip Link */}
      <a href="#main-content" className="skip-link">
        {T("skipLink")}
      </a>

      {/* Header */}
      <header
        ref={menuRef}
        role="banner"
        className={`border-b-2 border-border bg-card/95 backdrop-blur-sm fixed top-0 left-0 right-0 z-40 transition-shadow duration-300 ${
          scrolled ? "shadow-md" : ""
        }`}
      >
        <div className="container max-w-4xl py-3 flex items-center justify-between gap-4">
          <a
            href="#top"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="flex items-center gap-3 no-underline cursor-pointer flex-shrink-0"
          >
            <img src={logo} alt="SensiGlove Logo" className="h-10 w-10 rounded" />
            <span className="text-lg font-semibold text-primary">SensiGlove</span>
          </a>
          <nav aria-label={lang === "de" ? "Hauptnavigation" : "Main navigation"} className="hidden md:block">
            <ul className="flex gap-5 text-sm">
              {navLinks.map(link => (
                <li key={link.href}>
                  <a href={link.href} onClick={(e) => scrollToSection(e, link.href)} className={`underline-offset-4 hover:underline transition-colors ${activeSection === link.href.replace("#","") ? "text-primary font-semibold" : "text-foreground hover:text-primary"}`}>{link.label}</a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center gap-2">
            <AccessibilityToolbar
              lang={lang}
              onLangChange={setLang}
              darkMode={darkMode}
              onDarkModeChange={setDarkMode}
              fontSize={fontSize}
              onFontSizeChange={setFontSize}
            />
            {currentUser ? (
              <button
                type="button"
                onClick={async () => { await logoutUser(); setCurrentUser(null); }}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-md border-2 border-primary bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity focus-visible:outline-3 focus-visible:outline-offset-2"
                aria-label={`${T("authLogout")} (${currentUser})`}
                title={`${T("authLoggedInAs")}: ${currentUser}`}
              >
                <LogOut size={18} aria-hidden="true" />
                <span className="hidden sm:inline">{T("authLogout")}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setAuthOpen(true)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-md border-2 border-primary bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity focus-visible:outline-3 focus-visible:outline-offset-2"
                aria-label={T("authLogin")}
              >
                <LogIn size={18} aria-hidden="true" />
                <span className="hidden sm:inline">{T("authLogin")}</span>
              </button>
            )}
            {/* Hamburger */}
            <button
              className="md:hidden p-2 rounded-md border-2 border-border bg-card text-foreground hover:bg-muted transition-colors focus-visible:outline-3 focus-visible:outline-offset-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav"
              aria-label={mobileMenuOpen ? T("menuClose") : T("menuOpen")}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <nav id="mobile-nav" aria-label={lang === "de" ? "Mobile Navigation" : "Mobile navigation"} className="md:hidden border-t-2 border-border bg-card">
            <ul className="flex flex-col py-2">
              {navLinks.map(link => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={(e) => scrollToSection(e, link.href)}
                    className="block px-6 py-3 text-foreground hover:text-primary hover:bg-muted transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>

      {/* Spacer for fixed header */}
      <div className="h-16" aria-hidden="true" />

      <main id="main-content" role="main">
        {/* Hero */}
        <section aria-label={lang === "de" ? "Einführung" : "Introduction"} className="hero-section py-section">
          <div className="container max-w-4xl">
            {/* Logo + Slogan nebeneinander */}
            <div className="flex items-center gap-5 mb-6">
              <img
                src={logo}
                alt="SensiGlove Logo"
                className="w-16 h-16 md:w-20 md:h-20 rounded-xl shadow-lg border-2 border-white/20 flex-shrink-0 opacity-90"
              />
              <h1 className="text-display">
                {T("heroSlogan")}
              </h1>
            </div>
            {/* Rest des Hero-Inhalts */}
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="flex-1">
                <p className="max-w-2xl opacity-90 mb-6" style={{ fontSize: "1.15em" }}>
                  {T("heroSub1")}
                </p>
                <p className="max-w-2xl opacity-80 mb-6">
                  {T("heroSub2")}
                </p>
                <div className="mt-4">
                  <ReadAloudButton label={T("heroReadAloud")} text={heroReadText} lang={lang} />
                </div>
              </div>
              <div className="flex-shrink-0">
                <img
                  src={productPhoto}
                  alt={T("heroProductAlt")}
                  className="w-72 md:w-80 rounded-lg shadow-lg border-2 border-white/20"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Barrierefreiheit */}
        <div className="section-divider" aria-hidden="true" />
        <section aria-labelledby="a11y-heading" className="py-section section-alt">
          <RevealSection className="container max-w-4xl">
            <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
              <h2 id="a11y-heading" className="text-heading text-primary">{T("a11yHeading")}</h2>
              <ReadAloudButton label={T("a11yReadAloud")} text={a11yReadText} lang={lang} />
            </div>
            <p className="mb-4">{T("a11yIntro")}</p>
            <ul className="list-none space-y-2 pl-0" role="list">
              <li>— {T("a11yScreenreader")}</li>
              <li>— {T("a11yHeadings")}</li>
              <li>— {T("a11yKeyboard")}</li>
              <li>— {T("a11yNoHover")}</li>
              <li>— {T("a11yAlt")}</li>
            </ul>
            <p className="mt-4">{T("a11yOutro")}</p>
          </RevealSection>
        </section>

        {/* Funktionsprinzip mit "So funktioniert es" */}
        <div className="section-divider" aria-hidden="true" />
        <section id="funktion" aria-labelledby="funktion-heading" className="py-section">
          <RevealSection className="container max-w-4xl">
            <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
              <h2 id="funktion-heading" className="text-heading text-primary">{T("funktionHeading")}</h2>
              <ReadAloudButton label={T("funktionReadAloud")} text={funktionReadText} lang={lang} />
            </div>
            {/* 3-Schritte-Karten */}
            <div className="mb-10">
              <HowItWorks lang={lang} inline />
            </div>
            <p className="mb-4">{T("funktionIntro")}</p>
            <ul className="list-none space-y-3 pl-0 mb-6" role="list">
              {[
                [T("funktionFar"), T("funktionFarDesc")],
                [T("funktionMid"), T("funktionMidDesc")],
                [T("funktionNear"), T("funktionNearDesc")],
                [T("funktionVeryNear"), T("funktionVeryNearDesc")],
              ].map(([label, desc]) => (
                <li key={label} className="border-l-4 border-accent pl-4 py-1">
                  <strong>{label}:</strong> {desc}
                </li>
              ))}
            </ul>
            <p className="font-semibold">{T("funktionOutro")}</p>
          </RevealSection>
        </section>

        {/* Einsatz */}
        <div className="section-divider" aria-hidden="true" />
        <section id="einsatz" aria-labelledby="einsatz-heading" className="py-section section-alt">
          <RevealSection className="container max-w-4xl">
            <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
              <h2 id="einsatz-heading" className="text-heading text-primary">{T("einsatzHeading")}</h2>
              <ReadAloudButton label={T("einsatzReadAloud")} text={einsatzReadText} lang={lang} />
            </div>
            <p className="mb-4">{T("einsatzIntro")}</p>
            <div className="space-y-0 border-t-2 border-border">
              <ExpandableSection title={T("einsatzIndoor")} defaultOpen>
                <ul className="list-none space-y-2 pl-0" role="list">
                  <li>— {T("einsatzIndoor1")}</li>
                  <li>— {T("einsatzIndoor2")}</li>
                  <li>— {T("einsatzIndoor3")}</li>
                </ul>
              </ExpandableSection>
              <ExpandableSection title={T("einsatzOutdoor")}>
                <ul className="list-none space-y-2 pl-0" role="list">
                  <li>— {T("einsatzOutdoor1")}</li>
                  <li>— {T("einsatzOutdoor2")}</li>
                  <li>— {T("einsatzOutdoor3")}</li>
                </ul>
              </ExpandableSection>
              <ExpandableSection title={T("einsatzSafety")}>
                <ul className="list-none space-y-2 pl-0" role="list">
                  <li>— {T("einsatzSafety1")}</li>
                  <li>— {T("einsatzSafety2")}</li>
                  <li>— {T("einsatzSafety3")}</li>
                </ul>
              </ExpandableSection>
            </div>
          </RevealSection>
        </section>

        {/* Was SensiGlove NICHT macht */}
        <div className="section-divider" aria-hidden="true" />
        <section aria-labelledby="nicht-heading" className="py-section">
          <RevealSection className="container max-w-4xl">
            <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
              <h2 id="nicht-heading" className="text-heading text-primary">{T("nichtHeading")}</h2>
              <ReadAloudButton label={T("nichtReadAloud")} text={`${T("nichtHeading")}. ${T("nicht1")}. ${T("nicht2")}. ${T("nicht3")}. ${T("nicht4")}. ${T("nicht5")}. ${T("nichtOutro")}`} lang={lang} />
            </div>
            <ul className="list-none space-y-3 pl-0 mb-6" role="list">
              <li>— {T("nicht1")}</li>
              <li>— {T("nicht2")}</li>
              <li>— {T("nicht3")}</li>
              <li>— {T("nicht4")}</li>
              <li>— {T("nicht5")}</li>
            </ul>
            <p className="font-semibold">{T("nichtOutro")}</p>
          </RevealSection>
        </section>

        {/* Vergleich zum Blindenstock */}
        <div className="section-divider" aria-hidden="true" />
        <section id="vergleich" aria-labelledby="vergleich-heading" className="py-section section-alt">
          <RevealSection className="container max-w-4xl">
            <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
              <h2 id="vergleich-heading" className="text-heading text-primary">{T("vergleichHeading")}</h2>
              <ReadAloudButton label={T("vergleichReadAloud")} text={vergleichReadText} lang={lang} />
            </div>
            <p className="mb-4">{T("vergleichIntro")}</p>
            <p className="mb-8 font-semibold">{T("vergleichQuote")}</p>
            <div className="space-y-0 border-t-2 border-border">
              <ExpandableSection title={T("vgl1Title")} defaultOpen>
                <p className="mb-2">{T("vgl1Text")}</p>
                <p className="font-semibold">{T("vgl1Consequence")}</p>
              </ExpandableSection>
              <ExpandableSection title={T("vgl2Title")}>
                <p className="mb-2">{T("vgl2Text")}</p>
                <p className="font-semibold">{T("vgl2Consequence")}</p>
              </ExpandableSection>
              <ExpandableSection title={T("vgl3Title")}>
                <p className="mb-2">{T("vgl3Text")}</p>
                <p className="font-semibold">{T("vgl3Consequence")}</p>
              </ExpandableSection>
              <ExpandableSection title={T("vgl4Title")}>
                <p className="mb-2">{T("vgl4Text")}</p>
                <p className="font-semibold">{T("vgl4Consequence")}</p>
              </ExpandableSection>
              <ExpandableSection title={T("vgl5Title")}>
                <p className="mb-2">{T("vgl5Text")}</p>
                <p className="font-semibold">{T("vgl5Consequence")}</p>
              </ExpandableSection>
              <ExpandableSection title={T("vgl6Title")}>
                <p className="mb-2">{T("vgl6Text")}</p>
                <p className="font-semibold">{T("vgl6Consequence")}</p>
              </ExpandableSection>
            </div>
          </RevealSection>
        </section>

        {/* Contact */}
        <div className="section-divider" aria-hidden="true" />
        <section id="kontakt" aria-labelledby="kontakt-heading" className="py-section">
          <RevealSection className="container max-w-4xl">
            <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
              <h2 id="kontakt-heading" className="text-heading text-primary">{T("kontaktHeading")}</h2>
              <ReadAloudButton label={T("kontaktReadAloud")} text={kontaktReadText} lang={lang} />
            </div>
            <div className="flex items-start gap-8">
              <div className="flex-1">
                <p className="mb-4">{T("kontaktIntro")}</p>
                <ul className="list-none space-y-3 pl-0" role="list">
                  <li>
                    — {T("kontaktEmail")}:{" "}
                    <a href="mailto:sensigloveofficial@gmail.com" className="text-primary underline underline-offset-4 hover:opacity-80 transition-opacity">
                      sensigloveofficial@gmail.com
                    </a>
                  </li>
                  <li>
                    — {T("kontaktInstagram")}:{" "}
                    <a href="https://www.instagram.com/sensiglove" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4 hover:opacity-80 transition-opacity">
                      @sensiglove
                    </a>
                  </li>
                </ul>
              </div>
              <img src={logo} alt="SensiGlove Logo" className="w-28 h-28 rounded-xl opacity-80 flex-shrink-0" />
            </div>
          </RevealSection>
        </section>

        {/* Team */}
        <div className="section-divider" aria-hidden="true" />
        <TeamSection lang={lang} />
      </main>

      {/* Footer */}
      <footer role="contentinfo" className="border-t-2 border-border py-10 bg-card">
        <div className="container max-w-4xl flex flex-col items-center gap-4 text-center text-muted-foreground">
          <div className="flex items-center gap-6 text-sm">
            <a href="mailto:sensigloveofficial@gmail.com" className="hover:text-primary transition-colors underline-offset-4 hover:underline">
              sensigloveofficial@gmail.com
            </a>
            <span aria-hidden="true">·</span>
            <a href="https://www.instagram.com/sensiglove" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors underline-offset-4 hover:underline">
              Instagram
            </a>
          </div>
          <p className="text-sm">© 2026 SensiGlove. {T("footerRights")}</p>
          <button
            onClick={() => setShowShortcuts(true)}
            className="text-xs text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
          >
            {T("shortcutHint")}
          </button>
        </div>
      </footer>

      <BackToTop lang={lang} />

      <AuthDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        lang={lang}
        onAuthenticated={(email) => setCurrentUser(email)}
      />

      {/* Keyboard shortcut help dialog */}
      <Dialog open={showShortcuts} onOpenChange={setShowShortcuts}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{T("shortcutTitle")}</DialogTitle>
            <DialogDescription>{T("shortcutDescription")}</DialogDescription>
          </DialogHeader>
          <ul className="space-y-2 text-sm">
            {[
              { keys: ["?"], label: T("shortcutHelp") },
              { keys: ["+", "="], label: T("shortcutFontUp") },
              { keys: ["−"], label: T("shortcutFontDown") },
              { keys: ["D"], label: T("shortcutDark") },
              { keys: ["L"], label: T("shortcutLang") },
              { keys: ["T"], label: T("shortcutTop") },
            ].map(({ keys, label }) => (
              <li key={label} className="flex items-center justify-between gap-4 py-1 border-b border-border last:border-0">
                <span>{label}</span>
                <span className="flex gap-1">
                  {keys.map((k) => (
                    <kbd key={k} className="px-2 py-0.5 rounded border-2 border-border bg-muted text-foreground font-mono text-xs">
                      {k}
                    </kbd>
                  ))}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground mt-2">{T("shortcutClose")}</p>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
