import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Home, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { formatPercent } from '../../lib/format';
import { showToast } from '../../lib/alert';

interface RoomStatusCardProps {
  rooms: {
    total: number;
    occupied: number;
    vacant: number;
    occupancyPct: number;
  };
}

export const RoomStatusCard: React.FC<RoomStatusCardProps> = ({ rooms }) => {
  const data = [
    { name: 'มีผู้เช่า', value: rooms.occupied, color: '#4f46e5' }, // primary-600
    { name: 'ห้องว่าง', value: rooms.vacant, color: '#e2e8f0' },   // surface-200
  ];

  return (
    <div className="rounded-2xl border border-surface-200/80 bg-white p-5 md:p-6 shadow-sm flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-surface-100">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500"></div>
            <h3 className="text-base font-bold text-surface-900 font-prompt">
              สถานะอัตราการเช่า
            </h3>
          </div>
          <span className="text-xs text-surface-400">ภาพรวม 48 ห้อง</span>
        </div>

        {/* Donut Chart & Center Metric */}
        <div className="relative my-4 flex items-center justify-center h-44">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                formatter={(val, name) => [`${val} ห้อง`, name]}
                contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Donut Center Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-extrabold text-surface-900 font-prompt">
              {formatPercent(rooms.occupancyPct)}
            </span>
            <span className="text-[11px] text-surface-500 font-medium">อัตราการเช่า</span>
          </div>
        </div>

        {/* Breakdown Badges */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2.5 rounded-xl bg-primary-50/60 p-2.5 border border-primary-100/50">
            <div className="h-3 w-3 rounded-full bg-primary-600"></div>
            <div>
              <p className="text-surface-500 text-[11px]">เช่าแล้ว</p>
              <p className="font-bold text-primary-900 text-sm">{rooms.occupied} ห้อง</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-xl bg-surface-50 p-2.5 border border-surface-200/60">
            <div className="h-3 w-3 rounded-full bg-surface-300"></div>
            <div>
              <p className="text-surface-500 text-[11px]">ห้องว่างพร้อมเช่า</p>
              <p className="font-bold text-surface-800 text-sm">{rooms.vacant} ห้อง</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <button
        type="button"
        onClick={() => showToast('เปิดดูผังห้องพักทั้งหมด 48 ห้อง', 'info')}
        className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-surface-50 py-2.5 text-xs font-semibold text-primary-700 hover:bg-primary-50 transition-colors border border-surface-200/80"
      >
        <span>ดูผังห้องพักและสถานะทั้งหมด</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};
