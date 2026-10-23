import React, { createContext, useContext, useState, useEffect } from 'react';
import { en } from '../locales/en';
import { hi } from '../locales/hi';

type Role = 'OFFICER' | 'APPLICANT' | 'ADMIN' | 'EVALUATION';
type Lang = 'en' | 'hi';

interface AppContextType {
  role: Role;
  setRole: (r: Role) => void;
  lang: Lang;
  setLang: (l: Lang) => void;
  t: typeof en;
  selectedAppId: string;
  setSelectedAppId: (id: string) => void;
  isTamperDemoOpen: boolean;
  setIsTamperDemoOpen: (open: boolean) => void;
  isAuditModalOpen: boolean;
  setIsAuditModalOpen: (open: boolean) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<Role>('OFFICER');
  const [lang, setLang] = useState<Lang>('en');
  // Default to the tampered twin for instant WOW scrutiny demonstration!
  const [selectedAppId, setSelectedAppId] = useState<string>('AICTE-2026-APEX-TAMPERED');
  const [isTamperDemoOpen, setIsTamperDemoOpen] = useState<boolean>(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const t = lang === 'en' ? en : hi;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        lang,
        setLang,
        t,
        selectedAppId,
        setSelectedAppId,
        isTamperDemoOpen,
        setIsTamperDemoOpen,
        isAuditModalOpen,
        setIsAuditModalOpen,
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
