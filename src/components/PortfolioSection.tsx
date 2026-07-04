import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PortfolioItem } from '../types';
import { Eye, Info, X, Microscope } from 'lucide-react';

interface PortfolioSectionProps {
  items: PortfolioItem[];
  onContactClick: (subject: string, itemType?: 'general' | 'part' | 'machine', itemName?: string) => void;
  theme: 'light' | 'dark';
}

export default function PortfolioSection({ items, onContactClick, theme }: PortfolioSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);

  const categories = ['All', 'Medical Parts', 'Automotive Parts', 'Special/Custom Parts'];
  
  const categoryLabels: { [key: string]: string } = {
    'All': 'همه',
    'Medical Parts': 'قطعات پزشکی',
    'Automotive Parts': 'قطعات خودرو',
    'Special/Custom Parts': 'قطعات خاص و سفارشی',
    'Medical': 'قطعات پزشکی',
    'Automotive': 'قطعات خودرو',
    'Special/Custom': 'قطعات خاص و سفارشی'
  };

  const filteredItems = selectedCategory === 'All'
    ? items
    : items.filter(item => {
        if (selectedCategory === 'Medical Parts') {
          return item.category === 'Medical Parts' || item.category === 'قطعات پزشکی';
        }
        if (selectedCategory === 'Automotive Parts') {
          return item.category === 'Automotive Parts' || item.category === 'قطعات خودرو';
        }
        if (selectedCategory === 'Special/Custom Parts') {
          return item.category === 'Special/Custom Parts' || item.category === 'قطعات خاص و سفارشی';
        }
        return item.category === selectedCategory;
      });

  return (
    <section id="portfolio" className={`py-24 border-b text-right ${
      theme === 'dark' ? 'bg-[#0a0a0c] border-zinc-900 text-zinc-100' : 'bg-white border-slate-200 text-slate-900'
    }`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="font-sans text-xs font-semibold uppercase tracking-widest text-amber-500">
              نمونه کارهای ماشینکاری
            </span>
            <h2 className={`mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl font-sans ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}>
              نمونه کارها و پروژه‌ها
            </h2>
            <p className={`mt-2 max-w-xl text-sm font-sans leading-relaxed ${
              theme === 'dark' ? 'text-zinc-400' : 'text-slate-650'
            }`}>
              بررسی قطعات دقیقی که روی دستگاه‌های تراش دکل متحرک پرسرعت ما ماشینکاری شده و تلرانس‌های هندسی سخت‌گیرانه‌ای را برآورده کرده‌اند.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-sm px-4 py-2 font-sans text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-black font-bold shadow-md'
                      : theme === 'dark'
                        ? 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white hover:border-zinc-700'
                        : 'bg-slate-50 text-slate-600 border border-slate-200 hover:text-slate-900 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  {categoryLabels[cat] || cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Portfolio Grid */}
        <AnimatePresence mode="popLayout">
          {filteredItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`mt-12 text-center py-20 border border-dashed rounded-sm ${
                theme === 'dark' ? 'border-zinc-800' : 'border-slate-300'
              }`}
            >
              <Microscope className="h-10 w-10 text-zinc-650 mx-auto" />
              <p className={`mt-4 font-sans ${
                theme === 'dark' ? 'text-zinc-400' : 'text-slate-600'
              }`}>هیچ پروژه نمونه‌ای در این دسته‌بندی یافت نشد.</p>
              <p className={`text-xs font-sans mt-1 ${
                theme === 'dark' ? 'text-zinc-500' : 'text-slate-400'
              }`}>می‌توان از پنل مدیریت برای افزودن موارد جدید استفاده کرد</p>
            </motion.div>
          ) : (
            <motion.div
              layout
              className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {filteredItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className={`group relative cursor-pointer overflow-hidden rounded-sm border p-4 transition-all text-right ${
                    theme === 'dark'
                      ? 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                      : 'border-slate-200 bg-slate-50 hover:border-slate-300 shadow-xs'
                  }`}
                  onClick={() => setSelectedItem(item)}
                >
                  {/* Image wrapper */}
                  <div className={`relative aspect-4/3 overflow-hidden rounded-sm ${
                    theme === 'dark' ? 'bg-zinc-950' : 'bg-slate-100'
                  }`}>
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/70 opacity-0 backdrop-blur-xs transition-opacity duration-300 group-hover:opacity-100">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-black shadow-lg">
                        <Eye className="h-5 w-5" />
                      </div>
                    </div>
                    {/* Category label */}
                    <span className={`absolute top-3 right-3 rounded-sm px-2.5 py-1 font-sans text-[9px] uppercase tracking-wider text-amber-500 backdrop-blur-sm border ${
                      theme === 'dark' ? 'bg-zinc-950/80 border-zinc-800' : 'bg-white/90 border-slate-200 shadow-xs'
                    }`}>
                      {categoryLabels[item.category] || item.category}
                    </span>
                  </div>

                  {/* Details summary */}
                  <div className="mt-4">
                    <h3 className={`text-lg font-bold group-hover:text-amber-500 transition-colors font-sans ${
                      theme === 'dark' ? 'text-white' : 'text-slate-900'
                    }`}>
                      {item.title}
                    </h3>
                    <p className={`mt-1 text-xs line-clamp-2 leading-relaxed font-sans ${
                      theme === 'dark' ? 'text-zinc-400' : 'text-slate-600'
                    }`}>
                      {item.description}
                    </p>
                    {/* Brief specifications breakdown in mono */}
                    {item.specifications && (
                      <div className={`mt-3 border-t pt-3 ${
                        theme === 'dark' ? 'border-zinc-800/60' : 'border-slate-200'
                      }`}>
                        <div className={`flex items-center gap-1 font-sans text-[10px] uppercase tracking-widest justify-start ${
                          theme === 'dark' ? 'text-zinc-500' : 'text-slate-400'
                        }`}>
                          <Info className="h-3 w-3 text-amber-500" /> مشخصات کلیدی
                        </div>
                        <p className={`mt-1 font-sans text-[10px] truncate ${
                          theme === 'dark' ? 'text-zinc-400' : 'text-slate-500'
                        }`}>
                          {item.specifications.split('\n')[0]}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Project Details Modal */}
        <AnimatePresence>
          {selectedItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedItem(null)}
                className="absolute inset-0 bg-[#0a0a0c]/80 backdrop-blur-xs"
              />

              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className={`relative w-full max-w-2xl overflow-hidden rounded-sm border p-6 shadow-2xl md:p-8 text-right ${
                  theme === 'dark' ? 'border-zinc-800 bg-zinc-900 text-zinc-100' : 'border-slate-200 bg-white text-slate-900'
                }`}
              >
                <button
                  onClick={() => setSelectedItem(null)}
                  className={`absolute top-4 left-4 transition cursor-pointer z-10 ${
                    theme === 'dark' ? 'text-zinc-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <X className="h-6 w-6" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                  {/* Photo details */}
                  <div className={`rounded-sm overflow-hidden h-64 md:h-full relative border ${
                    theme === 'dark' ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-100 border-slate-250'
                  }`}>
                    <img
                      src={selectedItem.imageUrl}
                      alt={selectedItem.title}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover object-center"
                    />
                  </div>

                  {/* Context Info */}
                  <div className="flex flex-col justify-between">
                    <div>
                      <span className="font-sans text-[10px] uppercase tracking-wider text-amber-500 font-semibold">
                        {categoryLabels[selectedItem.category] || selectedItem.category}
                      </span>
                      <h3 className={`text-2xl font-bold mt-1 font-sans ${
                        theme === 'dark' ? 'text-white' : 'text-slate-900'
                      }`}>
                        {selectedItem.title}
                      </h3>
                      
                      <p className={`text-sm mt-3 leading-relaxed font-sans ${
                        theme === 'dark' ? 'text-zinc-300' : 'text-slate-700'
                      }`}>
                        {selectedItem.description}
                      </p>

                      {/* Technical specifications box */}
                      {selectedItem.specifications && (
                        <div className={`mt-4 rounded-sm p-4 border ${
                          theme === 'dark' ? 'bg-zinc-950 border-zinc-800/80' : 'bg-slate-50 border-slate-200'
                        }`}>
                          <span className={`font-sans text-[10px] uppercase tracking-wider block border-b pb-1.5 mb-2 text-right ${
                            theme === 'dark' ? 'text-zinc-500 border-zinc-900' : 'text-slate-400 border-slate-200'
                          }`}>
                            مشخصات فنی و مهندسی
                          </span>
                          <pre className="font-sans text-xs text-amber-500 whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-40 text-right">
                            {selectedItem.specifications}
                          </pre>
                        </div>
                      )}
                    </div>

                    {/* Inquiry Action */}
                    <div className={`mt-6 pt-4 border-t flex flex-col gap-2 font-sans ${
                      theme === 'dark' ? 'border-zinc-800' : 'border-slate-100'
                    }`}>
                      <button
                        onClick={() => {
                          const itemName = selectedItem.title;
                          setSelectedItem(null);
                          onContactClick(
                            `استعلام قیمت قطعه: ${itemName}`,
                            'part',
                            itemName
                          );
                        }}
                        className="w-full text-center rounded-sm bg-amber-500 py-2.5 font-sans text-xs uppercase tracking-wider text-black font-bold cursor-pointer transition hover:bg-amber-400"
                      >
                        درخواست استعلام قیمت برای این قطعه
                      </button>
                      <button
                        onClick={() => setSelectedItem(null)}
                        className={`w-full text-center rounded-sm border py-2 font-sans text-xs uppercase tracking-wider transition cursor-pointer ${
                          theme === 'dark'
                            ? 'border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                            : 'border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300 shadow-xs'
                        }`}
                      >
                        بستن جزئیات
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
