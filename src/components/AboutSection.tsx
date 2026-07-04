import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Phone, Mail, MapPin, Clock, Send, ShieldCheck, Factory } from 'lucide-react';
import { WorkshopSettings } from '../types';
import { db, collection, addDoc } from '../lib/firebase';

interface AboutSectionProps {
  settings: WorkshopSettings;
  onSuccessToast: () => void;
  theme: 'light' | 'dark';
}

export default function AboutSection({ settings, onSuccessToast, theme }: AboutSectionProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'inquiries'), {
        name,
        email,
        phone,
        subject: 'استعلام عمومی وب‌سایت',
        message,
        itemType: 'general',
        itemName: 'فرم تماس مستقیم',
        createdAt: new Date().toISOString(),
      });
      setIsSuccess(true);
      onSuccessToast();
      setTimeout(() => {
        setName('');
        setEmail('');
        setPhone('');
        setMessage('');
        setIsSuccess(false);
      }, 4000);
    } catch (error) {
      console.error('Error submitting contact: ', error);
      alert('خطا در ارسال پیام. لطفاً مجدداً تلاش نمایید.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="about" className={`relative py-24 border-b text-right ${
      theme === 'dark' ? 'bg-[#0a0a0c] border-zinc-900 text-zinc-100' : 'bg-white border-slate-200 text-slate-900'
    }`}>
      {/* Blueprint grid backer */}
      <div className={`pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#141417_1px,transparent_1px),linear-gradient(to_bottom,#141417_1px,transparent_1px)] bg-[size:2rem_2rem] ${
        theme === 'dark' ? 'opacity-25' : 'opacity-[0.03] invert'
      }`} />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          
          {/* Column 1: Workshop Information */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div>
              <span className="font-sans text-xs font-semibold uppercase tracking-widest text-amber-500">
                مهندسی دقیق و ساخت قطعات صنعتی
              </span>
              <h2 className={`mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl font-sans ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}>
                درباره رایان CNC
              </h2>
              <p className={`mt-4 text-sm font-sans leading-relaxed ${
                theme === 'dark' ? 'text-zinc-400' : 'text-slate-655'
              }`}>
                {settings.description || 'رایان CNC ارائه‌دهنده خدمات مهندسی دقیق در سطح جهانی، تولیدکننده قطعات با تلرانس بسیار دقیق برای صنایع پزشکی، خودرویی و سفارشی با استفاده از پیشرفته‌ترین دستگاه‌های تراش سوئیسی (دکل متحرک) است.'}
              </p>
            </div>

            {/* Contact Details Grid */}
            <div className="mt-8 space-y-6">
              
              {/* Location */}
              <div className="flex items-start gap-4 flex-row-reverse">
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-sm border text-amber-500 ${
                  theme === 'dark' ? 'border-zinc-800 bg-zinc-900' : 'border-slate-200 bg-slate-50 shadow-xs'
                }`}>
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="flex-1 text-right">
                  <h4 className={`font-sans text-xs uppercase tracking-wider ${
                    theme === 'dark' ? 'text-zinc-500' : 'text-slate-400'
                  }`}>
                    آدرس کارگاه
                  </h4>
                  <p className={`mt-1 text-sm font-sans font-medium leading-relaxed ${
                    theme === 'dark' ? 'text-white' : 'text-slate-900'
                  }`}>
                    {settings.address}
                  </p>
                  <span className={`inline-block mt-1 font-sans text-[10px] ${
                    theme === 'dark' ? 'text-zinc-500' : 'text-slate-400'
                  }`}>
                    منطقه صنعتی قطعات فوق دقیق
                  </span>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4 flex-row-reverse">
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-sm border text-amber-500 ${
                  theme === 'dark' ? 'border-zinc-800 bg-zinc-900' : 'border-slate-200 bg-slate-50 shadow-xs'
                }`}>
                  <Phone className="h-5 w-5" />
                </div>
                <div className="flex-1 text-right">
                  <h4 className={`font-sans text-xs uppercase tracking-wider ${
                    theme === 'dark' ? 'text-zinc-500' : 'text-slate-400'
                  }`}>
                    تلفن‌های تماس
                  </h4>
                  <p className={`mt-1 text-sm font-sans font-medium ${
                    theme === 'dark' ? 'text-white' : 'text-slate-900'
                  }`}>
                    <a href={`tel:${settings.phone}`} className="hover:text-amber-500 transition inline-block direction-ltr">
                      {settings.phone}
                    </a>
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4 flex-row-reverse">
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-sm border text-amber-500 ${
                  theme === 'dark' ? 'border-zinc-800 bg-zinc-900' : 'border-slate-200 bg-slate-50 shadow-xs'
                }`}>
                  <Mail className="h-5 w-5" />
                </div>
                <div className="flex-1 text-right">
                  <h4 className={`font-sans text-xs uppercase tracking-wider ${
                    theme === 'dark' ? 'text-zinc-500' : 'text-slate-400'
                  }`}>
                    نشانی ایمیل
                  </h4>
                  <p className={`mt-1 text-sm font-sans font-medium ${
                    theme === 'dark' ? 'text-white' : 'text-slate-900'
                  }`}>
                    <a href={`mailto:${settings.email}`} className="hover:text-amber-500 transition inline-block">
                      {settings.email}
                    </a>
                  </p>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start gap-4 flex-row-reverse">
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-sm border text-amber-500 ${
                  theme === 'dark' ? 'border-zinc-800 bg-zinc-900' : 'border-slate-200 bg-slate-50 shadow-xs'
                }`}>
                  <Clock className="h-5 w-5" />
                </div>
                <div className="flex-1 text-right">
                  <h4 className={`font-sans text-xs uppercase tracking-wider ${
                    theme === 'dark' ? 'text-zinc-500' : 'text-slate-400'
                  }`}>
                    ساعات کاری کارگاه
                  </h4>
                  <p className={`mt-1 text-sm font-sans font-medium leading-relaxed ${
                    theme === 'dark' ? 'text-white' : 'text-slate-900'
                  }`}>
                    {settings.workingHours}
                  </p>
                </div>
              </div>

            </div>

            {/* Interactive SVG Workshop Map Schematic */}
            <div className={`mt-10 overflow-hidden rounded-sm border p-4 relative ${
              theme === 'dark' ? 'border-zinc-800 bg-zinc-900/30' : 'border-slate-200 bg-slate-50 shadow-xs'
            }`}>
              <span className="font-sans text-[9px] uppercase tracking-widest text-zinc-500 absolute top-3 left-4 flex items-center gap-1">
                <Factory className="h-3 w-3 text-amber-500" /> نقشه شماتیک کارگاه ۱.۰
              </span>
              <h4 className={`font-sans text-xs font-semibold uppercase tracking-wider mb-3 text-right ${
                theme === 'dark' ? 'text-zinc-400' : 'text-slate-600'
              }`}>
                چیدمان فنی بخش‌ها
              </h4>
              
              <div className={`aspect-16/7 w-full rounded-sm p-4 border flex flex-col justify-between font-sans text-[10px] relative ${
                theme === 'dark' ? 'bg-zinc-950 border-zinc-900 text-zinc-500' : 'bg-white border-slate-200 text-slate-400 shadow-inner'
              }`}>
                <div className={`flex justify-between border-b pb-2 flex-row-reverse text-right ${
                  theme === 'dark' ? 'border-zinc-900' : 'border-slate-100'
                }`}>
                  <span>[بخش الف] واحد تراش سوئیسی (دکل متحرک)</span>
                  <span>[بخش ب] آزمایشگاه کالیبراسیون و کنترل کیفیت</span>
                </div>
                
                <div className="flex h-full items-center justify-center py-4">
                  <div className={`relative border border-dashed p-3 rounded flex flex-col items-center ${
                    theme === 'dark' ? 'border-zinc-800' : 'border-slate-200'
                  }`}>
                    <span className="text-amber-500 font-sans font-bold animate-pulse">● رایان CNC</span>
                    <span className={`text-[8px] mt-0.5 font-sans ${
                      theme === 'dark' ? 'text-zinc-650' : 'text-slate-400'
                    }`}>بزرگراه صنعت و فناوری</span>
                  </div>
                </div>

                <div className={`flex justify-between border-t pt-2 text-[8px] flex-row-reverse ${
                  theme === 'dark' ? 'border-zinc-900' : 'border-slate-100'
                }`}>
                  <span>عرض جغرافیایی: ۴۲.۲۸۰۸° شمالی</span>
                  <span>طول جغرافیایی: ۸۳.۷۴۳۰° غربی</span>
                </div>
              </div>
            </div>

          </motion.div>

          {/* Column 2: Direct RFQ Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={`rounded-sm border p-6 shadow-xl md:p-8 text-right ${
              theme === 'dark' ? 'border-zinc-800 bg-zinc-900/40' : 'border-slate-200 bg-slate-50 shadow-xs'
            }`}
          >
            <span className="font-sans text-xs font-bold uppercase tracking-widest text-amber-500">
              ارسال استعلام مستقیم
            </span>
            <h3 className={`mt-1 text-2xl font-bold font-sans ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}>
              تماس مستقیم با رایان CNC
            </h3>
            <p className={`text-sm font-sans mt-1 ${
              theme === 'dark' ? 'text-zinc-400' : 'text-slate-650'
            }`}>
              نقشه قطعه سفارشی دارید یا سوال عمومی؟ فرم زیر را ارسال فرمایید تا کارشناسان ما بررسی کنند.
            </p>

            {isSuccess ? (
              <div className={`mt-8 flex flex-col items-center justify-center py-12 text-center rounded-sm border ${
                theme === 'dark' ? 'bg-zinc-950/40 border-zinc-800' : 'bg-white border-slate-200 shadow-inner'
              }`}>
                <ShieldCheck className="h-12 w-12 text-amber-500 animate-bounce" />
                <h4 className={`mt-4 text-lg font-semibold font-sans ${
                  theme === 'dark' ? 'text-white' : 'text-slate-900'
                }`}>پیام شما با موفقیت ارسال شد</h4>
                <p className={`text-xs mt-1 px-4 font-sans leading-relaxed ${
                  theme === 'dark' ? 'text-zinc-400' : 'text-slate-500'
                }`}>
                  درخواست شما در صف بررسی کارشناسان قرار گرفت. طی ۲ الی ۴ ساعت کاری با شما تماس خواهیم گرفت.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-4 font-sans">
                <div>
                  <label className={`block font-sans text-xs uppercase tracking-wider ${
                    theme === 'dark' ? 'text-zinc-400' : 'text-slate-550'
                  }`}>
                    نام و نام خانوادگی *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: علی علوی"
                    className={`mt-1 w-full rounded-sm border px-4 py-2 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none text-right font-sans ${
                      theme === 'dark'
                        ? 'border-zinc-800 bg-zinc-950 text-white placeholder-zinc-700'
                        : 'border-slate-200 bg-white text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={`block font-sans text-xs uppercase tracking-wider text-right ${
                      theme === 'dark' ? 'text-zinc-400' : 'text-slate-550'
                    }`}>
                      آدرس ایمیل *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="info@example.com"
                      className={`mt-1 w-full rounded-sm border px-4 py-2 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none font-sans ${
                        theme === 'dark'
                          ? 'border-zinc-800 bg-zinc-950 text-white placeholder-zinc-700'
                          : 'border-slate-200 bg-white text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block font-sans text-xs uppercase tracking-wider text-right ${
                      theme === 'dark' ? 'text-zinc-400' : 'text-slate-550'
                    }`}>
                      شماره تماس
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                      className={`mt-1 w-full rounded-sm border px-4 py-2 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none placeholder-zinc-700 font-sans text-right ${
                        theme === 'dark'
                          ? 'border-zinc-800 bg-zinc-950 text-white placeholder-zinc-700'
                          : 'border-slate-200 bg-white text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block font-sans text-xs uppercase tracking-wider ${
                    theme === 'dark' ? 'text-zinc-400' : 'text-slate-550'
                  }`}>
                    متن پیام / استعلام قیمت قطعه *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="طرح، زمان‌بندی یا درخواست خرید دستگاه خود را شرح دهید..."
                    className={`mt-1 w-full rounded-sm border px-4 py-2 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none font-sans text-right ${
                      theme === 'dark'
                        ? 'border-zinc-800 bg-zinc-950 text-white placeholder-zinc-700'
                        : 'border-slate-200 bg-white text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-sm bg-amber-500 py-3 font-sans text-xs uppercase tracking-widest font-bold text-black transition hover:bg-amber-400 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  {isSubmitting ? 'در حال ارسال پیام...' : 'ارسال استعلام قیمت'}
                </button>
              </form>
            )}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
