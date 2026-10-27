import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LANGUAGE_OPTIONS } from '../locales';
import { 
  ShieldCheck, 
  Sun, 
  Moon, 
  Type, 
  Globe2, 
  Eye, 
  EyeOff, 
  Lock, 
  User, 
  Building2, 
  Phone, 
  Mail, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { UserRole } from '../types';
import { AicteLogo } from '../components/AicteLogo';

export const LoginPage: React.FC = () => {
  const { 
    login, 
    lang, 
    setLang, 
    theme, 
    toggleTheme, 
t, 
    showToast,
    lockoutCount,
    recordFailedLogin
  } = useApp();

  const [activeTab, setActiveTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [selectedRole, setSelectedRole] = useState<UserRole>('OFFICER');

  // Form Fields
  const [email, setEmail] = useState('officer.sharma@aicte.gov.in');
  const [password, setPassword] = useState('Officer@123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Registration Fields
  const [regName, setRegName] = useState('');
  const [regInstitution, setRegInstitution] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Demo Credentials Accordion
  const [showDemoCredentials, setShowDemoCredentials] = useState(true);

  // Quick fill handler
  const handleFillDemo = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage(null);
    if (role === 'OFFICER') {
      setEmail('officer.sharma@aicte.gov.in');
      setPassword('Officer@123');
    } else if (role === 'APPLICANT') {
      setEmail('applicant@apexeducation.org');
      setPassword('Applicant@123');
    } else {
      setEmail('admin.director@aicte.gov.in');
      setPassword('Admin@123');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    if (lockoutCount >= 5) {
      setErrorMessage(t.auth.lockoutWarning);
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      // Validate credentials
      const valid = 
        (email.includes('officer') && password === 'Officer@123') ||
        (email.includes('applicant') && password === 'Applicant@123') ||
        (email.includes('admin') && password === 'Admin@123');

      if (valid) {
        let name = 'Dr. S. K. Sharma';
        let designation = 'Regional Scrutiny Officer';
        let inst = undefined;

        if (selectedRole === 'APPLICANT') {
          name = 'Prof. R. C. Verma';
          designation = 'Authorized Signatory';
          inst = 'Apex Institute of Technology & Research';
        } else if (selectedRole === 'ADMIN') {
          name = 'Dr. M. P. Poonia';
          designation = 'Council Director (Approvals)';
        }

        login({
          id: `${selectedRole}-${Date.now()}`,
          name,
          email,
          role: selectedRole,
          designation,
          institution_name: inst
        });
      } else {
        const attempts = recordFailedLogin();
        if (attempts >= 5) {
          setErrorMessage(t.auth.lockoutWarning);
        } else {
          setErrorMessage(`Invalid credentials for ${selectedRole}. (${5 - attempts} attempts remaining before lockout).`);
        }
      }
    }, 600);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regInstitution || !regEmail || !regMobile || !regPassword) {
      setErrorMessage('Please fill in all mandatory registration fields.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      login({
        id: `APPLICANT-${Date.now()}`,
        name: regName,
        email: regEmail,
        role: 'APPLICANT',
        designation: 'Authorized Institutional Signatory',
        institution_name: regInstitution
      });
      showToast('Registration successful! Redirected to Institutional Portal.');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col justify-between selection:bg-govNavy-100 dark:selection:bg-govNavy-800">
      {/* National Tricolor Strip */}
      <div className="w-full flex h-1.5 shrink-0" aria-hidden="true">
        <div className="flex-1 bg-[#FF9933]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#138808]" />
      </div>

      {/* 1. Official Header Bar */}
      <header className="bg-govNavy-900 text-white border-b border-govNavy-950 px-4 sm:px-8 py-3.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AicteLogo size="login" />
            <div className="hidden">
              <ShieldCheck className="w-5 h-5 text-govSaffron-500" />
            </div>
            <div>
              <div className="font-bold text-sm sm:text-base tracking-tight">
                {t.auth.title}
              </div>
              <div className="text-[11px] text-govNavy-200">
                {t.auth.subtitle}
              </div>
            </div>
          </div>

          {/* Accessibility & Multilingual Toolbar */}
          <div className="flex items-center space-x-2 sm:space-x-3 text-xs">
            {/* Language Switcher Dropdown */}
            <div className="flex items-center bg-govNavy-800 border border-govNavy-700 rounded px-2 py-1">
              <Globe2 className="w-3.5 h-3.5 mr-1.5 text-govNavy-300" />
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as any)}
                className="bg-transparent text-white text-xs font-medium focus:outline-none cursor-pointer"
                aria-label={t.header.langLabel}
              >
                {LANGUAGE_OPTIONS.map((opt) => (
                  <option key={opt.code} value={opt.code} className="bg-slate-900 text-white">
                    {opt.nativeName} ({opt.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Light / Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded bg-govNavy-800 hover:bg-govNavy-700 border border-govNavy-700 text-govNavy-200 hover:text-white transition-colors"
              title={theme === 'dark' ? t.header.themeLight : t.header.themeDark}
              aria-label={theme === 'dark' ? t.header.themeLight : t.header.themeDark}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* 2. Decision Support Banner */}
      <div className="bg-amber-50 dark:bg-amber-950/60 border-b border-amber-200 dark:border-amber-900 px-4 py-2 text-xs text-amber-900 dark:text-amber-200">
        <div className="max-w-7xl mx-auto flex items-center space-x-2">
          <Info className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
          <span className="font-semibold">{t.auth.decisionPrinciple}</span>
        </div>
      </div>

      {/* 3. Main Center Form Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-md shadow-sm overflow-hidden">
          {/* Top Role Selector Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
            <button
              type="button"
              onClick={() => { setActiveTab('LOGIN'); setErrorMessage(null); }}
              className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 transition-colors ${
                activeTab === 'LOGIN'
                  ? 'border-govNavy-900 dark:border-blue-500 text-govNavy-900 dark:text-blue-400 bg-white dark:bg-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {t.auth.loginTab}
            </button>
            <button
              type="button"
              onClick={() => { 
                setActiveTab('REGISTER'); 
                setSelectedRole('APPLICANT');
                setErrorMessage(null); 
              }}
              className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 transition-colors ${
                activeTab === 'REGISTER'
                  ? 'border-govNavy-900 dark:border-blue-500 text-govNavy-900 dark:text-blue-400 bg-white dark:bg-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {t.auth.registerTab}
            </button>
          </div>

          <div className="p-6 sm:p-8 space-y-5">
            {/* Error Message Alert */}
            {errorMessage && (
              <div className="p-3 rounded bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-xs text-red-800 dark:text-red-200 flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* TAB 1: LOGIN */}
            {activeTab === 'LOGIN' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Role Selection Radios */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {t.auth.roleLabel}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'OFFICER', label: t.auth.roleOfficer },
                      { id: 'APPLICANT', label: t.auth.roleApplicant },
                      { id: 'ADMIN', label: t.auth.roleAdmin }
                    ].map(r => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => handleFillDemo(r.id as UserRole)}
                        className={`py-2 px-1 text-center text-xs font-semibold rounded border transition-colors ${
                          selectedRole === r.id
                            ? 'bg-govNavy-900 text-white border-govNavy-950 dark:bg-blue-600 dark:border-blue-500'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Email / Username Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email or Username
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t.auth.emailPlaceholder}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-govNavy-900 dark:focus:ring-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => showToast(t.auth.forgotPasswordModal)}
                      className="text-[11px] text-govNavy-700 dark:text-blue-400 hover:underline"
                    >
                      {t.auth.forgotPassword}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t.auth.passwordPlaceholder}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 pr-9 text-xs focus:ring-1 focus:ring-govNavy-900 dark:focus:ring-blue-500 focus:outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-govNavy-900 focus:ring-govNavy-900"
                  />
                  <label htmlFor="rememberMe" className="ml-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                    {t.auth.rememberMe}
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-govNavy-900 hover:bg-govNavy-800 text-white text-xs font-bold rounded shadow-sm transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isLoading && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  <span>{isLoading ? t.common.loading : t.auth.submitLogin}</span>
                </button>
              </form>
            ) : (
              /* TAB 2: REGISTER (Applicants Only) */
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.auth.nameLabel}
                  </label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Dr. Ramesh Chandra Verma"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-xs focus:outline-none focus:border-govNavy-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.auth.institutionLabel}
                  </label>
                  <input
                    type="text"
                    value={regInstitution}
                    onChange={(e) => setRegInstitution(e.target.value)}
                    placeholder="e.g. Apex Institute of Technology & Research"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-xs focus:outline-none focus:border-govNavy-900"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Official Email
                    </label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="principal@institution.edu.in"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-xs focus:outline-none focus:border-govNavy-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t.auth.mobileLabel}
                    </label>
                    <input
                      type="tel"
                      value={regMobile}
                      onChange={(e) => setRegMobile(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-xs focus:outline-none focus:border-govNavy-900"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-xs focus:outline-none focus:border-govNavy-900"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-govNavy-900 hover:bg-govNavy-800 text-white text-xs font-bold rounded shadow-sm transition-colors flex items-center justify-center space-x-2"
                >
                  {isLoading && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  <span>{isLoading ? t.common.loading : t.auth.submitRegister}</span>
                </button>
              </form>
            )}

            {/* Collapsible Demo Credentials Panel (Section 2.7) */}
            <div className="border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-xs">
              <button
                type="button"
                onClick={() => setShowDemoCredentials(!showDemoCredentials)}
                className="w-full p-2.5 flex items-center justify-between text-left font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              >
                <span>{t.auth.demoCredentialsTitle}</span>
                {showDemoCredentials ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showDemoCredentials && (
                <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2 text-[11px]">
                  <div 
                    onClick={() => handleFillDemo('OFFICER')}
                    className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-govNavy-700 cursor-pointer flex justify-between items-center"
                  >
                    <div>
                      <strong className="block text-slate-800 dark:text-slate-200">1. {t.auth.roleOfficer}</strong>
                      <span className="text-slate-500">officer.sharma@aicte.gov.in / Officer@123</span>
                    </div>
                    <span className="text-[10px] text-govNavy-700 dark:text-blue-400 font-bold">Use Credentials</span>
                  </div>

                  <div 
                    onClick={() => handleFillDemo('APPLICANT')}
                    className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-govNavy-700 cursor-pointer flex justify-between items-center"
                  >
                    <div>
                      <strong className="block text-slate-800 dark:text-slate-200">2. {t.auth.roleApplicant}</strong>
                      <span className="text-slate-500">applicant@apexeducation.org / Applicant@123</span>
                    </div>
                    <span className="text-[10px] text-govNavy-700 dark:text-blue-400 font-bold">Use Credentials</span>
                  </div>

                  <div 
                    onClick={() => handleFillDemo('ADMIN')}
                    className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-govNavy-700 cursor-pointer flex justify-between items-center"
                  >
                    <div>
                      <strong className="block text-slate-800 dark:text-slate-200">3. {t.auth.roleAdmin}</strong>
                      <span className="text-slate-500">admin.director@aicte.gov.in / Admin@123</span>
                    </div>
                    <span className="text-[10px] text-govNavy-700 dark:text-blue-400 font-bold">Use Credentials</span>
                  </div>
                </div>
              )}
            </div>

            {/* Privacy & Statutory Notice */}
            <p className="text-[10px] text-slate-500 dark:text-slate-400 text-center leading-relaxed">
              {t.auth.privacyNotice}
            </p>
          </div>
        </div>
      </main>

      {/* 4. Neutral Government Footer (Section 1 branding rule) */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-4 px-6 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© AICTE Application Validation Platform</span>
          <div className="flex items-center space-x-4 text-[11px]">
            <span>Helpdesk</span>
            <span>•</span>
            <span>Accessibility Statement</span>
            <span>•</span>
            <span>Statutory Privacy Policy</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
