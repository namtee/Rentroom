import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { HeroBanner } from '../components/dashboard/HeroBanner';
import { KpiCards } from '../components/dashboard/KpiCard';
import { IncomeExpenseCard } from '../components/dashboard/IncomeExpenseCard';
import { RoomStatusCard } from '../components/dashboard/RoomStatusCard';
import { LatestRoomsTable } from '../components/dashboard/LatestRoomsTable';
import { RecentPaymentsList } from '../components/dashboard/RecentPaymentsList';
import { NotificationsPanel } from '../components/dashboard/NotificationsPanel';
import { QuickMenu } from '../components/dashboard/QuickMenu';
import { PromoCard } from '../components/dashboard/PromoCard';
import { RefreshCw, Database, AlertTriangle } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { summary, loading, error, refetch } = useDashboard();

  if (loading && !summary) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></div>
        <div className="text-center">
          <p className="font-bold text-surface-800">กำลังเชื่อมต่อฐานข้อมูล SQL...</p>
          <p className="text-xs text-surface-500 mt-1">กำลังดึงข้อมูลสถิติห้องพักและรายได้ล่าสุด</p>
        </div>
      </div>
    );
  }

  if (error && !summary) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h3 className="mt-4 font-bold text-rose-900 text-lg">ไม่สามารถเชื่อมต่อฐานข้อมูลได้</h3>
        <p className="mt-2 text-xs text-rose-700 leading-relaxed font-mono bg-white/60 p-3 rounded-lg border border-rose-200">
          {error}
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-rose-700 shadow-sm transition-all"
        >
          <RefreshCw className="h-4 w-4" />
          <span>ลองเชื่อมต่อใหม่อีกครั้ง</span>
        </button>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="space-y-6">
      {/* 1. Hero Banner with Real-time Clock & Dynamic Title */}
      <HeroBanner user={summary.user} property={summary.property} />

      {/* 2. Top 4 KPI Metrics */}
      <KpiCards summary={summary} />

      {/* 3. Main Workspace Grid: 2-Column or 3-Column on wide screens */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Center Work Area (8 columns on lg) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Charts Row: Income/Expense Recharts + Occupancy Donut */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-7 lg:col-span-8">
              <IncomeExpenseCard
                chartData={summary.finance.chart}
                income={summary.finance.income}
                expense={summary.finance.expense}
                profit={summary.finance.profit}
              />
            </div>
            <div className="md:col-span-5 lg:col-span-4">
              <RoomStatusCard rooms={summary.rooms} />
            </div>
          </div>

          {/* Latest 5 Rooms Table */}
          <LatestRoomsTable rooms={summary.latestRooms} />

          {/* Recent 5 Payments List */}
          <RecentPaymentsList payments={summary.recentPayments} />
        </div>

        {/* Right Sidebar Area (4 columns on lg) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Menu 3x2 Grid */}
          <QuickMenu propertyId={summary.property.id} onChanged={refetch} />

          {/* Notifications Panel */}
          <NotificationsPanel
            notifications={summary.notifications}
            unreadCount={summary.unreadNotifications}
          />

          {/* Promo / Tip Card */}
          <PromoCard />

          {/* Real SQL Indicator Footer */}
          <div className="rounded-xl border border-surface-200/60 bg-white/70 p-3.5 text-center text-xs text-surface-500 shadow-sm flex items-center justify-center gap-2">
            <Database className="h-4 w-4 text-emerald-500" />
            <span>เชื่อมต่อฐานข้อมูล SQL สำเร็จ ({summary.property.name})</span>
          </div>
        </div>
      </div>
    </div>
  );
};
