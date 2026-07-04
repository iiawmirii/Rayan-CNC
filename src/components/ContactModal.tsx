import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, CheckCircle } from 'lucide-react';
import { db, collection, addDoc } from '../lib/firebase';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledSubject?: string;
  prefilledItemType?: 'general' | 'part' | 'machine';
  prefilledItemName?: string;
  theme: 'light' | 'dark';
}

export default function ContactModal({
  isOpen,
  onClose,
  prefilledSubject = '',
  prefilledItemType = 'general',
  prefilledItemName = '',
  theme,
}: ContactModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSubject(prefilledSubject || '');
      setIsSuccess(false);
    }
  }, [isOpen, prefilledSubject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'inquiries'), {
        name,
        email,
        phone,
        subject: subject || 'استعلام فنی و عمومی',
        message,
        itemType: prefilledItemType,
        itemName: prefilledItemName || null,
        createdAt: new Date().toISOString(),
      });
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        // Reset form
        setName('');
        setEmail('');
        setPhone('');
        setSubject('');
        setMessage('');
        setIsSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error submitting inquiry: ', error);
      alert('خطا در ارسال استعلام. لطفاً مجدداً تلاش نمایید.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#0a0a0c]/80 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className={`relative w-full max-w-lg overflow-hidden rounded-sm border p-6 shadow-2xl md:p-8 text-right ${
              theme === 'dark' ? 'border-zinc-800 bg-zinc-900 text-zinc-100' : 'border-slate-200 bg-white text-slate-900'
            }`}
          >
            <button
              onClick={onClose}
              className={`absolute top-4 left-4 transition cursor-pointer z-10 ${
                theme === 'dark' ? 'text-zinc-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <X className="h-6 w-6" />
            </button>

            {isSuccess ? (
              <div className="flex flex-col items-center justify-center py-12 text-center font-sans">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring' }}
                >
                  <CheckCircle className="h-16 w-16 text-amber-500 animate-pulse" />
                </motion.div>
                <h3 className={`mt-6 text-2xl font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-slate-900'
                }`}>استعلام شما ثبت شد</h3>
                <p className={`mt-2 font-sans leading-relaxed ${
                  theme === 'dark' ? 'text-zinc-400' : 'text-slate-500'
                }`}>
                  با تشکر از شما! تیم مهندسی ما مشخصات فنی ارسالی را بررسی کرده و به زودی با شما تماس خواهند گرفت.
                </p>
                <div className={`mt-6 font-sans text-xs ${
                  theme === 'dark' ? 'text-zinc-500' : 'text-slate-400'
                }`}>
                  دپارتمان مهندسی قطعات دقیق رایان CNC
                </div>
              </div>
            ) : (
              <div>
                <div className={`border-b pb-4 text-right ${
                  theme === 'dark' ? 'border-zinc-800' : 'border-slate-200'
                }`}>
                  <span className="font-sans text-xs uppercase tracking-widest text-amber-500 font-semibold">
                    درگاه ثبت استعلام قیمت و سفارش فنی
                  </span>
                  <h2 className={`mt-1 text-2xl font-bold font-sans ${
                    theme === 'dark' ? 'text-white' : 'text-slate-900'
                  }`}>
                    {prefilledItemName ? `استعلام: ${prefilledItemName}` : 'ارتباط با واحد فنی و مهندسی'}
                  </h2>
                  <p className={`text-sm font-sans leading-relaxed ${
                    theme === 'dark' ? 'text-zinc-400' : 'text-slate-550'
                  }`}>
                    درخواست استعلام قیمت، مشاوره درباره نقشه‌های مهندسی یا سوال درباره ماشین‌آلات موجود.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4 font-sans text-right">
                  <div>
                    <label className={`block font-sans text-xs uppercase tracking-wider text-right ${
                      theme === 'dark' ? 'text-zinc-400' : 'text-slate-550'
                    }`}>
                      نام و نام خانوادگی *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="مثال: رضا محمدی"
                      className={`mt-1 w-full rounded-sm border px-4 py-2 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none font-sans text-sm text-right ${
                        theme === 'dark'
                          ? 'border-zinc-800 bg-zinc-950 text-white placeholder-zinc-700'
                          : 'border-slate-200 bg-white text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-right">
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
                        className={`mt-1 w-full rounded-sm border px-4 py-2 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none font-sans text-sm ${
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
                        className={`mt-1 w-full rounded-sm border px-4 py-2 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none placeholder-zinc-700 font-sans text-sm text-right ${
                          theme === 'dark'
                            ? 'border-zinc-800 bg-zinc-950 text-white placeholder-zinc-700'
                            : 'border-slate-200 bg-white text-slate-900 placeholder-slate-400'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block font-sans text-xs uppercase tracking-wider text-right ${
                      theme === 'dark' ? 'text-zinc-400' : 'text-slate-550'
                    }`}>
                      موضوع استعلام
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="مثال: تلرانس قطعات پزشکی"
                      className={`mt-1 w-full rounded-sm border px-4 py-2 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none font-sans text-sm text-right ${
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
                      متن دقیق پیام / نیازمندی‌های فنی کارگاه *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="لطفاً جنس آلیاژ، تعداد حدودی، تلرانس‌های مورد نظر یا هرگونه مشخصات فنی دیگر را ذکر نمایید."
                      className={`mt-1 w-full rounded-sm border px-4 py-2 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none font-sans text-sm text-right ${
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
                    {isSubmitting ? (
                      'در حال ارسال مشخصات فنی...'
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        ثبت و ارسال درخواست استعلام قیمت
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
