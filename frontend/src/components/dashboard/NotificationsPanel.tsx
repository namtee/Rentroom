import React from 'react';
import { 
  Bell, 
  Wrench, 
  CreditCard, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { AppNotification } from '../../types';
import { formatRelativeThaiTime } from '../../lib/format';
import { showSuccess, showToast } from '../../lib/alert';

interface NotificationsPanelProps {
  notifications: AppNotification[];
  unreadCount: number;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
  notifications,
  unreadCount
}) => {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'MAINTENANCE_NEW':
        return <Wrench className="h-4 w-4 text-amber-600" />;
      case 'PAYMENT_RECEIVED':
        return <CreditCard className="h-4 w-4 text-emerald-600" />;
      case 'LEASE_EXPIRING':
        return <FileText className="h-4 w-4 text-indigo-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-primary-600" />;
    }
  };

  const getNotificationBg = (type: string) => {
    switch (type) {
      case 'MAINTENANCE_NEW':
        return 'bg-amber-50 border-amber-200/60';
      case 'PAYMENT_RECEIVED':
        return 'bg-emerald-50 border-emerald-200/60';
      case 'LEASE_EXPIRING':
        return 'bg-indigo-50 border-indigo-200/60';
      default:
        return 'bg-primary-50 border-primary-200/60';
    }
  };

  const handleItemClick = (n: AppNotification) => {
    showSuccess(
      n.title,
      `${n.body}\n\nบันทึกเมื่อ: ${new Date(n.createdAt).toLocaleString('th-TH')}`
    );
  };

  return (
    <div className="rounded-2xl border border-surface-200/80 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-surface-100">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary-600" />
          <h3 className="text-sm font-bold text-surface-900 font-prompt">
            การแจ้งเตือนสำคัญ
          </h3>
        </div>
        {unreadCount > 0 && (
          <span className="rounded-full bg-rose-50 border border-rose-200 px-2 py-0.5 text-[11px] font-bold text-rose-600">
            {unreadCount} รายการใหม่
          </span>
        )}
      </div>

      {/* List */}
      <div className="p-3 space-y-2.5">
        {notifications.length === 0 ? (
          <div className="py-6 text-center text-xs text-surface-400">
            ไม่มีการแจ้งเตือนในระบบ
          </div>
        ) : (
          notifications.slice(0, 4).map((n) => (
            <div
              key={n.id}
              onClick={() => handleItemClick(n)}
              className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-surface-50 cursor-pointer border border-transparent hover:border-surface-200/60 transition-all group"
            >
              <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${getNotificationBg(n.type)}`}>
                {getNotificationIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-surface-800 line-clamp-1 group-hover:text-primary-600 transition-colors">
                  {n.title}
                </p>
                <p className="text-[11px] text-surface-500 line-clamp-2 mt-0.5 leading-relaxed">
                  {n.body}
                </p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-[10px] text-surface-400">
                    {formatRelativeThaiTime(n.createdAt)}
                  </span>
                  <span className="text-[10px] font-semibold text-primary-600 group-hover:underline">
                    ดูรายละเอียด
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-surface-100 bg-surface-50/50">
        <button
          type="button"
          onClick={() => showToast('เปิดศูนย์การแจ้งเตือนทั้งหมด', 'info')}
          className="flex w-full items-center justify-center gap-1 text-xs font-semibold text-primary-700 hover:text-primary-900 py-1 transition-colors"
        >
          <span>ดูการแจ้งเตือนทั้งหมด</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
