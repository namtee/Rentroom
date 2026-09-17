import React, { useState } from 'react';
import { Sparkles, X, ChevronRight, ShieldCheck } from 'lucide-react';
import { showToast } from '../../lib/alert';

export const PromoCard: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-700 p-4 text-white shadow-md">
      {/* Decorative background glow */}
      <div className="pointer-events-none absolute -right-6 -bottom-6 h-28 w-28 rounded-full bg-white/10 blur-xl"></div>

      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 rounded-full p-1 text-white/70 hover:bg-white/20 hover:text-white transition-colors"
        title="ปิดการแจ้งเตือน"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider mb-1.5">
        <Sparkles className="h-4 w-4" />
        <span>TeeHidZ Tip</span>
      </div>

      <h4 className="text-sm font-bold text-white font-prompt">
        ต่อตรงฐานข้อมูล PostgreSQL จริง
      </h4>

      <p className="mt-1 text-xs text-primary-100/90 leading-relaxed">
        ระบบบันทึกข้อมูลสัญญา ผู้เช่า และมิเตอร์ตรงเข้า SQL Server พร้อมระบบสำรองข้อมูลอัตโนมัติทุกวัน
      </p>

      <button
        type="button"
        onClick={() => showToast('ดูคู่มือการใช้งานระบบ TeeHidZ เพิ่มเติม', 'info')}
        className="mt-3 inline-flex items-center gap-1 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/30 backdrop-blur-sm transition-colors"
      >
        <span>อ่านคู่มือใช้งาน</span>
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};
