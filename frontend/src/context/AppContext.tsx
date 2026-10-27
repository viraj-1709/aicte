import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, UserSession, Lang, Theme } from '../types';
import { translations, LANGUAGE_OPTIONS } from '../locales';
import { en } from '../locales/en';

interface AppContextType {
  // Authentication
  user: UserSession | null;
  login: (session: UserSession) => void;
  logout: () => void;
  role: UserRole;
  setRole: (r: UserRole) => void;
  lockoutCount: number;
  recordFailedLogin: () => number;
  resetFailedLogins: () => void;

  // Language & RTL
  lang: Lang;
  setLang: (l: Lang) => void;
  t: typeof en;
  isRTL: boolean;
  // Theme
  theme: Theme;
  toggleTheme: () => void;

  // Active Application Selection
  selectedAppId: string;
  setSelectedAppId: (id: string) => void;

  // Modals & Overlays
  isTamperDemoOpen: boolean;
  setIsTamperDemoOpen: (open: boolean) => void;
  isAuditModalOpen: boolean;
  setIsAuditModalOpen: (open: boolean) => void;
  isLinkGraphOpen: boolean;
  setIsLinkGraphOpen: (open: boolean) => void;
  isModelCardOpen: boolean;
  setIsModelCardOpen: (open: boolean) => void;
  isHealthCheckOpen: boolean;
  setIsHealthCheckOpen: (open: boolean) => void;
  isTourOpen: boolean;
  setIsTourOpen: (open: boolean) => void;
  reasonForAccessAppId: string | null;
  setReasonForAccessAppId: (id: string | null) => void;

  // Toast Notifications
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Auth state: default seeded to Officer for demo, or null for login
  const [user, setUser] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('aicte_session');
    if (saved) {
      try { return JSON.parse(saved); } catch (_) {}
    }
    // Default to Officer session so reviewer can jump right in or test login screen
    return {
      id: 'OFFICER-001',
      name: 'Dr. S. K. Sharma',
      email: 'officer.sharma@aicte.gov.in',
      role: 'OFFICER',
      designation: 'Regional Scrutiny Officer (Northern Regional Office)'
    };
  });

  const [lockoutCount, setLockoutCount] = useState<number>(0);

  // 2. Language state (defaults to browser language or English)
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem('aicte_lang') as Lang;
    return saved && translations[saved] ? saved : 'en';
  });

  const isRTL = lang === 'ur';

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem('aicte_lang', newLang);
  };

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang, isRTL]);

  // 3. Theme: Light and Dark only
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('aicte_theme') as Theme;
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setThemeState(next);
    localStorage.setItem('aicte_theme', next);
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // 4. Clear any stored font-size preference on load so old values cannot affect the layout
  useEffect(() => {
    try {
      localStorage.removeItem('aicte_text_size');
      document.documentElement.classList.remove('text-size-large');
    } catch (_) {}
  }, []);


  // 5. Active Case Dossier
  const [selectedAppId, setSelectedAppId] = useState<string>('AICTE-2026-APEX-TAMPERED');

  // 6. Modals
  const [isTamperDemoOpen, setIsTamperDemoOpen] = useState<boolean>(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [isLinkGraphOpen, setIsLinkGraphOpen] = useState<boolean>(false);
  const [isModelCardOpen, setIsModelCardOpen] = useState<boolean>(false);
  const [isHealthCheckOpen, setIsHealthCheckOpen] = useState<boolean>(false);
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);
  const [reasonForAccessAppId, setReasonForAccessAppId] = useState<string | null>(null);

  // 7. Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const login = (session: UserSession) => {
    setUser(session);
    setLockoutCount(0);
    localStorage.setItem('aicte_session', JSON.stringify(session));
    showToast(`Logged in successfully as ${session.name} (${session.role})`);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('aicte_session');
    showToast('Logged out of the platform.');
  };

  const recordFailedLogin = () => {
    const next = lockoutCount + 1;
    setLockoutCount(next);
    return next;
  };

  const resetFailedLogins = () => setLockoutCount(0);

  const role = user?.role || 'OFFICER';

  const setRole = (newRole: UserRole) => {
    if (user) {
      const updated = { ...user, role: newRole };
      setUser(updated);
      localStorage.setItem('aicte_session', JSON.stringify(updated));
    }
  };

  const t = translations[lang] || en;

  return (
    <AppContext.Provider
      value={{
        user,
        login,
        logout,
        role,
        setRole,
        lockoutCount,
        recordFailedLogin,
        resetFailedLogins,
        lang,
        setLang,
        t,
        isRTL,
        theme,
        toggleTheme,
        selectedAppId,
        setSelectedAppId,
        isTamperDemoOpen,
        setIsTamperDemoOpen,
        isAuditModalOpen,
        setIsAuditModalOpen,
        isLinkGraphOpen,
        setIsLinkGraphOpen,
        isModelCardOpen,
        setIsModelCardOpen,
        isHealthCheckOpen,
        setIsHealthCheckOpen,
        isTourOpen,
        setIsTourOpen,
        reasonForAccessAppId,
        setReasonForAccessAppId,
        toastMessage,
        showToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
