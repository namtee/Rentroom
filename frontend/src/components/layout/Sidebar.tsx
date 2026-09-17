import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  BedDouble,
  Users,
  FileText,
  CircleDollarSign,
  Wrench,
  FileBarChart,
  MessageSquareMore,
  Settings,
  Building2,
} from 'lucide-react';
import { PropertyCard } from './PropertyCard';
import type { Property } from '../../types';

interface SidebarProps {
  property: Property;
  totalRooms: number;
  occupiedRooms: number;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const menuItems = [
  { name: 'หน้าหลัก', path: '/', icon: Home },
  { name: 'ห้องพัก', path: '/rooms', icon: BedDouble },
  { name: 'ผู้เช่า', path: '/tenants', icon: Users },
  { name: 'สัญญาเช่า', path: '/leases', icon: FileText },
  { name: 'การเงิน', path: '/finance', icon: CircleDollarSign },
  { name: 'แจ้งซ่อม / บำรุงรักษา', path: '/maintenance', icon: Wrench },
  { name: 'รายงาน', path: '/reports', icon: FileBarChart },
  { name: 'ข้อความ', path: '/messages', icon: MessageSquareMore },
  { name: 'ตั้งค่า', path: '/settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({
  property,
  totalRooms,
  occupiedRooms,
  mobileOpen,
  onCloseMobile,
}) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-[252px] bg-gradient-to-b from-[#1e3a8a] via-[#172554] to-[#0a1128] text-white flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } shadow-2xl shadow-blue-950/40 select-none border-r border-blue-800/20`}
      >
        {/* Top: Logo & Branding */}
        <div className="p-5 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-[22px] font-bold tracking-tight text-white flex items-center gap-1 leading-none font-prompt">
                TeeHidZ
              </h1>
              <p className="text-[12px] text-blue-200/80 mt-1 font-normal tracking-wide">
                จัดการห้องเช่า/คอนโด...ให้ง่ายขึ้น
              </p>
            </div>
          </div>
        </div>

        {/* Middle: Navigation Menu (9 routes) */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1 scrollbar-thin scrollbar-thumb-blue-400/20">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={`flex items-center gap-3 px-3.5 h-12 rounded-xl text-[14px] transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-lg shadow-blue-600/30 ring-1 ring-white/20'
                    : 'text-blue-100/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-blue-300/80'}`} />
                <span className="truncate">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Section: PropertyCard + Tagline + SVG Decoration */}
        <div className="p-3.5 pt-1 space-y-3 relative overflow-hidden">
          {/* Property status card */}
          <PropertyCard
            property={property}
            totalRooms={totalRooms}
            occupiedRooms={occupiedRooms}
          />

          {/* Handwriting Tagline */}
          <div className="text-center px-2 py-1">
            <p className="font-handwriting text-[13px] text-blue-100/90 leading-tight transform -rotate-2 select-none">
              “ บริหารห้องเช่าและคอนโด<br />ให้เป็นเรื่องง่าย ด้วยเทคโนโลยี ”
            </p>
          </div>

          {/* Decorative SVG Hill & Skyline at bottom edge */}
          <div className="w-full h-8 opacity-15 overflow-hidden pointer-events-none -mb-3.5">
            <svg viewBox="0 0 252 32" fill="currentColor" className="w-full h-full text-sky-200">
              <path d="M0 32 L0 18 Q30 8 60 20 T130 15 Q180 5 210 20 T252 16 L252 32 Z" />
            </svg>
          </div>
        </div>
      </aside>
    </>
  );
};
