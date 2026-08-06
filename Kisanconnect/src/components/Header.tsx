import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../types';
import { Tractor, Globe, User as UserIcon, LogOut, Smartphone, CheckCircle, ChevronDown } from 'lucide-react';

export const Header: React.FC = () => {
  const { language, setLanguage, t, user, setLoginModalOpen, logout } = useLanguage();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const languages: { code: Language; label: string; native: string; flag: string }[] = [
    { code: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
    { code: 'hi', label: 'Hindi', native: 'हिंदी', flag: '🇮🇳' },
    { code: 'te', label: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
  ];

  const currentLangObj = languages.find(l => l.code === language) || languages[0];

  return (
    <header className="sticky top-0 z-40 bg-emerald-950/95 backdrop-blur text-white shadow-sm border-b border-emerald-800/60 w-full max-w-full overflow-x-clip">
      <div className="max-w-5xl mx-auto px-2 sm:px-3 py-2 flex items-center justify-between gap-1.5 sm:gap-2 min-w-0">
        
        {/* Logo & Brand */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 shrink">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-800/80 text-emerald-100 rounded-xl flex items-center justify-center font-bold shadow-inner border border-emerald-700/60 shrink-0">
            <Tractor className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
          </div>
          <div className="min-w-0 truncate">
            <div className="flex items-center gap-1.5">
              <h1 className="text-base sm:text-xl font-extrabold tracking-tight leading-tight text-white truncate">
                {t('appName')}
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-900 text-emerald-200 border border-emerald-700/50 shrink-0">
                <Smartphone className="w-3 h-3 text-emerald-300" />
                {t('pwaReady')}
              </span>
            </div>
            <p className="text-[11px] font-medium text-emerald-200/80 hidden sm:block truncate">
              {t('tagline')}
            </p>
          </div>
        </div>

        {/* Right Section: Language Selector + Auth Shell */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="min-h-[40px] sm:min-h-[44px] px-2 sm:px-3 py-1.5 sm:py-2 bg-emerald-900/80 hover:bg-emerald-900 text-white border border-emerald-700/60 rounded-xl flex items-center gap-1 sm:gap-2 font-bold text-xs shadow-sm transition-all active:scale-95"
              aria-label="Select Language"
            >
              <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-300" />
              <span className="font-bold text-emerald-100 text-xs">{currentLangObj.native}</span>
              <ChevronDown className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-300 transition-transform ${langDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {langDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setLangDropdownOpen(false)} 
                />
                <div className="absolute right-0 mt-2 w-44 sm:w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden py-1">
                  <div className="px-3 py-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-950 border-b border-slate-800">
                    Language / भाषा / భాష
                  </div>
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs font-bold flex items-center justify-between transition-colors min-h-[40px] ${
                        language === lang.code 
                          ? 'bg-emerald-800 text-white font-extrabold' 
                          : 'text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <span>{lang.native}</span>
                      {language === lang.code && (
                        <CheckCircle className="w-4 h-4 text-emerald-300 stroke-[2.5]" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Authentication Button / Profile */}
          {user ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-emerald-200">
                  {user.name}
                </span>
                <span className="text-[10px] text-emerald-300/80">
                  📍 {user.village}
                </span>
              </div>
              <button
                onClick={logout}
                title={t('logout')}
                className="min-h-[40px] sm:min-h-[44px] min-w-[40px] sm:min-w-[44px] px-2.5 sm:px-3 py-1.5 sm:py-2 bg-rose-900/80 hover:bg-rose-900 text-rose-100 rounded-xl font-bold text-xs flex items-center justify-center gap-1 border border-rose-700/60 shadow-sm active:scale-95"
              >
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-200" />
                <span className="hidden sm:inline">{t('logout')}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setLoginModalOpen(true)}
              className="min-h-[40px] sm:min-h-[44px] px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 sm:gap-1.5 shadow-sm border border-emerald-700 active:scale-95"
            >
              <UserIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
              <span>{t('login')}</span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
};
