import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, MessageSquare, Search, Menu, Building2, CheckCircle2, AlertCircle,
  ChevronDown, User, LogOut, Settings, ShieldCheck
} from 'lucide-react';
import { UserProfile, Property, AppNotification } from '../../types';
import { clearAuthToken } from '../../lib/api';
import { showToast, showSuccess } from '../../lib/alert';
import { formatRelativeThaiTime } from '../../lib/format';

interface TopbarProps {
  user: UserProfile;
  property: Property;
  notifications: AppNotification[];
  unreadCount: number;
  onToggleMobileSidebar: () => void;
  onNotificationClick?: (notif: AppNotification) => void;
  onReadAllNotifications?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ user, property, notifications, unreadCount, onToggleMobileSidebar, onNotificationClick, onReadAllNotifications }) => {
  const navigate = useNavigate();
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleProfileClick = () => {
    showSuccess(`ผู้ใช้งาน: ${user.displayName}`, `สิทธิ์การใช้งาน: ${user.role}\nโครงการ: ${property.name}\nอีเมล: ${user.email || '-'}`);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-surface-200/80 bg-white/95 px-4 lg:px-6 backdrop-blur-md transition-all">
      <div className="flex items-center gap-3">
        <button type="button" onClick={onToggleMobileSidebar} aria-label="Toggle Navigation" className="rounded-lg p-2 text-surface-600 hover:bg-surface-100 lg:hidden focus:outline-none focus:ring-2 focus:ring-primary-500"><Menu className="h-6 w-6" /></button>
        <div className="relative hidden sm:block w-64 md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
          <input type="text" placeholder="ค้นหาเลขห้อง, ชื่อผู้เช่า..." className="h-9 w-full rounded-full border border-surface-200 bg-surface-50 pl-9 pr-4 text-xs md:text-sm text-surface-700 placeholder-surface-400 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100" onKeyDown={(e)=>{if(e.key==='Enter'){const q=(e.target as HTMLInputElement).value.trim();if(q){navigate('/tenants');showToast(`เปิดหน้าผู้เช่าเพื่อค้นหา: ${q}`,'info');}}}} />
        </div>
      </div>

      <div className="flex items-center gap-1.5 px-3 py-1 bg-primary-50 text-primary-800 rounded-full border border-primary-200 text-xs font-medium lg:hidden"><Building2 className="h-3.5 w-3.5 text-primary-600" /><span className="truncate max-w-[140px]">{property.name}</span></div>

      <div className="flex items-center gap-2 md:gap-3">
        <button type="button" onClick={()=>navigate('/messages')} title="ข้อความและการแจ้งเตือน" className="relative rounded-full p-2 text-surface-500 hover:bg-surface-100 hover:text-surface-700"><MessageSquare className="h-5 w-5" />{unreadCount>0&&<span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />}</button>

        <div className="relative">
          <button type="button" onClick={()=>{setShowNotifMenu(!showNotifMenu);setShowUserMenu(false);}} title="การแจ้งเตือน" className="relative rounded-full p-2 text-surface-500 hover:bg-surface-100 hover:text-surface-700"><Bell className="h-5 w-5" />{unreadCount>0&&<span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">{unreadCount>9?'9+':unreadCount}</span>}</button>
          {showNotifMenu&&<div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-surface-200 bg-white p-3 shadow-xl z-50" onMouseLeave={()=>setShowNotifMenu(false)}>
            <div className="flex items-center justify-between pb-2 mb-2 border-b"><div className="flex items-center gap-2"><Bell className="h-4 w-4 text-primary-600"/><span className="font-semibold text-sm">การแจ้งเตือน</span>{unreadCount>0&&<span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700">{unreadCount} ใหม่</span>}</div><button type="button" onClick={()=>{onReadAllNotifications?.();setShowNotifMenu(false);}} className="text-xs text-primary-600 font-medium">อ่านทั้งหมด</button></div>
            <div className="max-h-72 overflow-y-auto space-y-1">{notifications.length===0?<p className="py-6 text-center text-xs text-surface-400">ไม่มีการแจ้งเตือน</p>:notifications.slice(0,5).map(notif=><div key={notif.id} onClick={()=>{setShowNotifMenu(false);onNotificationClick?.(notif);}} className="group flex cursor-pointer items-start gap-3 p-2.5 rounded-xl hover:bg-surface-50"><div className={`mt-0.5 rounded-lg p-2 ${notif.type.includes('MAINTENANCE')?'bg-amber-100 text-amber-700':notif.type.includes('PAYMENT')?'bg-emerald-100 text-emerald-700':'bg-primary-100 text-primary-700'}`}>{notif.type.includes('MAINTENANCE')?<AlertCircle className="h-4 w-4"/>:<CheckCircle2 className="h-4 w-4"/>}</div><div className="flex-1 min-w-0"><p className="text-xs font-semibold text-surface-800">{notif.title}</p><p className="text-xs text-surface-500 truncate">{notif.body}</p><p className="mt-1 text-[10px] text-surface-400">{formatRelativeThaiTime(notif.createdAt)}</p></div></div>)}</div>
            <button onClick={()=>{setShowNotifMenu(false);navigate('/messages');}} className="mt-2 w-full rounded-lg border py-2 text-xs font-semibold text-primary-600">ดูทั้งหมด</button>
          </div>}
        </div>

        <div className="relative">
          <button type="button" onClick={()=>{setShowUserMenu(!showUserMenu);setShowNotifMenu(false);}} className="flex items-center gap-2.5 rounded-full border border-surface-200/80 bg-surface-50 py-1 pl-1 pr-3 hover:bg-surface-100"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white font-bold text-xs">{user.displayName.charAt(0)||'T'}</div><div className="hidden text-left md:block"><div className="text-xs font-semibold text-surface-800">{user.displayName}</div><div className="text-[10px] text-surface-500 flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-emerald-500"/>{user.role}</div></div><ChevronDown className="h-3.5 w-3.5 text-surface-400"/></button>
          {showUserMenu&&<div className="absolute right-0 mt-2 w-56 rounded-2xl border border-surface-200 bg-white p-2 shadow-xl z-50" onMouseLeave={()=>setShowUserMenu(false)}><div className="px-3 py-2 border-b"><p className="text-xs font-bold">{user.displayName}</p><p className="text-[11px] text-surface-500 truncate">{user.email||'-'}</p><span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-primary-50 text-[10px] font-semibold text-primary-700">{property.typeLabel||property.type} ({property.plan})</span></div><div className="py-1"><button type="button" onClick={()=>{setShowUserMenu(false);handleProfileClick();}} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-surface-700 hover:bg-surface-50"><User className="h-4 w-4"/>ข้อมูลส่วนตัว & บทบาท</button><button type="button" onClick={()=>{setShowUserMenu(false);navigate('/settings');}} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-surface-700 hover:bg-surface-50"><Settings className="h-4 w-4"/>ตั้งค่าห้องเช่า/ระบบ</button></div><div className="border-t pt-1"><button type="button" onClick={()=>{clearAuthToken();window.location.reload();}} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-rose-600 hover:bg-rose-50"><LogOut className="h-4 w-4"/>ออกจากระบบ</button></div></div>}
        </div>
      </div>
    </header>
  );
};
