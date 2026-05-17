import React from 'react';
import { ChevronLeft, Compass, Sun, Moon } from 'lucide-react';
import { Locale, t } from '../i18n';

const Header: React.FC<{ 
  onBack?: () => void; 
  showBack: boolean; 
  theme: 'dark' | 'light'; 
  onToggleTheme: () => void;
  locale: Locale;
  onToggleLocale: (l: Locale) => void;
}> = ({ onBack, showBack, theme, onToggleTheme, locale, onToggleLocale }) => (
  <header className="flex items-center justify-between mb-6 sm:mb-12 h-10 shrink-0 z-20 gap-2 w-full">
    <div className="flex items-center gap-2 shrink-0">
      {showBack && (
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-lg hover:bg-white/5 transition-colors flex items-center gap-1 sm:gap-2 text-sm font-medium text-slate-400"
          aria-label={t(locale, 'common.back')}
        >
          <ChevronLeft size={18} />
          <span className="tracking-widest uppercase text-[10px]">{t(locale, 'common.back')}</span>
        </button>
      )}
      {!showBack && (
        <div className="flex items-center gap-2 sm:gap-3 text-blue-400 shrink-0">
          <div className="relative hidden sm:block">
            <Compass size={20} className="animate-pulse" />
            <div className="absolute inset-0 bg-blue-400/20 blur-lg rounded-full" />
          </div>
          <span className="font-bold tracking-[0.1em] sm:tracking-[0.2em] uppercase text-xs sm:text-sm truncate">{t(locale, 'brand')}</span>
        </div>
      )}
    </div>

    <div className="flex items-center gap-1 sm:gap-2">
      {/* Language Switcher */}
      <div className="flex items-center bg-white/5 rounded-full p-1 mr-1 sm:mr-2">
        {(['zh-TW', 'ja', 'en'] as Locale[]).map((l) => (
          <button
            key={l}
            onClick={() => onToggleLocale(l)}
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
              locale === l
                ? "bg-blue-500/20 text-blue-400 shadow-sm"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {l === 'zh-TW' ? '繁' : l === 'ja' ? '日' : 'EN'}
          </button>
        ))}
      </div>

      <button
        onClick={onToggleTheme}
        className="p-2 rounded-full glass-button text-slate-400 hover:text-blue-400 transition-colors"
        aria-label="Toggle Theme"
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </div>
  </header>
);

export default Header;
