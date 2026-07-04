import React, { useState } from 'react';
import { ShieldCheck, Mail, Phone, MapPin, Cpu, Settings } from 'lucide-react';
import { WorkshopSettings } from '../types';

interface FooterProps {
  onAdminClick: () => void;
  address: string;
  phone: string;
  email: string;
  theme: 'light' | 'dark';
  isAdminLoggedIn?: boolean;
  settings?: WorkshopSettings;
}

export default function Footer({ onAdminClick, address, phone, email, theme, isAdminLoggedIn, settings }: FooterProps) {
  const [clicks, setClicks] = useState(0);
  const [clickTimeout, setClickTimeout] = useState<any>(null);

  const handleFooterClick = () => {
    if (clickTimeout) clearTimeout(clickTimeout);
    
    const newCount = clicks + 1;
    if (newCount >= 5) {
      setClicks(0);
      onAdminClick();
    } else {
      setClicks(newCount);
      const t = setTimeout(() => setClicks(0), 3000);
      setClickTimeout(t);
    }
  };

  return (
    <footer className={`border-t text-right py-12 ${
      theme === 'dark' ? 'bg-[#0a0a0c] border-zinc-900 text-zinc-400' : 'bg-slate-50 border-slate-200 text-slate-600'
    }`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b ${
          theme === 'dark' ? 'border-zinc-900' : 'border-slate-200'
        }`}>
          
          {/* Col 1: Brand details */}
          <div>
            <div className="flex items-center gap-2 justify-start">
              <Cpu className="h-5 w-5 text-amber-500 animate-pulse" />
              <span className={`font-sans text-lg font-black uppercase tracking-wider ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}>
                رایان<span className="text-amber-500">CNC</span>
              </span>
            </div>
            <p className={`mt-2 text-xs leading-relaxed font-sans ${
              theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'
            }`}>
              دستگاه‌های فوق‌پیشرفته تراش سوئیسی (دکل متحرک) چندمحوره. ارائه‌دهنده خدمات تراشکاری دقیق با تیراژ بالا برای صنایع پزشکی، خودرو و صنایع فوق دقیق.
            </p>
          </div>

          {/* Col 2: Quick Contacts */}
          <div className="space-y-2 text-xs font-sans text-right">
            <h4 className={`font-bold uppercase tracking-wider text-[10px] mb-2 font-sans text-right ${
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}>
              ارتباط سریع
            </h4>
            <div className={`flex items-center gap-2 flex-row-reverse justify-end ${
              theme === 'dark' ? 'text-zinc-400' : 'text-slate-600'
            }`}>
              <Phone className="h-3 w-3 text-amber-500 flex-shrink-0" />
              <span className="direction-ltr text-right">{phone}</span>
            </div>
            <div className={`flex items-center gap-2 flex-row-reverse justify-end ${
              theme === 'dark' ? 'text-zinc-400' : 'text-slate-600'
            }`}>
              <Mail className="h-3 w-3 text-amber-500 flex-shrink-0" />
              <a href={`mailto:${email}`} className={`transition text-right ${
                theme === 'dark' ? 'hover:text-white' : 'hover:text-slate-900'
              }`}>
                {email}
              </a>
            </div>
            <div className={`flex items-center gap-2 flex-row-reverse justify-end ${
              theme === 'dark' ? 'text-zinc-400' : 'text-slate-600'
            }`}>
              <MapPin className="h-3 w-3 text-amber-500 flex-shrink-0" />
              <span className="truncate text-right" dir="rtl">{address}</span>
            </div>
          </div>

          {/* Col 3: Secure Certification */}
          <div className="flex flex-col md:items-start justify-between">
            <div className={`flex items-center gap-2 rounded-sm border p-3 max-w-xs text-right ${
              theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <ShieldCheck className="h-8 w-8 text-amber-500 flex-shrink-0" />
              <div>
                <h5 className={`font-sans text-[9px] font-bold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-white' : 'text-slate-850'
                }`}>
                  تاییدیه تضمین کیفیت (QC 1.0)
                </h5>
                <p className={`text-[9px] font-sans ${
                  theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'
                }`}>
                  تمامی فرآیندهای تولید تحت استانداردهای دقیق کالیبره و تضمین شده‌اند.
                </p>
              </div>
            </div>

            {/* Portal launch */}
            {isAdminLoggedIn && (
              <button
                onClick={onAdminClick}
                className={`mt-4 md:mt-0 flex items-center gap-1.5 font-sans text-[10px] transition cursor-pointer justify-start ${
                  theme === 'dark' ? 'text-zinc-650 hover:text-zinc-400' : 'text-slate-400 hover:text-slate-650'
                }`}
              >
                <Settings className="h-3 w-3" />
                <span>پایانه امن مدیریت کارگاه</span>
              </button>
            )}
          </div>

        </div>

        {/* Bottom copyright line */}
        <div className={`mt-8 flex flex-col sm:flex-row-reverse items-center justify-between text-[10px] font-sans ${
          theme === 'dark' ? 'text-zinc-600' : 'text-slate-400'
        }`}>
          <span
            onClick={handleFooterClick}
            className="cursor-pointer select-none"
            title="رایان CNC - برای ورود به بخش مدیریت ۵ بار کلیک کنید"
          >
            &copy; {new Date().getFullYear()} رایان CNC. تمامی حقوق محفوظ است.
          </span>
          <span className="mt-2 sm:mt-0">طراحی‌شده برای صنایع ساخت و تولید در مقیاس میکرون</span>
        </div>
      </div>
    </footer>
  );
}
