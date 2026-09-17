import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  Building2, 
  BedDouble, 
  Users, 
  FileText, 
  CircleDollarSign, 
  Wrench, 
  FileBarChart, 
  MessageSquareMore, 
  Settings,
  ArrowLeft,
  Plus
} from 'lucide-react';
import { showSuccess, showToast } from '../lib/alert';

interface PageMeta {
  title: string;
  subtitle: string;
  icon: React.ElementType;
}

const pageConfigs: Record<string, PageMeta> = {
  '/rooms': {
    title: 'ผังห้องพัก & สถานะ',
    subtitle: 'จัดการสถานะห้องพัก 48 ห้อง ทั้งห้องว่างและห้องที่มีผู้เช่า',
    icon: BedDouble,
  },
  '/tenants': {
    title: 'ทะเบียนผู้เช่า',
    subtitle: 'รายชื่อผู้เช่า ประวัติผู้พักอาศัย ข้อมูลการติดต่อ และเอกสาร',
    icon: Users,
  },
  '/leases': {
    title: 'สัญญาเช่า',
    subtitle: 'ระบบจัดการสัญญาเช่า วันเริ่มต้น-สิ้นสุด และเงื่อนไขเงินประกัน',
    icon: FileText,
  },
  '/finance': {
    title: 'การเงิน & ค่าเช่า',
    subtitle: 'ออกบิลค่าเช่า จดมิเตอร์น้ำ-ไฟ บันทึกรายรับ-รายจ่าย',
    icon: CircleDollarSign,
  },
  '/maintenance': {
    title: 'แจ้งซ่อม & งานช่าง',
    subtitle: 'ติดตามสถานะการแจ้งซ่อม อะไหล่ และประวัติการบำรุงรักษา',
    icon: Wrench,
  },
  '/reports': {
    title: 'รายงาน & สถิติ',
    subtitle: 'สรุปรายได้ ประวัติการเข้าพัก อัตราการเช่า และสถิติย้อนหลัง',
    icon: FileBarChart,
  },
  '/messages': {
    title: 'ระบบข้อความ & LINE OA',
    subtitle: 'ส่งข้อความแจ้งเตือนบิล ข่าวสารประชาสัมพันธ์ตรงถึงมือถือผู้เช่า',
    icon: MessageSquareMore,
  },
  '/settings': {
    title: 'ตั้งค่าระบบ',
    subtitle: 'กำหนดประเภทที่พัก (ห้องเช่า/คอนโด/หอพัก), ค่าบริการ, อัตราค่าน้ำค่าไฟ',
    icon: Settings,
  },
};

export const PlaceholderPage: React.FC = () => {
  const location = useLocation();
  const config = pageConfigs[location.pathname] || {
    title: 'โมดูลระบบ',
    subtitle: 'ระบบกำลังโหลดข้อมูล...',
    icon: Building2,
  };

  const Icon = config.icon;

  const handleAction = () => {
    showSuccess(
      `ดำเนินการในหน้า ${config.title}`,
      'คุณสามารถเพิ่มรายการ หรือส่งออกข้อมูลได้ทันทีผ่านระบบหลังบ้าน'
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-surface-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-surface-400 mb-1">
            <Link to="/" className="hover:text-primary-600 transition-colors">
              หน้าหลัก
            </Link>
            <span>/</span>
            <span className="text-surface-700 font-medium">{config.title}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 shadow-sm">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-surface-900 font-prompt">
                {config.title}
              </h1>
              <p className="text-xs text-surface-500">{config.subtitle}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-xl border border-surface-200 bg-white px-3 py-2 text-xs font-semibold text-surface-600 hover:bg-surface-50 shadow-sm transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>กลับหน้าหลัก</span>
          </Link>
          <button
            type="button"
            onClick={handleAction}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary-600 px-4 py-2 text-xs font-semibold text-white hover:bg-primary-700 shadow-sm shadow-primary-600/20 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>เพิ่มข้อมูลใหม่</span>
          </button>
        </div>
      </div>

      {/* Feature Content Card */}
      <div className="rounded-2xl border border-surface-200/80 bg-white p-8 text-center shadow-sm max-w-2xl mx-auto my-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 mb-4">
          <Icon className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-bold text-surface-900 font-prompt">
          โมดูล {config.title} พร้อมเชื่อมต่อ SQL
        </h3>
        <p className="text-xs sm:text-sm text-surface-500 mt-2 max-w-md mx-auto leading-relaxed">
          เชื่อมต่อข้อมูลแบบเรียลไทม์กับฐานข้อมูล PostgreSQL สามารถเรียกดูและอัปเดตข้อมูลได้โดยตรงผ่าน API
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => showToast('ข้อมูลอัปเดตเรียบร้อยแล้ว', 'success')}
            className="rounded-xl border border-surface-200 bg-surface-50 px-4 py-2 text-xs font-semibold text-surface-700 hover:bg-surface-100 transition-colors"
          >
            ตรวจสอบการเชื่อมต่อ
          </button>
        </div>
      </div>
    </div>
  );
};
