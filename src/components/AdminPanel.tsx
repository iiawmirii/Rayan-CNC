import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock,
  LayoutDashboard,
  FolderOpen,
  Wrench,
  Settings,
  MailOpen,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  FileText,
  Eye,
  LogOut,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { PortfolioItem, Machine, WorkshopSettings, Inquiry } from '../types';
import {
  db,
  auth,
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from '../lib/firebase';

// Presets images for easy admin testing
import medicalPart from '../assets/images/medical_part_1783177405661.jpg';
import automotivePart from '../assets/images/automotive_part_1783177414751.jpg';
import swissLathe from '../assets/images/swiss_lathe_1783177425450.jpg';
import cncHero from '../assets/images/cnc_hero_1783177395125.jpg';

const IMAGE_PRESETS = [
  { name: 'Medical Part Preset', url: medicalPart },
  { name: 'Automotive Part Preset', url: automotivePart },
  { name: 'Swiss Lathe Preset', url: swissLathe },
  { name: 'CNC Workshop Hero Preset', url: cncHero },
];

interface AdminPanelProps {
  portfolioItems: PortfolioItem[];
  machines: Machine[];
  settings: WorkshopSettings;
  onClose: () => void;
  onRefreshData: () => void;
  isAdminLoggedIn: boolean;
  setIsAdminLoggedIn: (loggedIn: boolean) => void;
  theme: 'light' | 'dark';
}

export default function AdminPanel({
  portfolioItems,
  machines,
  settings,
  onClose,
  onRefreshData,
  isAdminLoggedIn,
  setIsAdminLoggedIn,
  theme,
}: AdminPanelProps) {
  // Authentication states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);

  // Active tab inside panel
  const [activeTab, setActiveTab] = useState<'portfolio' | 'machines' | 'settings' | 'inquiries'>('portfolio');

  // List of inquiries
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  // Item editing states
  const [isEditingPortfolio, setIsEditingPortfolio] = useState(false);
  const [editingPortfolioId, setEditingPortfolioId] = useState<string | null>(null);
  const [portfolioForm, setPortfolioForm] = useState({
    title: '',
    category: 'Medical Parts',
    description: '',
    specifications: '',
    imageUrl: '',
  });

  const [isEditingMachine, setIsEditingMachine] = useState(false);
  const [editingMachineId, setEditingMachineId] = useState<string | null>(null);
  const [machineForm, setMachineForm] = useState({
    model: '',
    year: '',
    price: '',
    specifications: '',
    imageUrl: '',
    status: 'available' as 'available' | 'sold',
  });

  const [settingsForm, setSettingsForm] = useState<WorkshopSettings>({
    address: '',
    phone: '',
    email: '',
    workingHours: '',
    tagline: '',
    description: '',
    adminPasscode: '',
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Load inquiries and settings on login
  useEffect(() => {
    if (isAdminLoggedIn) {
      setSettingsForm({
        ...settings,
        adminPasscode: settings.adminPasscode || '',
      });

      // Listen to inquiries in real-time
      const q = query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetched: Inquiry[] = [];
        snapshot.forEach((doc) => {
          fetched.push({ id: doc.id, ...doc.data() } as Inquiry);
        });
        setInquiries(fetched);
      });

      return () => unsubscribe();
    }
  }, [isAdminLoggedIn, settings]);

  // Handle Login Flow
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthenticating(true);

    if (isLockedOut) {
      setAuthError('تعداد تلاش‌های ناموفق بیش از حد مجاز است. لطفاً چند لحظه صبر کنید.');
      setIsAuthenticating(false);
      return;
    }

    const targetEmail = email || 'admin@ryancnc.com';
    const loginPassword = password || passcode;

    const correctPass = settings.adminPasscode;
    if (!correctPass) {
      setAuthError('رمز عبور مدیریت تنظیم نشده است.');
      setIsAuthenticating(false);
      return;
    }

    if (loginPassword === correctPass) {
      try {
        await signInWithEmailAndPassword(auth, targetEmail, loginPassword);
      } catch (err: any) {
        try {
          await createUserWithEmailAndPassword(auth, targetEmail, loginPassword);
        } catch (signupErr) {
          console.warn('Authentication fallback activated. Using local session.', signupErr);
        }
      }
      setLoginAttempts(0);
      setIsAdminLoggedIn(true);
      setIsAuthenticating(false);
      return;
    }

    const newAttempts = loginAttempts + 1;
    setLoginAttempts(newAttempts);

    if (newAttempts >= 5) {
      setIsLockedOut(true);
      setAuthError('تعداد تلاش‌های ناموفق بیش از حد مجاز است. ۶۰ ثانیه صبر کنید.');
      setTimeout(() => {
        setIsLockedOut(false);
        setLoginAttempts(0);
      }, 60000);
      setIsAuthenticating(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, targetEmail, loginPassword);
      setLoginAttempts(0);
      setIsAdminLoggedIn(true);
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || 'Invalid credentials.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout error: ', err);
    }
    setIsAdminLoggedIn(false);
  };

  // Portfolio Management
  const handleSavePortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portfolioForm.title || !portfolioForm.description || !portfolioForm.imageUrl) {
      alert('Please fill out all required fields');
      return;
    }

    const docId = editingPortfolioId || `p-${Date.now()}`;
    const itemData = {
      id: docId,
      ...portfolioForm,
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'portfolio', docId), itemData);
      setIsEditingPortfolio(false);
      setEditingPortfolioId(null);
      setPortfolioForm({
        title: '',
        category: 'Medical Parts',
        description: '',
        specifications: '',
        imageUrl: '',
      });
      onRefreshData();
    } catch (err) {
      console.error('Error saving portfolio: ', err);
      alert('Permission Denied or Error saving to database. Ensure you are signed in as verified admin.');
    }
  };

  const handleDeletePortfolio = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this portfolio item?')) return;
    try {
      await deleteDoc(doc(db, 'portfolio', id));
      onRefreshData();
    } catch (err) {
      console.error('Error deleting: ', err);
      alert('Error deleting portfolio item.');
    }
  };

  const handleEditPortfolioClick = (item: PortfolioItem) => {
    setEditingPortfolioId(item.id);
    setPortfolioForm({
      title: item.title,
      category: item.category,
      description: item.description,
      specifications: item.specifications || '',
      imageUrl: item.imageUrl,
    });
    setIsEditingPortfolio(true);
  };

  // Machine Management
  const handleSaveMachine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!machineForm.model || !machineForm.year || !machineForm.price || !machineForm.imageUrl) {
      alert('Please fill out all required fields');
      return;
    }

    const docId = editingMachineId || `m-${Date.now()}`;
    const machineData = {
      id: docId,
      ...machineForm,
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'machines', docId), machineData);
      setIsEditingMachine(false);
      setEditingMachineId(null);
      setMachineForm({
        model: '',
        year: '',
        price: '',
        specifications: '',
        imageUrl: '',
        status: 'available',
      });
      onRefreshData();
    } catch (err) {
      console.error('Error saving machine: ', err);
      alert('Error saving machine to database.');
    }
  };

  const handleDeleteMachine = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this machine?')) return;
    try {
      await deleteDoc(doc(db, 'machines', id));
      onRefreshData();
    } catch (err) {
      console.error('Error deleting machine: ', err);
      alert('Error deleting machine.');
    }
  };

  const handleEditMachineClick = (machine: Machine) => {
    setEditingMachineId(machine.id);
    setMachineForm({
      model: machine.model,
      year: machine.year,
      price: machine.price,
      specifications: machine.specifications || '',
      imageUrl: machine.imageUrl,
      status: machine.status,
    });
    setIsEditingMachine(true);
  };

  const toPersianDigits = (str: string): string => {
    const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return str.replace(/[0-9]/g, (w) => farsiDigits[parseInt(w, 10)]);
  };

  // Workshop Settings Update
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);

    const formattedForm = {
      ...settingsForm,
      workingHours: toPersianDigits(settingsForm.workingHours || ''),
      phone: toPersianDigits(settingsForm.phone || ''),
    };

    try {
      await setDoc(doc(db, 'settings', 'config'), formattedForm);
      onRefreshData();
      alert('تنظیمات کارگاه با موفقیت بروزرسانی شد!');
    } catch (err) {
      console.error('Error saving settings: ', err);
      alert('خطا در ذخیره تنظیمات در پایگاه داده.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    if (!window.confirm('Delete this inquiry record?')) return;
    try {
      await deleteDoc(doc(db, 'inquiries', id));
    } catch (err) {
      console.error('Error deleting inquiry: ', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#0a0a0c]/80 backdrop-blur-md" onClick={onClose} />

      {/* Slide-out Panel container */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`relative ml-auto flex h-full w-full max-w-5xl flex-col border-l shadow-2xl ${
          theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header bar */}
        <div className={`flex items-center justify-between border-b px-6 py-4 flex-row-reverse ${
          theme === 'dark' ? 'border-zinc-800 bg-zinc-950' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-3 flex-row-reverse">
            <div className={`flex h-10 w-10 items-center justify-center rounded-sm border text-amber-500 ${
              theme === 'dark' ? 'border-zinc-800 bg-zinc-900' : 'border-slate-200 bg-white'
            }`}>
              <Lock className="h-5 w-5" />
            </div>
            <div className="text-right">
              <h2 className={`text-lg font-bold font-sans ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}>
                رایان CNC - پنل مدیریت کارگاه
              </h2>
              <p className={`text-xs font-sans uppercase tracking-widest ${
                theme === 'dark' ? 'text-zinc-500' : 'text-slate-400'
              }`}>
                {isAdminLoggedIn ? 'وضعیت: دسترسی مجاز (مدیر کارگاه)' : 'وضعیت: درگاه امن مسدود شده'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`rounded-sm border p-2 transition cursor-pointer ${
              theme === 'dark'
                ? 'border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900'
                : 'border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!isAdminLoggedIn ? (
          /* Login Portal interface */
          <div className={`flex flex-1 items-center justify-center p-6 text-right ${
            theme === 'dark' ? 'bg-radial-at-t from-zinc-900 via-zinc-950 to-zinc-950' : 'bg-slate-100'
          }`}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`w-full max-w-md rounded-sm border p-6 md:p-8 backdrop-blur-sm ${
                theme === 'dark' ? 'border-zinc-800 bg-zinc-900/40' : 'border-slate-200 bg-white shadow-xl'
              }`}
            >
              <div className="text-center mb-8">
                <span className="font-sans text-xs text-amber-500 uppercase tracking-widest block font-bold">
                  درگاه امن تأیید هویت کارگاه
                </span>
                <h3 className={`mt-2 text-2xl font-black font-sans ${
                  theme === 'dark' ? 'text-white' : 'text-slate-900'
                }`}>
                  ورود مدیر سیستم
                </h3>
                <p className={`mt-1 text-xs font-sans ${
                  theme === 'dark' ? 'text-zinc-500' : 'text-slate-550'
                }`}>
                  هرگونه تلاش غیرمجاز برای اتصال به پایگاه داده کالیبراسیون ثبت و مسدود می‌شود.
                </p>
              </div>

              {authError && (
                <div className="mb-4 flex items-start gap-2.5 rounded-sm border border-red-955 bg-red-955/30 p-3.5 text-xs text-red-400 font-sans flex-row-reverse text-right">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className={`block font-sans text-xs uppercase tracking-wider text-right ${
                    theme === 'dark' ? 'text-zinc-400' : 'text-slate-600'
                  }`}>
                    نشانی ایمیل مدیر
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@ryancnc.com"
                    className={`mt-1 w-full rounded-sm border px-4 py-2.5 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none text-sm font-sans text-right ${
                      theme === 'dark'
                        ? 'border-zinc-800 bg-zinc-950 text-white placeholder-zinc-700'
                        : 'border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block font-sans text-xs uppercase tracking-wider text-right ${
                    theme === 'dark' ? 'text-zinc-400' : 'text-slate-600'
                  }`}>
                    گذرواژه ارشد مدیریت
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="کلمه عبور مدیریت یا رمز عبور سریع را وارد کنید"
                    className={`mt-1 w-full rounded-sm border px-4 py-2.5 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none text-sm font-sans text-right ${
                      theme === 'dark'
                        ? 'border-zinc-800 bg-zinc-950 text-white placeholder-zinc-700'
                        : 'border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="w-full flex items-center justify-center gap-2 rounded-sm bg-amber-500 py-3 font-sans text-xs uppercase tracking-widest font-bold text-black transition hover:bg-amber-400 disabled:opacity-50 cursor-pointer"
                >
                  <Lock className="h-4 w-4" />
                  {isAuthenticating ? 'در حال رمزگشایی کدهای دسترسی...' : 'بررسی هویت و ورود به سیستم'}
                </button>
              </form>
            </motion.div>
          </div>
        ) : (
          /* Logged In Admin Panel */
          <div className="flex flex-1 overflow-hidden flex-row-reverse text-right">
            {/* Sidebar Tabs */}
            <div className={`w-56 border-l py-6 flex flex-col justify-between text-right ${
              theme === 'dark' ? 'border-zinc-800 bg-zinc-950' : 'border-slate-200 bg-slate-50'
            }`}>
              <div className="space-y-1 px-3">
                <button
                  onClick={() => setActiveTab('portfolio')}
                  className={`flex w-full items-center gap-2.5 rounded-sm px-3.5 py-2.5 text-right font-sans text-xs uppercase tracking-wider transition cursor-pointer flex-row-reverse justify-end ${
                    activeTab === 'portfolio'
                      ? 'bg-amber-500 text-black font-bold'
                      : theme === 'dark'
                        ? 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                        : 'text-slate-650 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  <FolderOpen className="h-4 w-4" />
                  نمونه کارها
                </button>
                <button
                  onClick={() => setActiveTab('machines')}
                  className={`flex w-full items-center gap-2.5 rounded-sm px-3.5 py-2.5 text-right font-sans text-xs uppercase tracking-wider transition cursor-pointer flex-row-reverse justify-end ${
                    activeTab === 'machines'
                      ? 'bg-amber-500 text-black font-bold'
                      : theme === 'dark'
                        ? 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                        : 'text-slate-650 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  <Wrench className="h-4 w-4" />
                  ماشین‌آلات فروشی
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`flex w-full items-center gap-2.5 rounded-sm px-3.5 py-2.5 text-right font-sans text-xs uppercase tracking-wider transition cursor-pointer flex-row-reverse justify-end ${
                    activeTab === 'settings'
                      ? 'bg-amber-500 text-black font-bold'
                      : theme === 'dark'
                        ? 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                        : 'text-slate-650 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  <Settings className="h-4 w-4" />
                  تنظیمات کارگاه
                </button>
                <button
                  onClick={() => setActiveTab('inquiries')}
                  className={`flex w-full items-center gap-2.5 rounded-sm px-3.5 py-2.5 text-right font-sans text-xs uppercase tracking-wider transition relative cursor-pointer flex-row-reverse justify-end ${
                    activeTab === 'inquiries'
                      ? 'bg-amber-500 text-black font-bold'
                      : theme === 'dark'
                        ? 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                        : 'text-slate-650 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  <MailOpen className="h-4 w-4" />
                  <span>پیام‌ها و استعلام‌ها</span>
                  {inquiries.length > 0 && (
                    <span className="absolute left-3.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 font-sans text-[9px] font-bold text-white">
                      {inquiries.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Logout CTA */}
              <div className="px-3">
                <button
                  onClick={handleLogout}
                  className={`flex w-full items-center gap-2.5 rounded-sm px-3.5 py-2.5 text-right font-sans text-xs uppercase tracking-wider transition cursor-pointer flex-row-reverse justify-end ${
                    theme === 'dark'
                      ? 'text-zinc-500 hover:text-red-400 hover:bg-red-955/20'
                      : 'text-slate-500 hover:text-red-600 hover:bg-red-50'
                  }`}
                >
                  <LogOut className="h-4 w-4" />
                  خروج از پنل
                </button>
              </div>
            </div>

            {/* Dashboard content Panel */}
            <div className={`flex-1 overflow-y-auto p-6 md:p-8 ${
              theme === 'dark' ? 'bg-zinc-950/20' : 'bg-slate-50'
            }`}>
              
              {/* Tab: Portfolio */}
              {activeTab === 'portfolio' && (
                <div className="text-right font-sans">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6 flex-row-reverse text-right">
                    <div className="text-right">
                      <h3 className="text-xl font-extrabold text-white">مدیریت محصولات و نمونه کارها</h3>
                      <p className="text-xs text-zinc-400 font-sans">افزودن، ویرایش یا حذف نمونه قطعات تولیدی نمایش داده شده در سایت.</p>
                    </div>
                    {!isEditingPortfolio && (
                      <button
                        onClick={() => {
                          setEditingPortfolioId(null);
                          setPortfolioForm({
                            title: '',
                            category: 'Medical Parts',
                            description: '',
                            specifications: '',
                            imageUrl: '',
                          });
                          setIsEditingPortfolio(true);
                        }}
                        className="flex items-center gap-1.5 rounded-sm bg-amber-500 px-3 py-1.5 font-sans text-xs uppercase tracking-wider font-bold text-black transition hover:bg-amber-400 cursor-pointer flex-row-reverse"
                      >
                        <Plus className="h-4 w-4" /> <span>افزودن قطعه جدید</span>
                      </button>
                    )}
                  </div>

                  {isEditingPortfolio ? (
                    <form onSubmit={handleSavePortfolio} className="space-y-5 rounded-sm border border-zinc-800 bg-zinc-900/60 p-6 text-right font-sans">
                      <div className="flex justify-between items-center border-b border-zinc-800 pb-3 mb-2 flex-row-reverse">
                        <span className="font-sans text-xs font-bold text-amber-500 uppercase tracking-widest">
                          {editingPortfolioId ? 'ویرایش مشخصات قطعه کارگاه' : 'ثبت قطعه تولیدی جدید'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsEditingPortfolio(false)}
                          className="text-zinc-500 hover:text-white cursor-pointer"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-right">
                        <div>
                          <label className="block font-sans text-xs uppercase tracking-wider text-zinc-455 text-right">
                            نام قطعه / عنوان طرح *
                          </label>
                          <input
                            type="text"
                            required
                            value={portfolioForm.title}
                            onChange={(e) => setPortfolioForm({ ...portfolioForm, title: e.target.value })}
                            placeholder="مثال: پیچ استخوان ارتوپدی تیتانیومی"
                            className="mt-1 w-full rounded-sm border border-zinc-800 bg-zinc-950 px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-sm font-sans text-right"
                          />
                        </div>
                        <div>
                          <label className="block font-sans text-xs uppercase tracking-wider text-zinc-455 text-right">
                            دسته‌بندی صنعتی قطعه *
                          </label>
                          <select
                            value={portfolioForm.category}
                            onChange={(e) => setPortfolioForm({ ...portfolioForm, category: e.target.value })}
                            className="mt-1 w-full rounded-sm border border-zinc-800 bg-zinc-950 px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-sm font-sans text-right"
                          >
                            <option value="Medical Parts">قطعات تجهیزات پزشکی (Medical Parts)</option>
                            <option value="Automotive Parts">قطعات خودرویی و صنایع سنگین (Automotive Parts)</option>
                            <option value="Special/Custom Parts">قطعات سفارشی و خاص (Special/Custom Parts)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block font-sans text-xs uppercase tracking-wider text-zinc-455 text-right">
                          توضیحات کلی قطعه *
                        </label>
                        <textarea
                          required
                          rows={3}
                          value={portfolioForm.description}
                          onChange={(e) => setPortfolioForm({ ...portfolioForm, description: e.target.value })}
                          placeholder="توضیح دهید که این قطعه در چه زمینه‌ای کاربرد دارد و چه فرآیند تراشکاری روی آن انجام شده..."
                          className="mt-1 w-full rounded-sm border border-zinc-800 bg-zinc-950 px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-sm font-sans text-right"
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 text-right">
                        <div>
                          <label className="block font-sans text-xs uppercase tracking-wider text-zinc-455 text-right">
                            مشخصات مهندسی دقیق (آلیاژ، تلرانس، فینیش...)
                          </label>
                          <textarea
                            rows={5}
                            value={portfolioForm.specifications}
                            onChange={(e) => setPortfolioForm({ ...portfolioForm, specifications: e.target.value })}
                            placeholder="جنس آلیاژ: تیتانیوم گرید ۵&#10;تلرانس نهایی: ±۲.۵ میکرون&#10;عملیات پرداخت: اسید شویی شده"
                            className="mt-1 w-full rounded-sm border border-zinc-800 bg-zinc-950 px-3 py-2 text-amber-500 font-sans text-xs focus:outline-none focus:border-amber-500 text-right"
                          />
                        </div>

                        <div>
                          <label className="block font-sans text-xs uppercase tracking-wider text-zinc-455 mb-1 text-right">
                            نشانی تصویر قطعه *
                          </label>
                          <input
                            type="text"
                            required
                            value={portfolioForm.imageUrl}
                            onChange={(e) => setPortfolioForm({ ...portfolioForm, imageUrl: e.target.value })}
                            placeholder="آدرس اینترنتی عکس را وارد کنید یا یکی از پیش‌فرض‌های زیر را انتخاب کنید"
                            className="w-full rounded-sm border border-zinc-800 bg-zinc-950 px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-xs mb-3 font-sans text-right"
                          />
                          <span className="font-sans text-[9px] uppercase tracking-wider text-zinc-500 block mb-1">
                            یا انتخاب تصویر آماده باکیفیت:
                          </span>
                          <div className="grid grid-cols-2 gap-2">
                            {IMAGE_PRESETS.map((preset, pIdx) => (
                              <button
                                key={pIdx}
                                type="button"
                                onClick={() => setPortfolioForm({ ...portfolioForm, imageUrl: preset.url })}
                                className={`flex items-center gap-1.5 rounded-sm border bg-zinc-950 p-2 text-right transition cursor-pointer flex-row-reverse justify-end ${
                                  portfolioForm.imageUrl === preset.url
                                    ? 'border-amber-500 text-amber-500 font-bold'
                                    : 'border-zinc-800 text-zinc-400 hover:border-zinc-700'
                                }`}
                              >
                                <img
                                  src={preset.url}
                                  alt={preset.name}
                                  referrerPolicy="no-referrer"
                                  className="h-6 w-6 rounded-sm object-cover"
                                />
                                <span className="font-sans text-[10px] truncate">{preset.name === 'Medical Part Preset' ? 'پیش‌فرض قطعه پزشکی' : preset.name === 'Automotive Part Preset' ? 'پیش‌فرض قطعه خودرو' : preset.name === 'Swiss Lathe Preset' ? 'تراش سوئیسی' : 'کارگاه CNC'}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4 pt-2 flex-row-reverse">
                        <button
                          type="submit"
                          className="flex-1 rounded-sm bg-amber-500 py-2.5 font-sans text-xs uppercase tracking-wider font-bold text-black hover:bg-amber-400 transition cursor-pointer"
                        >
                          {editingPortfolioId ? 'اعمال بروزرسانی در پایگاه داده' : 'ذخیره قطعه در پایگاه داده'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingPortfolio(false)}
                          className="rounded-sm border border-zinc-800 px-6 py-2.5 font-sans text-xs uppercase tracking-wider text-zinc-400 hover:text-white hover:bg-zinc-950 transition cursor-pointer"
                        >
                          انصراف
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-3">
                      {portfolioItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-col sm:flex-row-reverse items-start sm:items-center justify-between gap-4 rounded-sm border border-zinc-800 bg-zinc-950 p-4 text-right"
                        >
                          <div className="flex items-center gap-4 flex-row-reverse">
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              referrerPolicy="no-referrer"
                              className="h-12 w-12 rounded-sm object-cover border border-zinc-800"
                            />
                            <div className="text-right">
                              <span className="font-sans text-[9px] uppercase tracking-wider text-amber-400 bg-zinc-900 border border-zinc-800 rounded-sm px-1.5 py-0.5 inline-block">
                                {item.category === 'Medical Parts' ? 'تجهیزات پزشکی' : item.category === 'Automotive Parts' ? 'صنایع خودرو' : 'قطعات سفارشی'}
                              </span>
                              <h4 className="text-md font-bold text-white mt-1 font-sans">{item.title}</h4>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 w-full sm:w-auto flex-row-reverse">
                            <button
                              onClick={() => handleEditPortfolioClick(item)}
                              className="flex flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-sm border border-zinc-800 px-3 py-1.5 font-sans text-xs text-zinc-300 hover:text-white hover:border-zinc-600 transition cursor-pointer"
                            >
                              <Edit className="h-3.5 w-3.5" /> ویرایش
                            </button>
                            <button
                              onClick={() => handleDeletePortfolio(item.id)}
                              className="flex flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-sm border border-red-955 px-3 py-1.5 font-sans text-xs text-red-500 hover:bg-red-955/20 transition cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> حذف
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {/* Tab: Machines */}
              {activeTab === 'machines' && (
                <div>
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6 flex-row-reverse">
                    <div className="text-right">
                      <h3 className="text-xl font-extrabold text-white font-sans">مدیریت ناوگان ماشین‌آلات CNC</h3>
                      <p className="text-xs text-zinc-400 font-sans mt-1">ماشین‌آلات موجود را ثبت، ویرایش یا به عنوان فروخته شده علامت‌گذاری کنید.</p>
                    </div>
                    {!isEditingMachine && (
                      <button
                        onClick={() => {
                          setEditingMachineId(null);
                          setMachineForm({
                            model: '',
                            year: '',
                            price: '',
                            specifications: '',
                            imageUrl: '',
                            status: 'available',
                          });
                          setIsEditingMachine(true);
                        }}
                        className="flex items-center gap-1.5 rounded-sm bg-amber-500 px-3 py-1.5 font-sans text-xs uppercase tracking-wider font-bold text-black transition hover:bg-amber-400 cursor-pointer"
                      >
                        <Plus className="h-4 w-4" /> افزودن ماشین جدید
                      </button>
                    )}
                  </div>

                  {isEditingMachine ? (
                    <form onSubmit={handleSaveMachine} className="space-y-5 rounded-sm border border-zinc-800 bg-zinc-900/60 p-6 text-right">
                      <div className="flex justify-between items-center border-b border-zinc-800 pb-3 mb-2 flex-row-reverse">
                        <span className="font-sans text-xs font-bold text-amber-500 uppercase tracking-widest">
                          {editingMachineId ? 'ویرایش مشخصات ماشین CNC' : 'ثبت ماشین‌آلات جدید در سامانه'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsEditingMachine(false)}
                          className="text-zinc-500 hover:text-white cursor-pointer"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-right">
                        <div>
                          <label className="block font-sans text-xs uppercase tracking-wider text-zinc-400 text-right">
                            نام و مدل دستگاه *
                          </label>
                          <input
                            type="text"
                            required
                            value={machineForm.model}
                            onChange={(e) => setMachineForm({ ...machineForm, model: e.target.value })}
                            placeholder="مثال: Citizen Cincom L20"
                            className="mt-1 w-full rounded-sm border border-zinc-800 bg-zinc-950 px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-sm font-sans text-right"
                          />
                        </div>
                        <div>
                          <label className="block font-sans text-xs uppercase tracking-wider text-zinc-400 text-right">
                            سال ساخت *
                          </label>
                          <input
                            type="text"
                            required
                            value={machineForm.year}
                            onChange={(e) => setMachineForm({ ...machineForm, year: e.target.value })}
                            placeholder="مثال: ۲۰۱۸ یا ۱۳۹۷"
                            className="mt-1 w-full rounded-sm border border-zinc-800 bg-zinc-950 px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-sm font-sans text-right"
                          />
                        </div>
                        <div>
                          <label className="block font-sans text-xs uppercase tracking-wider text-zinc-400 text-right">
                            قیمت فروش *
                          </label>
                          <input
                            type="text"
                            required
                            value={machineForm.price}
                            onChange={(e) => setMachineForm({ ...machineForm, price: e.target.value })}
                            placeholder="مثال: تماس بگیرید یا توافقی"
                            className="mt-1 w-full rounded-sm border border-zinc-800 bg-zinc-950 px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-sm font-sans text-right"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-right">
                        <div>
                          <label className="block font-sans text-xs uppercase tracking-wider text-zinc-400 text-right">
                            وضعیت دستگاه در نمایشگاه *
                          </label>
                          <select
                            value={machineForm.status}
                            onChange={(e) => setMachineForm({ ...machineForm, status: e.target.value as 'available' | 'sold' })}
                            className="mt-1 w-full rounded-sm border border-zinc-800 bg-zinc-950 px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-sm font-sans text-right"
                          >
                            <option value="available">موجود برای فروش در نمایشگاه</option>
                            <option value="sold">فروخته شده</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 text-right">
                        <div>
                          <label className="block font-sans text-xs uppercase tracking-wider text-zinc-400 text-right">
                            مشخصات فنی دستگاه (هر مورد در یک خط جداگانه)
                          </label>
                          <textarea
                            rows={6}
                            value={machineForm.specifications}
                            onChange={(e) => setMachineForm({ ...machineForm, specifications: e.target.value })}
                            placeholder="مثال:&#10;سیستم کنترل: Fanuc 18i-TB&#10;تعداد محور فعال: ۷ محور&#10;حداکثر قطر کارگیر: ۲۰ میلی‌متر"
                            className="mt-1 w-full rounded-sm border border-zinc-800 bg-zinc-950 px-3 py-2 text-amber-500 font-sans text-xs focus:outline-none focus:border-amber-500 text-right whitespace-pre-line"
                          />
                        </div>

                        <div>
                          <label className="block font-sans text-xs uppercase tracking-wider text-zinc-400 mb-1 text-right">
                            نشانی تصویر دستگاه *
                          </label>
                          <input
                            type="text"
                            required
                            value={machineForm.imageUrl}
                            onChange={(e) => setMachineForm({ ...machineForm, imageUrl: e.target.value })}
                            placeholder="آدرس اینترنتی تصویر را وارد کنید یا یکی از پیش‌فرض‌های زیر را انتخاب کنید"
                            className="w-full rounded-sm border border-zinc-800 bg-zinc-950 px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-xs mb-3 font-sans text-right"
                          />
                          <span className="font-sans text-[9px] uppercase tracking-wider text-zinc-500 block mb-1">
                            یا انتخاب تصویر آماده باکیفیت دستگاه:
                          </span>
                          <div className="grid grid-cols-2 gap-2">
                            {IMAGE_PRESETS.map((preset, pIdx) => (
                              <button
                                key={pIdx}
                                type="button"
                                onClick={() => setMachineForm({ ...machineForm, imageUrl: preset.url })}
                                className={`flex items-center gap-1.5 rounded-sm border bg-zinc-950 p-2 text-right transition cursor-pointer flex-row-reverse justify-end ${
                                  machineForm.imageUrl === preset.url
                                    ? 'border-amber-500 text-amber-500 font-bold'
                                    : 'border-zinc-800 text-zinc-400 hover:border-zinc-700'
                                }`}
                              >
                                <img
                                  src={preset.url}
                                  alt={preset.name}
                                  referrerPolicy="no-referrer"
                                  className="h-6 w-6 rounded-sm object-cover"
                                />
                                <span className="font-sans text-[10px] truncate">{preset.name === 'Swiss Lathe Preset' ? 'تراش سوئیسی' : preset.name === 'Medical Part Preset' ? 'تراش قطعه پزشکی' : preset.name === 'Automotive Part Preset' ? 'تراش قطعه خودرو' : 'کارگاه CNC'}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4 pt-2 flex-row-reverse">
                        <button
                          type="submit"
                          className="flex-1 rounded-sm bg-amber-500 py-2.5 font-sans text-xs uppercase tracking-wider font-bold text-black hover:bg-amber-400 transition cursor-pointer"
                        >
                          {editingMachineId ? 'بروزرسانی مشخصات ماشین' : 'ثبت قطعی ماشین در ناوگان'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingMachine(false)}
                          className="rounded-sm border border-zinc-800 px-6 py-2.5 font-sans text-xs uppercase tracking-wider text-zinc-400 hover:text-white hover:bg-zinc-950 transition cursor-pointer"
                        >
                          انصراف
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-3">
                      {machines.map((mac) => (
                        <div
                          key={mac.id}
                          className="flex flex-col sm:flex-row-reverse items-start sm:items-center justify-between gap-4 rounded-sm border border-zinc-800 bg-zinc-955 p-4 text-right"
                        >
                          <div className="flex items-center gap-4 flex-row-reverse">
                            <img
                              src={mac.imageUrl}
                              alt={mac.model}
                              referrerPolicy="no-referrer"
                              className="h-12 w-12 rounded-sm object-cover border border-zinc-800"
                            />
                            <div className="text-right">
                              <div className="flex items-center gap-2 flex-row-reverse">
                                <h4 className="text-md font-bold text-white font-sans">{mac.model}</h4>
                                <span className={`rounded-sm px-2 py-0.5 font-sans text-[9px] uppercase tracking-wider ${
                                  mac.status === 'available'
                                    ? 'bg-amber-955/40 text-amber-400 border border-amber-955/50 font-bold'
                                    : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                                }`}>
                                  {mac.status === 'available' ? 'موجود در کارگاه' : 'فروخته شده'}
                                </span>
                              </div>
                              <p className="text-xs text-zinc-400 font-sans mt-1 text-right">
                                سال ساخت: {mac.year} • قیمت پیشنهادی: {mac.price}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 w-full sm:w-auto flex-row-reverse">
                            <button
                              onClick={() => handleEditMachineClick(mac)}
                              className="flex flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-sm border border-zinc-800 px-3 py-1.5 font-sans text-xs text-zinc-300 hover:text-white hover:border-zinc-600 transition cursor-pointer"
                            >
                              <Edit className="h-3.5 w-3.5" /> ویرایش
                            </button>
                            <button
                              onClick={() => handleDeleteMachine(mac.id)}
                              className="flex flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-sm border border-red-955 px-3 py-1.5 font-sans text-xs text-red-500 hover:bg-red-955/20 transition cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> حذف
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Settings */}
              {activeTab === 'settings' && (
                <div>
                  <div className="border-b border-zinc-800 pb-4 mb-6 text-right">
                    <h3 className="text-xl font-extrabold text-white font-sans">تنظیمات کارگاه و اطلاعات تماس</h3>
                    <p className="text-xs text-zinc-400 font-sans mt-1">تغییر آنی نشانی، تلفن‌های تماس، پست الکترونیکی و ساعات کاری نمایش داده شده در سایت.</p>
                  </div>

                  <form onSubmit={handleSaveSettings} className="space-y-5 rounded-sm border border-zinc-800 bg-zinc-900/60 p-6 text-right">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block font-sans text-xs uppercase tracking-wider text-zinc-400 text-right">
                          نشانی فیزیکی کارگاه رایان CNC
                        </label>
                        <input
                          type="text"
                          required
                          value={settingsForm.address}
                          onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                          className="mt-1 w-full rounded-sm border border-zinc-800 bg-zinc-950 px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-sm font-sans text-right"
                        />
                      </div>
                      <div>
                        <label className="block font-sans text-xs uppercase tracking-wider text-zinc-400 text-right">
                          شماره تلفن تماس کارگاه
                        </label>
                        <input
                          type="text"
                          required
                          value={settingsForm.phone}
                          onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                          className="mt-1 w-full rounded-sm border border-zinc-800 bg-zinc-950 px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-sm font-sans text-right"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block font-sans text-xs uppercase tracking-wider text-zinc-400 text-right">
                          پست الکترونیکی مهندسی (ایمیل)
                        </label>
                        <input
                          type="email"
                          required
                          value={settingsForm.email}
                          onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                          className="mt-1 w-full rounded-sm border border-zinc-800 bg-zinc-950 px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-sm font-sans text-right"
                        />
                      </div>
                      <div>
                        <label className="block font-sans text-xs uppercase tracking-wider text-zinc-400 text-right">
                          ساعات کاری و پذیرش سفارشات
                        </label>
                        <input
                          type="text"
                          required
                          value={settingsForm.workingHours}
                          onChange={(e) => setSettingsForm({ ...settingsForm, workingHours: e.target.value })}
                          className="mt-1 w-full rounded-sm border border-zinc-800 bg-zinc-950 px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-sm font-sans text-right"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-sans text-xs uppercase tracking-wider text-zinc-400 text-right">
                        شعار تبلیغاتی کارگاه رایان CNC
                      </label>
                      <input
                        type="text"
                        value={settingsForm.tagline || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                        className="mt-1 w-full rounded-sm border border-zinc-800 bg-zinc-950 px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-sm font-sans text-right"
                      />
                    </div>

                    <div>
                      <label className="block font-sans text-xs uppercase tracking-wider text-zinc-400 text-right">
                        توضیحات کامل بخش درباره ما
                      </label>
                      <textarea
                        rows={4}
                        value={settingsForm.description || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, description: e.target.value })}
                        className="mt-1 w-full rounded-sm border border-zinc-800 bg-zinc-950 px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-sm leading-relaxed font-sans text-right"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSavingSettings}
                      className="w-full rounded-sm bg-amber-500 py-2.5 font-sans text-xs uppercase tracking-widest font-bold text-black hover:bg-amber-400 transition disabled:opacity-50 cursor-pointer"
                    >
                      {isSavingSettings ? 'در حال ذخیره‌سازی تغییرات...' : 'ثبت قطعی مشخصات جدید کارگاه'}
                    </button>
                  </form>
                </div>
              )}

              {/* Tab: Inquiries */}
              {activeTab === 'inquiries' && (
                <div>
                  <div className="border-b border-zinc-800 pb-4 mb-6 text-right">
                    <h3 className="text-xl font-extrabold text-white font-sans">صندوق پیام‌ها و استعلام‌های دریافتی</h3>
                    <p className="text-xs text-zinc-400 font-sans mt-1">بررسی پیام‌های ارسالی کاربران، درخواست‌های استعلام قیمت (RFQ) قطعات و خرید ماشین‌آلات CNC.</p>
                  </div>

                  {inquiries.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-zinc-800 rounded-sm bg-zinc-950/40 text-right">
                      <MailOpen className="h-10 w-10 text-zinc-600 mx-auto" />
                      <p className="mt-4 text-zinc-400 font-sans text-center">هیچ پیام یا استعلامی در پایگاه داده ثبت نشده است.</p>
                      <p className="text-[10px] text-zinc-500 font-sans mt-2 text-center uppercase tracking-wider">پیام‌های ارسالی کاربران از طریق فرم تماس با ما یا مدال سفارش قطعه در این بخش ثبت می‌شوند</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {inquiries.map((inq) => (
                        <div
                          key={inq.id}
                          className="rounded-sm border border-zinc-800 bg-zinc-950 p-6 relative overflow-hidden text-right"
                        >
                          <div className="flex flex-col sm:flex-row-reverse justify-between items-start gap-3 border-b border-zinc-900 pb-3 mb-4 text-right">
                            <div className="text-right">
                              <div className="flex flex-wrap items-center gap-2 flex-row-reverse">
                                <span className="text-sm font-bold text-white font-sans">{inq.name}</span>
                                <span className="h-1.5 w-1.5 rounded-full bg-zinc-800" />
                                <span className="font-sans text-[10px] text-amber-500">
                                  {inq.email}
                                </span>
                                {inq.phone && (
                                  <>
                                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-800" />
                                    <span className="font-sans text-[10px] text-zinc-500">
                                      {inq.phone}
                                    </span>
                                  </>
                                )}
                              </div>
                              <h4 className="text-md font-extrabold text-white mt-1.5 font-sans">
                                موضوع: {inq.subject}
                              </h4>
                            </div>

                            <div className="flex items-center gap-2 flex-row-reverse">
                              {inq.itemName && (
                                <span className="rounded-sm bg-zinc-900 border border-zinc-800 px-2 py-0.5 font-sans text-[9px] text-amber-500">
                                  آیتم مرجع: {inq.itemName}
                                </span>
                              )}
                              <span className="font-sans text-[9px] text-zinc-650">
                                {new Date(inq.createdAt).toLocaleDateString('fa-IR')}
                              </span>
                              <button
                                onClick={() => handleDeleteInquiry(inq.id)}
                                className="text-zinc-500 hover:text-red-500 transition p-1 cursor-pointer"
                                title="حذف استعلام"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          <div className="bg-zinc-900/60 p-4 rounded-sm border border-zinc-800/55 font-sans text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap text-right">
                            {inq.message}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
