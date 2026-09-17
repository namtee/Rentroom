import React from 'react';
import { 
  Building2, 
  Users, 
  Wallet, 
  Wrench, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { DashboardSummary } from '../../types';
import { formatCurrency, formatPercent } from '../../lib/format';

interface KpiCardsProps {
  summary: DashboardSummary;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ summary }) => {
  const { rooms, tenants, finance, maintenance } = summary;

  const totalMaintenance = maintenance.open + maintenance.inProgress;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* 1. Total Rooms */}
      <div className="relative overflow-hidden rounded-2xl border border-surface-200/80 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200 group">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-surface-500">
              ห้องพักทั้งหมด
            </p>
            <h3 className="mt-2 text-3xl font-extrabold text-surface-900 font-prompt">
              {rooms.total} <span className="text-sm font-normal text-surface-500">ห้อง</span>
            </h3>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 group-hover:scale-110 transition-transform">
            <Building2 className="h-6 w-6" />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-surface-100 pt-3 text-xs">
          <div className="flex items-center gap-1.5 text-surface-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span>เช่าแล้ว <b>{rooms.occupied}</b></span>
            <span className="text-surface-300">|</span>
            <span className="h-2 w-2 rounded-full bg-surface-300"></span>
            <span>ว่าง <b>{rooms.vacant}</b></span>
          </div>
          <span className="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-0.5 text-[11px] font-bold text-primary-700">
            {formatPercent(rooms.occupancyPct)}
          </span>
        </div>
      </div>

      {/* 2. Total Tenants */}
      <div className="relative overflow-hidden rounded-2xl border border-surface-200/80 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200 group">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-surface-500">
              ผู้เช่าทั้งหมด
            </p>
            <h3 className="mt-2 text-3xl font-extrabold text-surface-900 font-prompt">
              {tenants.total} <span className="text-sm font-normal text-surface-500">คน</span>
            </h3>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-surface-100 pt-3 text-xs">
          <div className="flex items-center gap-1.5 text-surface-600">
            <span>ชาย <b>{tenants.male}</b> คน</span>
            <span className="text-surface-300">•</span>
            <span>หญิง <b>{tenants.female}</b> คน</span>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
            <CheckCircle2 className="h-3 w-3" /> ปกติ
          </span>
        </div>
      </div>

      {/* 3. Monthly Profit / Income */}
      <div className="relative overflow-hidden rounded-2xl border border-surface-200/80 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200 group">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-surface-500">
              กำไรสุทธิเดือนนี้
            </p>
            <h3 className="mt-2 text-2xl lg:text-3xl font-extrabold text-surface-900 font-prompt">
              {formatCurrency(finance.profit.value)}
            </h3>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
            <Wallet className="h-6 w-6" />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-surface-100 pt-3 text-xs">
          <div className="flex items-center gap-1 text-surface-500 truncate max-w-[150px]">
            <span className="text-emerald-600 font-medium">รับ {formatCurrency(finance.income.value)}</span>
          </div>
          {finance.profit.changePct !== null ? (
            <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-bold ${
              finance.profit.changePct > 0
                ? 'bg-emerald-50 text-emerald-700'
                : finance.profit.changePct < 0
                ? 'bg-rose-50 text-rose-700'
                : 'bg-surface-100 text-surface-600'
            }`}>
              {finance.profit.changePct > 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : finance.profit.changePct < 0 ? (
                <TrendingDown className="h-3 w-3" />
              ) : (
                <Minus className="h-3 w-3" />
              )}
              {finance.profit.changePct > 0 ? `+${finance.profit.changePct}%` : `${finance.profit.changePct}%`}
            </span>
          ) : (
            <span className="text-[11px] text-surface-400">รอบบิลปัจจุบัน</span>
          )}
        </div>
      </div>

      {/* 4. Maintenance / Repairs */}
      <div className="relative overflow-hidden rounded-2xl border border-surface-200/80 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200 group">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-surface-500">
              แจ้งซ่อมที่ต้องดูแล
            </p>
            <h3 className="mt-2 text-3xl font-extrabold text-surface-900 font-prompt">
              {totalMaintenance} <span className="text-sm font-normal text-surface-500">รายการ</span>
            </h3>
          </div>
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-transform group-hover:scale-110 ${
            totalMaintenance > 0 ? 'bg-rose-50 text-rose-600' : 'bg-surface-100 text-surface-500'
          }`}>
            <Wrench className="h-6 w-6" />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-surface-100 pt-3 text-xs">
          <div className="flex items-center gap-1.5 text-surface-600">
            <span>รอดำเนินการ <b>{maintenance.open}</b></span>
            <span className="text-surface-300">•</span>
            <span>กำลังซ่อม <b>{maintenance.inProgress}</b></span>
          </div>
          {totalMaintenance > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-700">
              <AlertCircle className="h-3 w-3" /> รอแก้ไข
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
              <CheckCircle2 className="h-3 w-3" /> เรียบร้อย
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
