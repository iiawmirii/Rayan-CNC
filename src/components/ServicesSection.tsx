import React from 'react';
import { motion } from 'motion/react';
import { Cpu, Layers, Activity, ShieldCheck } from 'lucide-react';

interface ServicesSectionProps {
  onContactClick: (subject: string, itemType?: 'general' | 'part' | 'machine', itemName?: string) => void;
  theme: 'light' | 'dark';
}

export default function ServicesSection({ onContactClick, theme }: ServicesSectionProps) {
  const services = [
    {
      id: 'mfg',
      icon: Layers,
      title: 'تولید قطعات پزشکی و خودرو',
      subtitle: 'تولید قراردادی دارای تاییدیه استاندارد',
      badge: 'تیراژ بالا / هندسه پیچیده',
      description: 'ما قطعات پیچیده و حساس به ایمنی را متناسب با مقررات کیفیت سخت‌گیرانه ایمپلنت‌های پزشکی و سیستم‌های انتقال قدرت با تنش بالا تولید می‌کنیم. سالن تولید ما تیتانیوم با مقاومت بالا، فولاد ضدزنگ آلیاژی، PEEK و شمش آلومینیوم را با تکرارپذیری بی‌نقص در بچ‌های مختلف پردازش می‌کند.',
      capabilities: [
        'ماشینکاری تیتانیوم گرید ایمپلنت منطبق با استانداردهای FDA',
        'تولید قطعات سوخت‌رسانی و سیستم تعلیق تحت فشار بالای خودرو',
        'رزوه‌های داخلی پیچیده و سوراخ‌کاری‌های بسیار ریز (Micro-boring)',
        'ردیابی کامل متریال همراه با گزارش تضمین کیفیت (QA)'
      ],
      color: 'from-amber-500/10 to-amber-600/5',
      borderColor: 'group-hover:border-amber-500/30'
    },
    {
      id: 'cadcam',
      icon: Cpu,
      title: 'طراحی نقشه‌های فنی و CAD/CAM',
      subtitle: 'مدل‌سازی CAD و بهینه‌سازی مسیر ابزار CAM',
      badge: 'SolidWorks و Autodesk Fusion 360',
      description: 'طرح‌های دو بعدی، کانسپت‌ها یا نقشه‌های دستی خود را به مدل‌های سه بعدی CAD آماده برای تولید تبدیل کنید. مهندسان متخصص ما قطعات را با برنامه‌ریزی بهینه مسیر ابزار در نرم‌افزارهای CAM طراحی می‌کنند تا زمان سیکل کاهش یافته، لرزش ابزار حذف شده و اجرای بی‌نقص ماشین‌های CNC سوئیسی تضمین شود.',
      capabilities: [
        'تبدیل نقشه‌های دو بعدی به مدل‌های صلب سه بعدی صنعتی',
        'ممیزی‌های تخصصی طراحی برای سهولت ساخت (DFM)',
        'تولید مسیرهای ابزار CAM برای دستگاه‌های تراش چندمحوره',
        'پشتیبانی و بهینه‌سازی فرمت‌های STEP، IGES و DXF'
      ],
      color: 'from-zinc-500/10 to-zinc-600/5',
      borderColor: 'group-hover:border-zinc-500/30'
    },
    {
      id: 'swiss',
      icon: Activity,
      title: 'تراشکاری سوئیسی در سطح میکرون',
      subtitle: 'ماشینکاری با دقت فوق‌العاده بالا با دکل متحرک',
      badge: 'تلرانس در سطح تا ±۱.۵ میکرون',
      description: 'با استفاده از پیشرفته‌ترین مراکز تراشکاری CNC سوئیسی با دکل متحرک، متریال مستقیماً در محل ابزار برش مهار می‌شود. این ویژگی لرزش و انحراف قطعه‌کار را کاملاً از بین برده و دقت مطلق میکرونی و پرداخت‌های سطحی فوق‌العاده صاف را برای قطعات بسیار نازک، بلند یا مینیاتوری تضمین می‌کند.',
      capabilities: [
        'مهار دکل متحرک برای جلوگیری از هرگونه لرزش و انحراف',
        'کنترل تلرانس زیر ±۰.۰۰۲ میلی‌متر (±۲ میکرون)',
        'میکروتراشکاری پیچیده تا قطرهای بسیار ریز ۰.۵ میلی‌متر',
        'پیکربندی قطعات پر تراکم بر روی محورهای فعال تا ۷ محور'
      ],
      color: 'from-amber-500/10 to-amber-600/5',
      borderColor: 'group-hover:border-amber-500/30'
    }
  ];

  return (
    <section id="services" className={`relative py-24 border-b ${
      theme === 'dark' ? 'bg-[#0d0d10] border-zinc-900' : 'bg-slate-50 border-slate-200'
    }`}>
      {/* Background blueprint details */}
      <div className={`pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#141417_1px,transparent_1px),linear-gradient(to_bottom,#141417_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] ${
        theme === 'dark' ? 'opacity-30' : 'opacity-[0.06]'
      }`} />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-sans text-xs font-semibold uppercase tracking-widest text-amber-500"
          >
            قابلیت‌ها و مرکز ماشینکاری دقیق
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className={`mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}
          >
            مهندسی شده برای دقت میکرونی
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
            ما از دستگاه‌های پیشرفته تراشکاری سوئیسی دکل متحرک استفاده می‌کنیم تا اشکال پیچیده را با تلرانسی بسازیم که فرزهای CNC معمولی به هیچ وجه قادر به دستیابی به آن نیستند.
          </motion.p>
        </div>

        {/* Services Grid */}
        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {services.map((svc, idx) => {
            const IconComponent = svc.icon;
            return (
              <motion.div
                key={svc.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-sm border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg md:p-8 text-right ${
                  theme === 'dark'
                    ? 'border-zinc-800 bg-[#0a0a0c] hover:border-zinc-700 hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)]'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-[0_8px_30px_rgba(15,23,42,0.06)] shadow-xs'
                }`}
              >
                {/* Ambient glow backing */}
                <div className={`absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br ${svc.color} blur-2xl opacity-50 group-hover:opacity-80 transition-opacity duration-500`} />

                <div>
                  {/* Icon */}
                  <div className={`relative flex h-12 w-12 items-center justify-center rounded-sm border text-amber-400 group-hover:text-black group-hover:bg-amber-500 transition-all duration-300 ${
                    theme === 'dark' ? 'border-zinc-800 bg-zinc-900' : 'border-slate-200 bg-slate-50'
                  }`}>
                    <IconComponent className="h-6 w-6" />
                  </div>

                  {/* Badging */}
                  <span className="mt-6 inline-block font-sans text-[10px] uppercase tracking-wider text-amber-500 font-semibold">
                    {svc.badge}
                  </span>

                  {/* Title & Sub */}
                  <h3 className={`mt-2 text-xl font-bold group-hover:text-amber-500 transition-colors ${
                    theme === 'dark' ? 'text-white' : 'text-slate-900'
                  }`}>
                    {svc.title}
                  </h3>
                  <p className={`mt-1 font-sans text-xs ${
                    theme === 'dark' ? 'text-zinc-500' : 'text-slate-400'
                  }`}>
                    {svc.subtitle}
                  </p>

                  {/* Description */}
                  <p className={`mt-4 text-sm leading-relaxed font-sans ${
                    theme === 'dark' ? 'text-zinc-400' : 'text-slate-650'
                  }`}>
                    {svc.description}
                  </p>

                  {/* Capabilities Bullet points */}
                  <div className={`mt-6 border-t pt-6 ${
                    theme === 'dark' ? 'border-zinc-900' : 'border-slate-100'
                  }`}>
                    <span className={`font-sans text-[10px] uppercase tracking-wider block mb-3 ${
                      theme === 'dark' ? 'text-zinc-500' : 'text-slate-450'
                    }`}>
                      عملکردها و فرآیندهای اصلی:
                    </span>
                    <ul className="space-y-2">
                      {svc.capabilities.map((cap, capIdx) => (
                        <li key={capIdx} className={`flex items-start gap-2 text-xs ${
                          theme === 'dark' ? 'text-zinc-400' : 'text-slate-650'
                        }`}>
                          <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500" />
                          <span>{cap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* RFQ Trigger button */}
                <div className="mt-8 pt-4 font-sans">
                  <button
                    onClick={() => onContactClick(
                      `استعلام خدمات: ${svc.title}`,
                      'part',
                      svc.title
                    )}
                    className={`flex w-full items-center justify-center rounded-sm border py-2.5 font-sans text-xs uppercase tracking-wider transition-all hover:bg-amber-500 hover:text-black hover:border-amber-500 hover:font-bold cursor-pointer ${
                      theme === 'dark'
                        ? 'border-zinc-800 bg-zinc-900 text-zinc-300'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:text-black shadow-xs'
                    }`}
                  >
                    درخواست استعلام قیمت برای این خدمات
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Quality Section Bottom Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className={`mt-16 flex flex-col items-center justify-center gap-4 rounded-sm border p-6 text-right md:flex-row md:text-right ${
            theme === 'dark'
              ? 'border-zinc-800 bg-[#0a0a0c]'
              : 'border-slate-200 bg-white shadow-sm'
          }`}
        >
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="font-sans">
            <h4 className={`font-sans text-sm font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}>
              کنترل کیفیت بدون نقص (QC) تضمین شده است
            </h4>
            <p className={`text-xs mt-1 font-sans leading-relaxed ${
              theme === 'dark' ? 'text-zinc-400' : 'text-slate-650'
            }`}>
              هر قطعه تولید شده با استفاده از ابزارهای اپتیکال، میکرومترهای دیجیتال و میکروسکوپ‌های پیشرفته صنعتی در مقابل نقشه‌های تولید اندازه‌گیری و سنجیده می‌شود. ما گواهینامه‌های اصالت متریال و گزارش‌های ابعادی دقیق را به همراه سفارش ارائه می‌دهیم.
            </p>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
