import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Cpu,
  ArrowLeft,
  ShieldCheck,
  ChevronDown,
  Activity,
  Award,
  Settings,
  Sliders,
  BellRing
} from 'lucide-react';

// Local database and emulator operations
import {
  db,
  auth,
  seedDatabaseIfEmpty,
  IMAGES,
  collection,
  doc,
  onSnapshot,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from './lib/firebase';

// Custom Type declarations
import { PortfolioItem, Machine, WorkshopSettings } from './types';

// Child components
import Navbar from './components/Navbar';
import ServicesSection from './components/ServicesSection';
import PortfolioSection from './components/PortfolioSection';
import MachinesSection from './components/MachinesSection';
import AboutSection from './components/AboutSection';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';
import ContactModal from './components/ContactModal';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });

  // Database states
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [settings, setSettings] = useState<WorkshopSettings>({
    address: 'تهران، شهرک صنعتی شمس‌آباد، بلوار بوستان، گلسار ۵، پلاک ۱۰۲۸',
    phone: '۰۲۱-۵۵۵۷۹۲۶۲',
    email: 'info@ryancnc.com',
    workingHours: 'شنبه تا چهارشنبه: ۷:۰۰ صبح تا ۵:۰۰ بعد از ظهر | پنجشنبه‌ها: با هماهنگی قبلی',
    tagline: 'سرآمدی در تراشکاری سوئیسی و ماشینکاری CNC در سطح میکرون',
    description: 'رایان CNC خدمات مهندسی و ساخت قطعات با دقت فوق‌العاده بالا را برای صنایع پزشکی، خودروسازی و تجهیزات سفارشی ارائه می‌دهد. ما با استفاده از مدرن‌ترین مراکز ماشینکاری سوئیسی با دکل متحرک (Sliding Headstock)، بالاترین کیفیت و تلرانس را تضمین می‌کنیم.',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('hero');

  // UI state overlays
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactPrefills, setContactPrefills] = useState({
    subject: '',
    itemType: 'general' as 'general' | 'part' | 'machine',
    itemName: '',
  });

  // Success Toast state
  const [showToast, setShowToast] = useState(false);

  // Apply theme to document html and body elements
  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#0a0a0c';
      document.body.style.color = '#f4f4f5';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#f8fafc';
      document.body.style.color = '#0f172a';
    }
  }, [theme]);

  // Seeding and subscribing on Mount
  useEffect(() => {
    let unsubscribePortfolio = () => {};
    let unsubscribeMachines = () => {};
    let unsubscribeSettings = () => {};

    const bootApp = async () => {
      try {
        // 1. Seed the database if collections are empty
        await seedDatabaseIfEmpty();

        // 2. Real-time subscribe to Portfolio collection
        unsubscribePortfolio = onSnapshot(collection(db, 'portfolio'), (snapshot) => {
          const fetched: PortfolioItem[] = [];
          snapshot.forEach((doc) => {
            fetched.push({ id: doc.id, ...doc.data() } as PortfolioItem);
          });
          setPortfolioItems(fetched);
        });

        // 3. Real-time subscribe to Machines collection
        unsubscribeMachines = onSnapshot(collection(db, 'machines'), (snapshot) => {
          const fetched: Machine[] = [];
          snapshot.forEach((doc) => {
            fetched.push({ id: doc.id, ...doc.data() } as Machine);
          });
          setMachines(fetched);
        });

        // 4. Real-time subscribe to Settings config
        unsubscribeSettings = onSnapshot(doc(db, 'settings', 'config'), (docSnap) => {
          if (docSnap.exists()) {
            setSettings(docSnap.data() as WorkshopSettings);
          }
        });

        setIsLoading(false);
      } catch (err) {
        console.error('Error booting CNC app: ', err);
        setIsLoading(false); // Graceful fallback
      }
    };

    bootApp();

    // 5. Auth state listener
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAdminLoggedIn(true);
      } else {
        setIsAdminLoggedIn(false);
      }
    });

    return () => {
      unsubscribePortfolio();
      unsubscribeMachines();
      unsubscribeSettings();
      unsubscribeAuth();
    };
  }, []);

  // Sync scroll positions for active sections
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120; // offset
      const sections = ['hero', 'services', 'portfolio', 'machines', 'about'];

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAdminClick = async () => {
    if (isAdminLoggedIn) {
      setIsAdminPanelOpen(true);
      return;
    }

    const password = prompt('لطفاً رمز عبور ورود به پرتال مدیریت را وارد کنید:');
    if (password === null) return;

    const correctPassword = settings.adminPasscode;
    if (!correctPassword) {
      alert('رمز عبور مدیریت تنظیم نشده است.');
      return;
    }
    if (password === correctPassword) {
      setIsAdminPanelOpen(true);
      setIsAdminLoggedIn(true);
      
      try {
        const targetEmail = 'admin@ryancnc.com';
        try {
          await signInWithEmailAndPassword(auth, targetEmail, password);
        } catch (err) {
          try {
            await createUserWithEmailAndPassword(auth, targetEmail, password);
          } catch (signupErr) {
            console.warn('Fallback local session activated', signupErr);
          }
        }
      } catch (authErr) {
        console.error('Auth error: ', authErr);
      }
    } else {
      alert('رمز عبور نادرست است.');
    }
  };

  // Keyboard shortcut to open the hidden admin panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + Alt + A
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        handleAdminClick();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings.adminPasscode, isAdminLoggedIn]);

  const handleOpenContact = (
    subject: string,
    itemType: 'general' | 'part' | 'machine' = 'general',
    itemName: string = ''
  ) => {
    setContactPrefills({ subject, itemType, itemName });
    setIsContactModalOpen(true);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsAdminLoggedIn(false);
      alert('خروج با موفقیت انجام شد. پرتال امن مدیریت بسته شد.');
    } catch (err) {
      console.error(err);
    }
  };

  const triggerToast = () => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

  if (isLoading) {
    return (
      <div className={`flex h-screen w-screen flex-col items-center justify-center gap-4 ${
        theme === 'dark' ? 'bg-[#0a0a0c] text-zinc-100' : 'bg-slate-50 text-slate-900'
      }`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
          className="text-amber-500"
        >
          <Cpu className="h-12 w-12" />
        </motion.div>
        <span className={`text-sm tracking-widest animate-pulse font-sans ${
          theme === 'dark' ? 'text-zinc-400' : 'text-slate-600'
        }`}>
          در حال راه‌اندازی اسپیندل و تنظیم محورها...
        </span>
        <div className={`text-[10px] font-sans ${
          theme === 'dark' ? 'text-zinc-650' : 'text-slate-400'
        }`}>کارگاه تخصصی ماشینکاری دقیق رایان CNC</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen select-none font-sans transition-colors duration-300 ${
      theme === 'dark' ? 'bg-[#0a0a0c] text-zinc-100' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* Dynamic Header Navbar */}
      <Navbar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onAdminClick={handleAdminClick}
        isAdminLoggedIn={isAdminLoggedIn}
        onLogout={handleLogout}
        theme={theme}
        setTheme={setTheme}
        settings={settings}
      />

      {/* Hero Section */}
      <section
        id="hero"
        className={`relative flex min-h-screen items-center justify-center pt-24 pb-16 overflow-hidden border-b ${
          theme === 'dark'
            ? 'border-zinc-900 bg-gradient-to-b from-[#0a0a0c] via-[#0a0a0c] to-zinc-950 text-zinc-100'
            : 'border-slate-200 bg-gradient-to-b from-slate-50 via-slate-50 to-slate-100 text-slate-900'
        }`}
      >
        {/* Background micro grid */}
        <div className={`pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#141417_1px,transparent_1px),linear-gradient(to_bottom,#141417_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] ${
          theme === 'dark' ? 'opacity-40' : 'opacity-[0.08]'
        }`} />
        
        {/* Decorative laser horizontal rule */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero text panel (Left) */}
          <div className="lg:col-span-7 flex flex-col items-start text-right">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`inline-flex items-center gap-2 rounded-sm border px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-wider text-amber-500 backdrop-blur-xs ${
                theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <Activity className="h-3.5 w-3.5 animate-pulse text-amber-500" />
              <span>مرکز ماشینکاری پیشرفته سوئیسی دکل متحرک (Sliding Headstock)</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className={`mt-6 font-sans text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl leading-none ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}
            >
              رایان <span className="text-amber-500">CNC</span> <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
                دقت در سطح
              </span> میکرون
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className={`mt-6 text-lg font-sans max-w-xl leading-relaxed ${
                theme === 'dark' ? 'text-zinc-400' : 'text-slate-650'
              }`}
            >
              {settings.tagline || 'سرآمدی در تراشکاری سوئیسی و ماشینکاری CNC در سطح میکرون'}
              <br />
              <span className={`text-sm mt-2 block font-normal leading-relaxed ${
                theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'
              }`}>
                متخصصین پیمانکاری مهندسی برای ایمپلنت‌های پزشکی، قطعات خودروسازی و قطعات سفارشی با تلرانس بسیار دقیق. پردازش نقشه‌های دستی یا طراحی‌های دو بعدی به مشخصات دقیق تحت معیارهای کیفی سخت‌گیرانه.
              </span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex flex-wrap gap-4 w-full sm:w-auto"
            >
              <button
                onClick={() => {
                  const element = document.getElementById('portfolio');
                  if (element) {
                    window.scrollTo({
                      top: element.offsetTop - 80,
                      behavior: 'smooth',
                    });
                  }
                }}
                className="group flex flex-1 sm:flex-initial items-center justify-center gap-2 rounded-sm bg-amber-500 px-6 py-3 font-sans text-xs uppercase tracking-wider font-semibold text-black shadow-lg transition-all hover:bg-amber-400 cursor-pointer"
              >
                مشاهده نمونه کارها
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              </button>
              
              <button
                onClick={() => {
                  const element = document.getElementById('about');
                  if (element) {
                    window.scrollTo({
                      top: element.offsetTop - 80,
                      behavior: 'smooth',
                    });
                  }
                }}
                className={`flex flex-1 sm:flex-initial items-center justify-center rounded-sm border px-6 py-3 font-sans text-xs uppercase tracking-wider transition cursor-pointer ${
                  theme === 'dark'
                    ? 'border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:text-white hover:border-zinc-700'
                    : 'border-slate-200 bg-white text-slate-700 hover:text-slate-900 hover:border-slate-300 shadow-xs'
                }`}
              >
                تماس با واحد مهندسی
              </button>
            </motion.div>

            {/* Micro indicators under CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className={`mt-12 flex items-center gap-6 border-t pt-6 w-full max-w-md font-sans text-[10px] uppercase tracking-wider ${
                theme === 'dark' ? 'border-zinc-900 text-zinc-500' : 'border-slate-200 text-slate-500'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-amber-500" />
                <span>منطبق با استاندارد AS9100 Rev D</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Award className="h-4 w-4 text-amber-500" />
                <span>تلرانس در سطح ±۱.۵ میکرون</span>
              </div>
            </motion.div>
          </div>

          {/* Cinematic scope image display (Right) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-5 relative hidden lg:block"
          >
            {/* Corner scope brackets */}
            <div className="absolute -top-3 -left-3 h-6 w-6 border-t-2 border-l-2 border-amber-500/50" />
            <div className="absolute -top-3 -right-3 h-6 w-6 border-t-2 border-r-2 border-amber-500/50" />
            <div className="absolute -bottom-3 -left-3 h-6 w-6 border-b-2 border-l-2 border-amber-500/50" />
            <div className="absolute -bottom-3 -right-3 h-6 w-6 border-b-2 border-r-2 border-amber-500/50" />

            {/* Target Reticle Indicator overlay */}
            <div className={`absolute inset-0 border pointer-events-none rounded-sm z-10 ${
              theme === 'dark' ? 'border-zinc-800' : 'border-slate-300'
            }`} />

            {/* Scope crosshair center indicator */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10 text-amber-500/20">
              <span className="font-sans text-[8px] tracking-widest">سیستم تمرکز خودکار فعال</span>
            </div>

            {/* Actual Hero Image */}
            <div className={`aspect-4/3 overflow-hidden rounded-sm shadow-2xl relative border ${
              theme === 'dark' ? 'bg-zinc-950 border-zinc-900' : 'bg-slate-100 border-slate-200'
            }`}>
              <img
                src={IMAGES.hero}
                alt="رایان CNC"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover object-center saturate-110 contrast-105"
              />
              {/* Dark vignette bottom shade */}
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
              
              {/* Spindle live feed stats overlay */}
              <div className={`absolute bottom-4 right-4 font-sans text-[9px] rounded px-2.5 py-1 backdrop-blur-xs border text-right ${
                theme === 'dark'
                  ? 'text-amber-400/80 bg-zinc-950/80 border-zinc-800'
                  : 'text-amber-600 bg-white/90 border-slate-200 shadow-xs'
              }`}>
                <div>نرخ پیشروی: ۰.۰۵ میلی‌متر/دور</div>
                <div>سرعت اسپیندل: ۱۰,۰۰۰ دور در دقیقه</div>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Floating scroll down chevron */}
        <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce pointer-events-none ${
          theme === 'dark' ? 'text-zinc-650' : 'text-slate-400'
        }`}>
          <ChevronDown className="h-6 w-6" />
        </div>
      </section>

      {/* Services Section */}
      <ServicesSection onContactClick={handleOpenContact} theme={theme} />

      {/* Portfolio Section */}
      <PortfolioSection items={portfolioItems} onContactClick={handleOpenContact} theme={theme} />

      {/* Machines Section */}
      <MachinesSection machines={machines} onContactClick={handleOpenContact} theme={theme} />

      {/* About Us Section */}
      <AboutSection settings={settings} onSuccessToast={triggerToast} theme={theme} />

      {/* Footer Section */}
      <Footer
        onAdminClick={handleAdminClick}
        address={settings.address}
        phone={settings.phone}
        email={settings.email}
        theme={theme}
        isAdminLoggedIn={isAdminLoggedIn}
        settings={settings}
      />

      {/* Admin Panel Sliding Overlay Drawer */}
      <AnimatePresence>
        {isAdminPanelOpen && (
          <AdminPanel
            portfolioItems={portfolioItems}
            machines={machines}
            settings={settings}
            onClose={() => setIsAdminPanelOpen(false)}
            onRefreshData={() => {}}
            isAdminLoggedIn={isAdminLoggedIn}
            setIsAdminLoggedIn={setIsAdminLoggedIn}
            theme={theme}
          />
        )}
      </AnimatePresence>

      {/* Contact Inquiry Modal */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        prefilledSubject={contactPrefills.subject}
        prefilledItemType={contactPrefills.itemType}
        prefilledItemName={contactPrefills.itemName}
        theme={theme}
      />

      {/* Global Toast Alert for Contact inquiries */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-6 left-1/2 z-50 flex items-center gap-3 rounded-sm border border-amber-950 bg-zinc-950 px-5 py-3 shadow-2xl font-sans text-xs text-white"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/10 text-amber-400">
              <BellRing className="h-3 w-3 animate-ring" />
            </div>
            <span>پیام ارسال شد: درخواست قیمت شما توسط مهندسی رایان CNC دریافت گردید.</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
