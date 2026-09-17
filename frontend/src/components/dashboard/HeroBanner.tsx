import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, Clock, Building, ShieldCheck } from 'lucide-react';
import { Property, UserProfile } from '../../types';

interface HeroBannerProps {
  user: UserProfile;
  property: Property;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ user, property }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const timeFormatted = currentDate.toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const thaiDateFormatted = currentDate.toLocaleDateString('th-TH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const ownerName = user?.displayName || 'คุณตี๋หิด';
  const cleanGreetingName = ownerName.startsWith('คุณ') ? ownerName : `คุณ${ownerName}`;
  const condoName = property?.name || 'ตี๋หิด คอนโด';

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0a192f] via-[#112240] to-[#1e3a8a] p-6 md:p-8 text-white shadow-2xl shadow-blue-950/20 border border-blue-800/30">
      {/* Background ambient lighting and decorative blurs */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl"></div>
      <div className="pointer-events-none absolute left-1/3 -bottom-24 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl"></div>
      
      {/* Geometric subtle grid pattern */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #60a5fa 1px, transparent 0)`,
          backgroundSize: '28px 28px',
        }}
      ></div>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Left column: Greetings & Info */}
        <div className="max-w-xl space-y-3.5">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3.5 py-1 text-xs font-semibold text-blue-200 backdrop-blur-md border border-blue-400/30">
            <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
            <span>TeeHidZ Smart Condo & Room Management</span>
            <span className="h-1 w-1 rounded-full bg-blue-300"></span>
            <span className="text-white font-bold">
              {property?.typeLabel || 'คอนโด/ห้องเช่า'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white font-prompt">
            สวัสดี <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-sky-200 to-white">{cleanGreetingName}</span> 👋
          </h1>

          <p className="text-sm md:text-base text-blue-100/90 leading-relaxed font-normal">
            ยินดีต้อนรับสู่ระบบจัดการ <span className="font-bold text-amber-300 underline decoration-amber-400/50 underline-offset-4">{condoName}</span> ตรวจสอบสถานะห้องพัก 48 ห้อง สัญญาเช่า และกระแสเงินสดแบบ Real-time
          </p>

          {/* Thai Live Date & Time Badges */}
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs md:text-sm text-blue-100">
            <div className="flex items-center gap-2 rounded-xl bg-black/30 px-3.5 py-2 backdrop-blur-md border border-white/10 shadow-sm">
              <Calendar className="h-4 w-4 text-sky-400" />
              <span>{thaiDateFormatted}</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-black/30 px-3.5 py-2 backdrop-blur-md border border-white/10 shadow-sm font-mono">
              <Clock className="h-4 w-4 text-emerald-400 animate-pulse" />
              <span className="font-bold tracking-wider text-emerald-300">{timeFormatted} น.</span>
            </div>
          </div>
        </div>

        {/* Right column: Generated 3D Condo Hero Image Showcase */}
        <div className="flex items-center justify-center lg:justify-end">
          <div className="relative group">
            {/* Ambient glow behind image */}
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-500 to-cyan-400 opacity-30 blur-lg group-hover:opacity-50 transition duration-500"></div>
            
            {/* Card Container */}
            <div className="relative flex flex-col sm:flex-row items-center gap-4 rounded-2xl bg-slate-900/80 p-3.5 backdrop-blur-xl border border-blue-400/30 shadow-2xl">
              <div className="relative h-28 w-28 sm:h-32 sm:w-32 shrink-0 overflow-hidden rounded-xl border border-blue-300/30 shadow-inner">
                <img
                  src="/condo_hero.jpg"
                  alt="ภาพจำลอง 3D ตี๋หิด คอนโด"
                  className="h-full w-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
                <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-semibold text-blue-200 backdrop-blur-xs">
                  3D Render
                </span>
              </div>

              <div className="space-y-1.5 text-center sm:text-left pr-2">
                <div className="inline-flex items-center gap-1 text-[11px] font-medium text-sky-300">
                  <Building className="h-3.5 w-3.5 text-sky-400" />
                  <span>โครงการอสังหาริมทรัพย์</span>
                </div>
                <h3 className="text-base font-bold text-white font-prompt line-clamp-1">
                  {condoName}
                </h3>
                <p className="text-[11px] text-blue-200/80">
                  48 ห้องพัก • 8 ชั้น • ระบบสมาร์ทมิเตอร์
                </p>
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-400/40">
                    <ShieldCheck className="h-3 w-3 text-emerald-400" />
                    <span>เชื่อมต่อ SQL สำเร็จ</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
