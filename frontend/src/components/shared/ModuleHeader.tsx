import React from 'react';
import { ArrowLeft, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ModuleHeaderProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
}

export const ModuleHeader: React.FC<ModuleHeaderProps> = ({ title, subtitle, icon: Icon, actionLabel, onAction }) => (
  <div className="flex flex-col gap-4 border-b border-surface-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <div className="mb-1 flex items-center gap-2 text-xs text-surface-400">
        <Link to="/" className="hover:text-primary-600">หน้าหลัก</Link><span>/</span><span className="font-medium text-surface-700">{title}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600"><Icon className="h-5 w-5" /></div>
        <div><h1 className="font-prompt text-xl font-bold text-surface-900">{title}</h1><p className="text-xs text-surface-500">{subtitle}</p></div>
      </div>
    </div>
    <div className="flex gap-2">
      <Link to="/" className="inline-flex items-center gap-1.5 rounded-xl border border-surface-200 bg-white px-3 py-2 text-xs font-semibold text-surface-600 hover:bg-surface-50"><ArrowLeft className="h-3.5 w-3.5" />กลับหน้าหลัก</Link>
      {actionLabel && onAction && <button type="button" onClick={onAction} className="rounded-xl bg-primary-600 px-4 py-2 text-xs font-semibold text-white hover:bg-primary-700">{actionLabel}</button>}
    </div>
  </div>
);
