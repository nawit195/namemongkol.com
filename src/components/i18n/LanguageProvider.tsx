import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "TH" | "EN";

type Ctx = { lang: Lang; setLang: (l: Lang) => void; toggle: () => void };

const LanguageContext = createContext<Ctx | null>(null);

const STORAGE_KEY = "mxi.lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("TH");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Lang | null;
      if (saved === "TH" || saved === "EN") setLangState(saved);
    } catch {
      /* ignore storage errors */
    }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore storage errors */
    }
  };

  return (
    <LanguageContext.Provider
      value={{ lang, setLang, toggle: () => setLang(lang === "TH" ? "EN" : "TH") }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): Ctx {
  const ctx = useContext(LanguageContext);
  if (!ctx) return { lang: "TH", setLang: () => {}, toggle: () => {} };
  return ctx;
}

export function t<T>(lang: Lang, th: T, en: T): T {
  return lang === "EN" ? en : th;
}
