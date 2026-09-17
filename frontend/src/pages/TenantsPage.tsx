import React, { useCallback, useEffect, useState } from 'react';
import { Search, Users } from 'lucide-react';
import Swal from 'sweetalert2';
import { ModuleHeader } from '../components/shared/ModuleHeader';
import { useDashboard } from '../context/DashboardContext';
import { createTenant, listTenants, type TenantRecord } from '../lib/api';
import { showError, showSuccess } from '../lib/alert';

export const TenantsPage: React.FC = () => {
  const { summary, refetch: refetchDashboard } = useDashboard();
  const propertyId = summary?.property.id;
  const [items, setItems] = useState<TenantRecord[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!propertyId) return;
    setLoading(true);
    try { setItems((await listTenants(propertyId, { search: search.trim() || undefined })).items); }
    catch (e) { showError('โหลดผู้เช่าไม่สำเร็จ', e instanceof Error ? e.message : 'เกิดข้อผิดพลาด'); }
    finally { setLoading(false); }
  }, [propertyId, search]);

  useEffect(() => { void load(); }, [load]);

  const addTenant = async () => {
    if (!propertyId) return;
    const result = await Swal.fire({
      title: 'เพิ่มผู้เช่า',
      html: '<input id="t-title" class="swal2-input" placeholder="คำนำหน้า เช่น นาย"><input id="t-first" class="swal2-input" placeholder="ชื่อ"><input id="t-last" class="swal2-input" placeholder="นามสกุล"><input id="t-phone" class="swal2-input" placeholder="เบอร์โทร"><select id="t-gender" class="swal2-select"><option value="UNSPECIFIED">ไม่ระบุเพศ</option><option value="MALE">ชาย</option><option value="FEMALE">หญิง</option></select>',
      showCancelButton: true, confirmButtonText: 'บันทึกลง SQL', cancelButtonText: 'ยกเลิก',
      preConfirm: () => {
        const title = (document.getElementById('t-title') as HTMLInputElement).value.trim();
        const firstName = (document.getElementById('t-first') as HTMLInputElement).value.trim();
        const lastName = (document.getElementById('t-last') as HTMLInputElement).value.trim();
        const phone = (document.getElementById('t-phone') as HTMLInputElement).value.trim();
        const gender = (document.getElementById('t-gender') as HTMLSelectElement).value as 'MALE' | 'FEMALE' | 'UNSPECIFIED';
        if (!title || !firstName || !lastName) { Swal.showValidationMessage('กรุณากรอกคำนำหน้า ชื่อ และนามสกุล'); return false; }
        return { title, firstName, lastName, phone: phone || null, gender };
      },
    });
    if (!result.value) return;
    try { await createTenant(propertyId, result.value); await Promise.all([load(), refetchDashboard()]); await showSuccess('เพิ่มผู้เช่าสำเร็จ', 'ข้อมูลถูกบันทึกใน PostgreSQL แล้ว'); }
    catch (e) { showError('บันทึกไม่สำเร็จ', e instanceof Error ? e.message : 'เกิดข้อผิดพลาด'); }
  };

  return <div className="space-y-6">
    <ModuleHeader title="ทะเบียนผู้เช่า" subtitle={`ข้อมูลจริงจาก PostgreSQL · ${summary?.property.name ?? ''}`} icon={Users} actionLabel="+ เพิ่มผู้เช่า" onAction={addTenant} />
    <div className="rounded-2xl border border-surface-200 bg-white p-4 shadow-sm"><div className="relative max-w-md"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหาชื่อ นามสกุล หรือเบอร์โทร..." className="h-10 w-full rounded-xl border border-surface-200 bg-surface-50 pl-9 pr-3 text-sm outline-none focus:border-primary-500" /></div></div>
    <div className="overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-surface-50 text-xs text-surface-500"><tr><th className="px-5 py-3">ชื่อผู้เช่า</th><th className="px-4 py-3">โทรศัพท์</th><th className="px-4 py-3">เพศ</th><th className="px-4 py-3">ห้องปัจจุบัน</th><th className="px-5 py-3">สถานะ</th></tr></thead><tbody className="divide-y divide-surface-100">{loading && items.length === 0 ? <tr><td colSpan={5} className="py-10 text-center text-xs text-surface-400">กำลังอ่านข้อมูล SQL...</td></tr> : items.length === 0 ? <tr><td colSpan={5} className="py-10 text-center text-xs text-surface-400">ไม่พบผู้เช่า</td></tr> : items.map((t) => { const lease=t.leases[0]; return <tr key={t.id} className="hover:bg-surface-50"><td className="px-5 py-3 font-semibold text-surface-900">{t.title}{t.firstName} {t.lastName}</td><td className="px-4 py-3 text-surface-600">{t.phone || '-'}</td><td className="px-4 py-3 text-surface-600">{t.gender==='MALE'?'ชาย':t.gender==='FEMALE'?'หญิง':'ไม่ระบุ'}</td><td className="px-4 py-3 text-surface-700">{lease ? `ห้อง ${lease.room.number}` : '-'}</td><td className="px-5 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${lease?'bg-emerald-50 text-emerald-700':'bg-surface-100 text-surface-500'}`}>{lease?'กำลังเช่า':'ไม่มีสัญญาใช้งาน'}</span></td></tr>; })}</tbody></table></div></div>
  </div>;
};
