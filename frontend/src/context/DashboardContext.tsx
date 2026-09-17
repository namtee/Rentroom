import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DashboardSummary } from '../types';
import { getCurrentUser, getDashboardSummary, markAllNotificationsAsRead, markNotificationAsRead } from '../lib/api';
import { showError, showToast } from '../lib/alert';

interface DashboardContextType {
  summary: DashboardSummary | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const session = await getCurrentUser();
      const property = session.properties[0];
      if (!property) throw new Error('บัญชีนี้ยังไม่มีโครงการ/ที่พักที่สามารถเข้าถึงได้');
      setSummary(await getDashboardSummary(property.id));
    } catch (error: unknown) {
      console.error('Error fetching dashboard summary:', error);
      const errMsg = error instanceof Error ? error.message : 'ไม่สามารถเชื่อมต่อฐานข้อมูลได้';
      setError(errMsg);
      showError('การเชื่อมต่อล้มเหลว', `ไม่สามารถดึงข้อมูลจาก SQL Backend: ${errMsg}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleMarkAsRead = useCallback(async (notificationId: string) => {
    if (!summary) return;
    try {
      await markNotificationAsRead(summary.property.id, notificationId);
      setSummary((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          unreadNotifications: Math.max(0, prev.unreadNotifications - 1),
          notifications: prev.notifications.map((item) =>
            item.id === notificationId ? { ...item, readAt: new Date().toISOString() } : item,
          ),
        };
      });
      showToast('อ่านการแจ้งเตือนแล้ว', 'success');
    } catch (error: unknown) {
      console.error('Failed to mark notification as read:', error);
      showError('บันทึกไม่สำเร็จ', error instanceof Error ? error.message : 'ไม่สามารถอัปเดตการแจ้งเตือนได้');
    }
  }, [summary]);

  const handleMarkAllAsRead = useCallback(async () => {
    if (!summary) return;
    try {
      await markAllNotificationsAsRead(summary.property.id);
      await fetchSummary();
    } catch (error: unknown) {
      showError('บันทึกไม่สำเร็จ', error instanceof Error ? error.message : 'ไม่สามารถอัปเดตการแจ้งเตือนได้');
    }
  }, [summary, fetchSummary]);

  useEffect(() => {
    void fetchSummary();
  }, [fetchSummary]);

  return (
    <DashboardContext.Provider value={{ summary, loading, error, refetch: fetchSummary, markAsRead: handleMarkAsRead, markAllAsRead: handleMarkAllAsRead }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) throw new Error('useDashboard must be used within a DashboardProvider');
  return context;
};
