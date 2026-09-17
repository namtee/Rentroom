import React from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  ArrowRight,
  Receipt
} from 'lucide-react';
import { RecentPayment } from '../../types';
import { formatCurrency, formatRelativeThaiTime } from '../../lib/format';
import { showSuccess, showToast } from '../../lib/alert';

interface RecentPaymentsListProps {
  payments: RecentPayment[];
}

export const RecentPaymentsList: React.FC<RecentPaymentsListProps> = ({ payments }) => {
  const handleViewReceipt = (payment: RecentPayment) => {
    showSuccess(
      `ใบเสร็จรับเงิน #${payment.id.slice(0, 8)}`,
      `ผู้ชำระ: ${payment.tenantName}\n` +
      `ห้อง: ${payment.roomNumber}\n` +
      `ยอดชำระ: ${formatCurrency(payment.amount)}\n` +
      `สถานะ: ชำระเรียบร้อย (PAID)\n` +
      `เวลาที่บันทึก: ${new Date(payment.paidAt).toLocaleString('th-TH')}`
    );
  };

  return (
    <div className="rounded-2xl border border-surface-200/80 bg-white shadow-sm overflow-hidden flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-surface-100">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500"></div>
          <h3 className="text-base font-bold text-surface-900 font-prompt">
            ประวัติการรับชำระล่าสุด (5 รายการ)
          </h3>
        </div>
        <button
          type="button"
          onClick={() => showToast('เปิดดูประวัติการรับเงินทั้งหมด', 'info')}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-800 transition-colors"
        >
          <span>ดูทั้งหมด</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* List */}
      <div className="p-3 divide-y divide-surface-100">
        {payments.length === 0 ? (
          <div className="py-8 text-center text-xs text-surface-400">
            ยังไม่มีรายการชำระเงินล่าสุด
          </div>
        ) : (
          payments.map((p) => (
            <div
              key={p.id}
              onClick={() => handleViewReceipt(p)}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-50 cursor-pointer transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 font-bold text-xs group-hover:scale-105 transition-transform">
                  <Receipt className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-surface-800 group-hover:text-primary-600 transition-colors">
                      {p.tenantName}
                    </p>
                    <span className="rounded-md bg-surface-100 px-1.5 py-0.5 text-[10px] font-mono font-bold text-surface-600">
                      ห้อง {p.roomNumber}
                    </span>
                  </div>
                  <p className="text-[11px] text-surface-400 mt-0.5">
                    {formatRelativeThaiTime(p.paidAt)}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs sm:text-sm font-bold font-mono text-emerald-600">
                  +{formatCurrency(p.amount)}
                </p>
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 mt-0.5">
                  <CheckCircle2 className="h-2.5 w-2.5" /> ชำระแล้ว
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="bg-surface-50/70 p-3 border-t border-surface-100 text-center">
        <p className="text-[11px] text-surface-500">
          ยอดเงินจะเข้าบัญชีหลักและกระทบยอดบัญชีอัตโนมัติ
        </p>
      </div>
    </div>
  );
};
