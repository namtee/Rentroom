import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useDashboard } from '../../context/DashboardContext';
import { showSuccess } from '../../lib/alert';

export const MainLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { summary, markAsRead, markAllAsRead } = useDashboard();

  return (
    <div className="min-h-screen bg-[#f8fafc] text-surface-800 antialiased font-prompt flex">
      {summary && (
        <Sidebar
          property={summary.property}
          totalRooms={summary.rooms.total}
          occupiedRooms={summary.rooms.occupied}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />
      )}

      <div className={`flex-1 flex flex-col min-w-0 ${summary ? 'lg:pl-[252px]' : ''} transition-all`}>
        {summary && (
          <Topbar
            user={summary.user}
            property={summary.property}
            notifications={summary.notifications}
            unreadCount={summary.unreadNotifications}
            onToggleMobileSidebar={() => setMobileOpen(!mobileOpen)}
            onReadAllNotifications={() => void markAllAsRead()}
            onNotificationClick={(notification) => {
              void markAsRead(notification.id);
              showSuccess(notification.title, notification.body);
            }}
          />
        )}

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
