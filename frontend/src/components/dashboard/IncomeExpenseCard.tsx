import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Layers } from 'lucide-react';
import { FinanceMetric, FinanceChartItem } from '../../types';
import { formatCurrency } from '../../lib/format';

interface IncomeExpenseCardProps {
  chartData: FinanceChartItem[];
  income: FinanceMetric;
  expense: FinanceMetric;
  profit: FinanceMetric;
}

// Convert "YYYY-MM" to Thai short month format (e.g. "2026-09" -> "ก.ย. 69")
function formatThaiPeriod(period: string): string {
  const parts = period.split('-');
  if (parts.length !== 2) return period;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const thaiMonths = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];
  const thaiYear = (year + 543) % 100;
  return `${thaiMonths[month] || parts[1]} ${thaiYear}`;
}

export const IncomeExpenseCard: React.FC<IncomeExpenseCardProps> = ({
  chartData,
  income,
  expense,
  profit
}) => {
  const formattedData = chartData.map((item) => ({
    ...item,
    periodLabel: formatThaiPeriod(item.period),
    profit: item.income - item.expense
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-surface-200 bg-white/95 p-3 shadow-xl backdrop-blur-md text-xs font-prompt">
          <p className="font-bold text-surface-900 border-b border-surface-100 pb-1 mb-2">
            รอบเดือน: {label}
          </p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-4 text-emerald-600">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                รายรับ:
              </span>
              <span className="font-bold font-mono">{formatCurrency(payload[0]?.value || 0)}</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-rose-600">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                รายจ่าย:
              </span>
              <span className="font-bold font-mono">{formatCurrency(payload[1]?.value || 0)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl border border-surface-200/80 bg-white p-5 md:p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-primary-600"></div>
            <h3 className="text-base font-bold text-surface-900 font-prompt">
              สถิติรายรับ - รายจ่าย (3 เดือนล่าสุด)
            </h3>
          </div>
          <p className="text-xs text-surface-500 mt-1">
            ข้อมูลเปรียบเทียบกระแสเงินสดจากฐานข้อมูลจริง
          </p>
        </div>

        {/* 3 Metric Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 border border-emerald-200/60">
            <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-surface-600">รับ:</span>
            <span className="font-bold text-emerald-700 font-mono">
              {formatCurrency(income.value)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 rounded-xl bg-rose-50 px-3 py-1.5 border border-rose-200/60">
            <ArrowDownRight className="h-3.5 w-3.5 text-rose-600" />
            <span className="text-surface-600">จ่าย:</span>
            <span className="font-bold text-rose-700 font-mono">
              {formatCurrency(expense.value)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 rounded-xl bg-primary-50 px-3 py-1.5 border border-primary-200/60">
            <Layers className="h-3.5 w-3.5 text-primary-600" />
            <span className="text-surface-600">กำไร:</span>
            <span className="font-bold text-primary-700 font-mono">
              {formatCurrency(profit.value)}
            </span>
          </div>
        </div>
      </div>

      {/* Recharts Bar Chart */}
      <div className="mt-6 h-64 w-full">
        {formattedData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={formattedData}
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              barGap={6}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="periodLabel"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12, fontFamily: 'Prompt' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickFormatter={(val) => `฿${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '16px', fontSize: '12px' }}
                formatter={(value) => (
                  <span className="text-surface-600 font-medium text-xs">
                    {value === 'income' ? 'รายรับ (Income)' : 'รายจ่าย (Expense)'}
                  </span>
                )}
              />
              <Bar
                dataKey="income"
                name="income"
                fill="#10b981"
                radius={[6, 6, 0, 0]}
                maxBarSize={36}
              />
              <Bar
                dataKey="expense"
                name="expense"
                fill="#f43f5e"
                radius={[6, 6, 0, 0]}
                maxBarSize={36}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-surface-400">
            ไม่มีข้อมูลสถิติการเงิน
          </div>
        )}
      </div>
    </div>
  );
};
