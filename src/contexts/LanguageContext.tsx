import { createContext, useContext, useState, ReactNode } from 'react';
import { Language, translations } from '../i18n/translations';

/**
 * Typ kontekstu języka
 */
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

/**
 * Provider kontekstu języka - dostarcza obsługę wielu języków
 * @param children - Komponenty potomne
 * @returns Element React
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem('language') as Language | null;
    if (stored) return stored;
    const browserLang = navigator.language.startsWith('pl') ? 'pl' : 'en';
    return browserLang;
  });

  const t = (path: string): string => {
    const keys = path.split('.');
    let current: any = translations[language];

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return path;
      }
    }

    return typeof current === 'string' ? current : path;
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Hook do dostępu do kontekstu języka
 * @throws Error jeśli użyty poza LanguageProvider
 * @returns Obiekt z aktualnym językiem i funkcjami do zarządzania
 */
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
