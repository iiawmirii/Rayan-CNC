import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Machine } from '../types';
import { Calendar, Award, Info, PhoneCall, Sparkles, Sliders, Check } from 'lucide-react';

interface MachinesSectionProps {
  machines: Machine[];
  onContactClick: (subject: string, itemType?: 'general' | 'part' | 'machine', itemName?: string) => void;
  theme: 'light' | 'dark';
}

export default function MachinesSection({ machines, onContactClick, theme }: MachinesSectionProps) {
  const [expandedSpecs, setExpandedSpecs] = useState<{ [id: string]: boolean }>({});

  const toggleSpecs = (id: string) => {
    setExpandedSpecs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section id="machines" className={`relative py-24 border-b text-right ${
      theme === 'dark' ? 'bg-[#0d0d10] border-zinc-900 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-900'
    }`}>
      {/* Background radial details */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.03),transparent_40%)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-sans text-xs font-semibold uppercase tracking-widest text-amber-500"
          >
            موجودی و کارگزاری ماشین‌آلات صنعتی
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className={`mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl font-sans ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}
          >
            فروش ماشین‌آلات CNC سوئیسی
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className={`mt-4 text-lg font-sans leading-relaxed ${
              theme === 'dark' ? 'text-zinc-400' : 'text-slate-650'
            }`}
          >
            ما به‌طور دوره‌ای ناوگان ماشینکاری خود را نو کرده یا به عنوان کارگزار، دستگاه‌های تراش سوئیسی باکیفیت و با دقت بالا را عرضه می‌کنیم. از ماشین‌آلات صنعتی آماده تولید و کاملاً سرویس‌شده ما بازدید نمایید.
          </motion.p>
        </div>

        {/* Machines Grid */}
        {machines.length === 0 ? (
          <div className={`mt-16 text-center py-20 border border-dashed rounded-sm ${
            theme === 'dark' ? 'border-zinc-800 bg-zinc-950/40' : 'border-slate-300 bg-white shadow-xs'
          }`}>
            <Sliders className="h-10 w-10 text-zinc-500 mx-auto animate-pulse" />
            <p className={`mt-4 font-sans ${
              theme === 'dark' ? 'text-zinc-400' : 'text-slate-650'
            }`}>در حال حاضر هیچ دستگاهی برای فروش ثبت نشده است.</p>
            <p className={`text-xs font-sans mt-1 ${
              theme === 'dark' ? 'text-zinc-500' : 'text-slate-400'
            }`}>لطفاً بعداً مراجعه نمایید یا از پنل مدیریت برای ثبت دستگاه جدید استفاده کنید</p>
          </div>
        ) : (
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2">
            {machines.map((machine, idx) => {
              const isAvailable = machine.status === 'available';
              const isExpanded = expandedSpecs[machine.id] || false;
              const specsArray = machine.specifications
                ? machine.specifications.split('\n')
                : [];

              return (
                <motion.div
                  key={machine.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-sm border p-6 transition-all duration-300 hover:shadow-lg ${
                    theme === 'dark'
                      ? 'border-zinc-800 bg-[#0a0a0c] hover:border-zinc-700'
                      : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div>
                    {/* Header Image Frame */}
                    <div className={`relative aspect-16/9 overflow-hidden rounded-sm border ${
                      theme === 'dark' ? 'bg-zinc-900 border-zinc-900' : 'bg-slate-100 border-slate-200'
                    }`}>
                      <img
                        src={machine.imageUrl}
                        alt={machine.model}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-103"
                      />

                      {/* Status Badging */}
                      <span className={`absolute top-4 right-4 flex items-center gap-1.5 rounded-sm px-3 py-1 font-sans text-[9px] uppercase tracking-wider text-black font-bold backdrop-blur-md shadow-md ${
                        isAvailable
                          ? 'bg-amber-500/90 border border-amber-400'
                          : 'bg-zinc-800/90 border border-zinc-700 text-zinc-400'
                      }`}>
                        {isAvailable && <span className="h-1.5 w-1.5 rounded-full bg-black animate-pulse" />}
                        {isAvailable ? 'آماده فروش / موجود' : 'فروخته شده'}
                      </span>


                    </div>

                    {/* Machine Details */}
                    <div className="mt-6 text-right">
                      <div className={`flex flex-row-reverse items-center justify-end gap-4 text-xs font-sans ${
                        theme === 'dark' ? 'text-zinc-500' : 'text-slate-450'
                      }`}>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-amber-500" />
                          سال ساخت: {machine.year}
                        </span>
                        <span className={`h-3 w-px ${theme === 'dark' ? 'bg-zinc-800' : 'bg-slate-200'}`} />
                        <span className="flex items-center gap-1 text-amber-500 font-semibold">
                          <Award className="h-3.5 w-3.5" /> تاییدیه فنی کارکرد دستگاه
                        </span>
                      </div>

                      <h3 className={`mt-2 text-2xl font-bold tracking-tight group-hover:text-amber-500 transition-colors font-sans ${
                        theme === 'dark' ? 'text-white' : 'text-slate-900'
                      }`}>
                        {machine.model}
                      </h3>

                      {/* Technical Specs Checklist */}
                      <div className={`mt-6 border-t pt-6 ${
                        theme === 'dark' ? 'border-zinc-900' : 'border-slate-100'
                      }`}>
                        <span className={`font-sans text-[10px] uppercase tracking-wider block mb-3 ${
                          theme === 'dark' ? 'text-zinc-500' : 'text-slate-400'
                        }`}>
                          مشخصات فنی و مهندسی:
                        </span>
                        
                        <div className="space-y-2">
                          {/* Render first 3 specs always, toggle remaining */}
                          {specsArray.slice(0, isExpanded ? specsArray.length : 3).map((spec, specIdx) => (
                            <div key={specIdx} className={`flex items-start gap-2.5 text-xs justify-start ${
                              theme === 'dark' ? 'text-zinc-400' : 'text-slate-650'
                            }`}>
                              <Check className="h-3.5 w-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                              <span className="font-sans leading-relaxed text-right">{spec}</span>
                            </div>
                          ))}
                        </div>

                        {/* Expand/Collapse specs button */}
                        {specsArray.length > 3 && (
                          <button
                            onClick={() => toggleSpecs(machine.id)}
                            className={`mt-3 flex items-center gap-1 font-sans text-[10px] uppercase tracking-wider transition cursor-pointer justify-start ${
                              theme === 'dark' ? 'text-zinc-500 hover:text-white' : 'text-slate-400 hover:text-slate-900'
                            }`}
                          >
                            <Info className="h-3 w-3 text-amber-500" />
                            {isExpanded ? 'نمایش مشخصات کمتر' : `مشاهد همه مشخصات فنی (+${specsArray.length - 3} مورد)`}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className={`mt-8 pt-6 border-t flex gap-4 font-sans ${
                    theme === 'dark' ? 'border-zinc-900' : 'border-slate-100'
                  }`}>
                    <button
                      onClick={() => onContactClick(
                        `استعلام خرید و بازدید دستگاه: ${machine.model}`,
                        'machine',
                        machine.model
                      )}
                      disabled={!isAvailable}
                      className={`flex flex-1 items-center justify-center gap-2 rounded-sm py-3 font-sans text-xs uppercase tracking-wider font-bold transition-all cursor-pointer ${
                        isAvailable
                          ? 'bg-amber-500 text-black hover:bg-amber-400'
                          : theme === 'dark'
                            ? 'bg-zinc-800 text-zinc-500 border border-zinc-900 cursor-not-allowed'
                            : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                      }`}
                    >
                      <PhoneCall className="h-4 w-4" />
                      {isAvailable ? 'استعلام قیمت و مشاوره خرید' : 'فروخته شده / غیرقابل استعلام'}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Machinery Rotation Guarantee Warning */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className={`mt-16 rounded-sm border p-6 flex flex-col md:flex-row items-center gap-6 ${
            theme === 'dark' ? 'border-zinc-800 bg-[#0a0a0c]' : 'border-slate-200 bg-white shadow-sm'
          }`}
        >
          <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-sm border text-amber-400 ${
            theme === 'dark' ? 'border-zinc-800 bg-zinc-900' : 'border-slate-200 bg-slate-50'
          }`}>
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="font-sans text-right">
            <h4 className={`font-sans text-sm font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}>
              تست‌های فنی سخت‌گیرانه و فرآیند کارگزاری
            </h4>
            <p className={`text-xs mt-1 leading-relaxed font-sans ${
              theme === 'dark' ? 'text-zinc-400' : 'text-slate-650'
            }`}>
              هر دستگاه تراش CNC/سوئیسی قبل از درج در لیست فروش، بررسی جامعی را جهت تضمین سلامت ران‌اوت مکانیکی و تلرانس هندسی توسط تیم ما طی می‌کند. فیدرهای بار LNS، هلدرهای ابزار و پمپ‌های مایع خنک‌کننده به طور کامل بررسی و شستشو می‌شوند.
            </p>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
