import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, User } from '../types';
import { translations, getTranslation } from '../translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['en']) => string;
  user: User | null;
  setUser: (u: User | null) => void;
  loginModalOpen: boolean;
  setLoginModalOpen: (open: boolean) => void;
  logout: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('kisan_lang');
    return (saved as Language) || 'en';
  });

  const [user, setUserState] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('kisan_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('kisan_lang', lang);
  };

  const setUser = (u: User | null) => {
    setUserState(u);
    if (u) {
      localStorage.setItem('kisan_user', JSON.stringify(u));
    } else {
      localStorage.removeItem('kisan_user');
    }
  };

  const logout = () => {
    setUser(null);
  };

  const t = (key: keyof typeof translations['en']) => {
    return getTranslation(language, key);
  };

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage,
      t,
      user,
      setUser,
      loginModalOpen,
      setLoginModalOpen,
      logout
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
