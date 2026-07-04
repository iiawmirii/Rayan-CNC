import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Settings, Cpu, ShieldAlert, Sun, Moon } from 'lucide-react';

import { WorkshopSettings } from '../types';

interface NavbarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  onAdminClick: () => void;
  isAdminLoggedIn: boolean;
  onLogout: () => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  settings?: WorkshopSettings;
}

export default function Navbar({
  activeSection,
  setActiveSection,
  onAdminClick,
  isAdminLoggedIn,
  onLogout,
  theme,
  setTheme,
  settings,
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [clicks, setClicks] = useState(0);
  const [clickTimeout, setClickTimeout] = useState<any>(null);

  const handleLogoClick = () => {
    if (clickTimeout) clearTimeout(clickTimeout);
    
    const newCount = clicks + 1;
    if (newCount >= 5) {
      setClicks(0);
      const password = prompt('لطفاً رمز عبور ورود به پرتال مدیریت را وارد کنید:');
      const correctPass = settings?.adminPasscode || 'RyanCNC2026!';
      if (password === correctPass) {
        onAdminClick();
      } else if (password !== null) {
        alert('رمز عبور نادرست است.');
      }
    } else {
      setClicks(newCount);
      const t = setTimeout(() => setClicks(0), 3000);
      setClickTimeout(t);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'services', label: 'خدمات ما' },
    { id: 'portfolio', label: 'نمونه کارها' },
    { id: 'machines', label: 'فروش ماشین‌آلات' },
    { id: 'about', label: 'درباره ما' },
  ];

  const handleNavClick = (id: string) => {
    setActiveSection(id);
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // height of sticky header
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 right-0 left-0 z-40 transition-all duration-300 ${
          isScrolled
            ? theme === 'dark'
              ? 'border-b border-zinc-900 bg-[#0a0a0c]/90 shadow-lg backdrop-blur-md'
              : 'border-b border-slate-200 bg-white/90 shadow-sm backdrop-blur-md'
            : 'bg-transparent'
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <div
              onClick={handleLogoClick}
              className="flex cursor-pointer items-center gap-3 select-none"
              title="رایان CNC - برای ورود به پرتال مدیریت ۵ بار کلیک کنید"
            >
              <div className={`relative flex h-10 w-10 items-center justify-center rounded-sm border shadow-inner ${
                theme === 'dark' ? 'border-zinc-800 bg-zinc-900' : 'border-slate-200 bg-white'
              }`}>
                {/* Lathe/Spindle rotating animation */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
                  className="text-amber-500"
                >
                  <Cpu className="h-6 w-6" />
                </motion.div>
                <div className="absolute inset-0 rounded-sm bg-amber-500/5 mix-blend-color-dodge" />
              </div>
              <div>
                <span className={`font-sans text-xl font-black uppercase tracking-wider ${
                  theme === 'dark' ? 'text-white' : 'text-slate-900'
                }`}>
                  رایان <span className="text-amber-500">CNC</span>
                </span>
                <div className={`font-sans text-[9px] tracking-widest ${
                  theme === 'dark' ? 'text-zinc-500' : 'text-slate-450'
                }`}>
                  تراشکاری دقیق سوئیسی
                </div>
              </div>
            </div>

            {/* Desktop Nav Items */}
            <div className="hidden items-center gap-8 md:flex">
              {navItems.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`relative font-sans text-xs uppercase tracking-widest transition-colors duration-200 py-2 cursor-pointer ${
                      isActive
                        ? theme === 'dark' ? 'text-white font-medium' : 'text-slate-900 font-bold'
                        : theme === 'dark' ? 'text-zinc-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <motion.div
                        layoutId="activeNavLine"
                        className="absolute bottom-0 right-0 left-0 h-[2px] bg-amber-500"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}

              {/* Theme Switcher Button */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={`rounded-sm p-2 transition cursor-pointer ${
                  theme === 'dark' ? 'text-zinc-400 hover:text-white hover:bg-zinc-900' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
                aria-label="تغییر پوسته"
              >
                {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
              </button>

              {/* Secure Admin CTA */}
              <div className={`flex items-center gap-2 border-r pr-6 ${
                theme === 'dark' ? 'border-zinc-800' : 'border-slate-200'
              }`}>
                {isAdminLoggedIn && (
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 font-sans text-xs text-amber-500 animate-pulse">
                      <ShieldAlert className="h-3 w-3" /> پرتال مدیریت
                    </span>
                    <button
                      onClick={onAdminClick}
                      className={`rounded-sm px-3 py-1.5 font-sans text-xs transition cursor-pointer ${
                        theme === 'dark' ? 'bg-zinc-800 text-white hover:bg-zinc-700' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                      }`}
                    >
                      داشبورد
                    </button>
                    <button
                      onClick={onLogout}
                      className={`font-sans text-xs transition cursor-pointer ${
                        theme === 'dark' ? 'text-zinc-500 hover:text-red-400' : 'text-slate-450 hover:text-red-600'
                      }`}
                    >
                      خروج
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-4 md:hidden">
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={`rounded-sm p-2 transition cursor-pointer ${
                  theme === 'dark' ? 'text-zinc-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                }`}
                aria-label="تغییر پوسته"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              {isAdminLoggedIn && (
                <span className="font-sans text-[10px] text-amber-500 flex items-center gap-1">
                  <ShieldAlert className="h-3 w-3" /> مدیر
                </span>
              )}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`focus:outline-none cursor-pointer ${
                  theme === 'dark' ? 'text-zinc-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className={`border-b md:hidden ${
                theme === 'dark' ? 'border-zinc-900 bg-[#0a0a0c]' : 'border-slate-200 bg-white shadow-lg'
              }`}
            >
              <div className="space-y-2 px-4 pt-2 pb-6">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`block w-full py-2.5 text-right font-sans text-sm uppercase tracking-wider cursor-pointer ${
                      activeSection === item.id
                        ? 'text-amber-500 font-bold'
                        : theme === 'dark' ? 'text-zinc-300' : 'text-slate-700 hover:text-slate-950'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
                {isAdminLoggedIn && (
                  <div className={`border-t pt-4 mt-2 ${theme === 'dark' ? 'border-zinc-900' : 'border-slate-250'}`}>
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          onAdminClick();
                        }}
                        className="w-full rounded-sm bg-amber-500 py-2 text-center font-sans text-xs text-black font-semibold cursor-pointer"
                      >
                        داشبورد مدیریت
                      </button>
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          onLogout();
                        }}
                        className={`w-full rounded-sm py-2 text-center font-sans text-xs border cursor-pointer ${
                          theme === 'dark' ? 'border-zinc-800 text-zinc-400 bg-zinc-900/50' : 'border-slate-200 text-slate-500 bg-slate-50'
                        }`}
                      >
                        خروج از سیستم
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}
