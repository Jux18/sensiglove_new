import { useState, useCallback, useEffect } from "react";
import { Volume2, VolumeOff } from "lucide-react";
import { Lang, t } from "@/lib/translations";

interface ReadAloudButtonProps {
  text: string;
  label?: string;
  lang?: Lang;
}

const VOICE_LOCALE: Record<Lang, string> = {
  de: "de-DE",
  en: "en-US",
};

/**
 * Replace "SensiGlove" with a phonetic approximation for TTS.
 * German TTS needs the brand split into speakable syllables,
 * and English TTS must not read the camelCase as one merged word.
 */
function ttsText(text: string, lang: Lang): string {
  const brand = lang === "de" ? "Sennsi Glahv" : "Sensi Glove";
  const wifi = lang === "en" ? "Wi Fi" : "WLAN";

  return text
    .replace(/SensiGlove/gi, brand)
    .replace(/Wi[- ]?Fi/gi, wifi);
}

/**
 * Pick a voice that actually matches the requested language.
 * Without this, the browser may fall back to the system default voice
 * (e.g. a German voice reading English text with German pronunciation).
 */
function pickVoice(lang: Lang): SpeechSynthesisVoice | null {
  if (!("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const exactLocale = VOICE_LOCALE[lang].toLowerCase();
  const acceptedLangPrefix = lang === "en" ? "en" : "de";
  const matches = voices.filter((v) => v.lang.toLowerCase().startsWith(acceptedLangPrefix));

  if (!matches.length) return null;

  const exactLocal = matches.find((v) => v.localService && v.lang.toLowerCase() === exactLocale);
  const exactAny = matches.find((v) => v.lang.toLowerCase() === exactLocale);
  const local = matches.find((v) => v.localService);
  return exactLocal ?? exactAny ?? local ?? matches[0];
}

function waitForVoice(lang: Lang): Promise<SpeechSynthesisVoice | null> {
  const voice = pickVoice(lang);
  if (voice) return Promise.resolve(voice);

  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      const loadedVoice = pickVoice(lang);
      if (!loadedVoice) return;
      settled = true;
      window.clearTimeout(timeout);
      window.speechSynthesis.removeEventListener?.("voiceschanged", finish);
      resolve(loadedVoice);
    };

    const timeout = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      window.speechSynthesis.removeEventListener?.("voiceschanged", finish);
      resolve(pickVoice(lang));
    }, 1500);

    window.speechSynthesis.addEventListener?.("voiceschanged", finish);
    window.speechSynthesis.getVoices();
  });
}

const ReadAloudButton = ({ text, label, lang = "de" }: ReadAloudButtonProps) => {
  const [speaking, setSpeaking] = useState(false);

  // Trigger voices to load (some browsers populate voices asynchronously)
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const loadVoices = () => window.speechSynthesis.getVoices();
    loadVoices();
    const fallback = window.setTimeout(loadVoices, 250);
    const handler = () => loadVoices();
    window.speechSynthesis.addEventListener?.("voiceschanged", handler);
    return () => {
      window.clearTimeout(fallback);
      window.speechSynthesis.removeEventListener?.("voiceschanged", handler);
    };
  }, []);

  const handleClick = useCallback(async () => {
    if (!("speechSynthesis" in window)) return;

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(ttsText(text, lang));
    utterance.lang = VOICE_LOCALE[lang];
    utterance.rate = 0.95;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);

    const voice = await waitForVoice(lang);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    }

    window.speechSynthesis.speak(utterance);
  }, [text, speaking, lang]);

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={speaking ? t("readAloudStopAria", lang) : (label || t("readAloudDefaultAria", lang))}
      className="inline-flex items-center gap-2 rounded-md border-2 border-primary bg-card px-3 py-2 text-sm font-semibold text-primary hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {speaking ? (
        <>
          <VolumeOff size={20} aria-hidden="true" />
          <span>{t("readAloudStop", lang)}</span>
        </>
      ) : (
        <>
          <Volume2 size={20} aria-hidden="true" />
          <span>{t("readAloudLabel", lang)}</span>
        </>
      )}
    </button>
  );
};

export default ReadAloudButton;
