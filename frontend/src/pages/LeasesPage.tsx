import React, { useCallback, useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import Swal from 'sweetalert2';
import { ModuleHeader } from '../components/shared/ModuleHeader';
import { useDashboard } from '../context/DashboardContext';
import { createLease, listLeases, listRooms, listTenants, updateLease, type LeaseRecord } from '../lib/api';
import { showError, showSuccess } from '../lib/alert';
import { formatCurrency, formatThaiDate } from '../lib/format';

type LeaseFilter = 'ALL' | LeaseRecord['status'];

export const LeasesPage: React.FC = () => {
  const { summary, refetch: refetchDashboard } = useDashboard();
  const propertyId = summary?.property.id;
  const [items, setItems] = useState<LeaseRecord[]>([]);
  const [status, setStatus] = useState<LeaseFilter>('ALL');
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!propertyId) return;
    setLoading(true);
    try { setItems((await listLeases(propertyId, { status: status === 'ALL' ? undefined : status })).items); }
    catch (e) { showError('โหลดสัญญาไม่สำเร็จ', e instanceof Error ? e.message : 'เกิดข้อผิดพลาด'); }
    finally { setLoading(false); }
  }, [propertyId, status]);
  useEffect(() => { void load(); }, [load]);

  const addLease = async () => {
    if (!propertyId) return;
    try {
      const [rooms, tenants] = await Promise.all([listRooms(propertyId, { status: 'VACANT' }), listTenants(propertyId)]);
      if (!rooms.items.length || !tenants.items.length) { await Swal.fire('ยังสร้างสัญญาไม่ได้', 'ต้องมีห้องว่างและผู้เช่าอย่างน้อย 1 รายก่อน', 'warning'); return; }
      const start = new Date(); const end = new Date(start); end.setFullYear(end.getFullYear() + 1);
      const result = await Swal.fire({
        title: 'สร้างสัญญาเช่า',
        html: `<select id="l-room" class="swal2-select"></select><select id="l-tenant" class="swal2-select"></select><input id="l-start" type="date" class="swal2-input" value="${start.toISOString().slice(0,10)}"><input id="l-end" type="date" class="swal2-input" value="${end.toISOString().slice(0,10)}"><input id="l-rent" type="number" class="swal2-input" placeholder="ค่าเช่า"><input id="l-deposit" type="number" class="swal2-input" placeholder="เงินประกัน">`,
        showCancelButton: true, confirmButtonText: 'สร้างสัญญา', cancelButtonText: 'ยกเลิก',
        didOpen: () => {
          const roomSelect=document.getElementById('l-room') as HTMLSelectElement; rooms.items.forEach(r=>roomSelect.add(new Option(`ห้อง ${r.number} · ${r.monthlyRent.toLocaleString()} บาท`,r.id)));
          const tenantSelect=document.getElementById('l-tenant') as HTMLSelectElement; tenants.items.forEach(t=>tenantSelect.add(new Option(`${t.title}${t.firstName} ${t.lastName}`,t.id)));
        },
        preConfirm: () => {
          const roomId=(document.getElementById('l-room') as HTMLSelectElement).value; const tenantId=(document.getElementById('l-tenant') as HTMLSelectElement).value;
          const startDate=(document.getElementById('l-start') as HTMLInputElement).value; const endDate=(document.getElementById('l-end') as HTMLInputElement).value;
          const rent=Number((document.getElementById('l-rent') as HTMLInputElement).value); const deposit=Number((document.getElementById('l-deposit') as HTMLInputElement).value);
          if(!roomId||!tenantId||!startDate||!endDate||!Number.isInteger(rent)||rent<0||!Number.isInteger(deposit)||deposit<0){Swal.showValidationMessage('กรอกข้อมูลให้ครบและถูกต้อง');return false;} return {roomId,tenantId,startDate,endDate,rent,deposit};
        }
      });
      if (!result.value) return;
      await createLease(propertyId, result.value); await Promise.all([load(), refetchDashboard()]); await showSuccess('สร้างสัญญาสำเร็จ', 'สัญญาถูกบันทึกใน PostgreSQL และห้องเปลี่ยนเป็นมีผู้เช่าแล้ว');
    } catch (e) { showError('สร้างสัญญาไม่สำเร็จ', e instanceof Error ? e.message : 'เกิดข้อผิดพลาด'); }
  };

  const changeStatus = async (lease: LeaseRecord, next: 'ENDED'|'CANCELLED') => {
    if (!propertyId) return;
    try { await updateLease(propertyId, lease.id, { status: next }); await Promise.all([load(), refetchDashboard()]); }
    catch (e) { showError('อัปเดตสัญญาไม่สำเร็จ', e instanceof Error ? e.message : 'เกิดข้อผิดพลาด'); }
  };

  return <div className="space-y-6">
    <ModuleHeader title="สัญญาเช่า" subtitle={`สัญญาจริงจาก PostgreSQL · ${summary?.property.name ?? ''}`} icon={FileText} actionLabel="+ สร้างสัญญา" onAction={addLease} />
    <div className="rounded-2xl border border-surface-200 bg-white p-4 shadow-sm"><select value={status} onChange={(e)=>setStatus(e.target.value as LeaseFilter)} className="h-10 rounded-xl border border-surface-200 px-3 text-sm"><option value="ALL">ทุกสถานะ</option><option value="ACTIVE">ใช้งานอยู่</option><option value="ENDED">สิ้นสุดแล้ว</option><option value="CANCELLED">ยกเลิก</option></select></div>
    <div className="overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-surface-50 text-xs text-surface-500"><tr><th className="px-5 py-3">ห้อง</th><th className="px-4 py-3">ผู้เช่า</th><th className="px-4 py-3">ช่วงสัญญา</th><th className="px-4 py-3">ค่าเช่า</th><th className="px-4 py-3">เงินประกัน</th><th className="px-4 py-3">สถานะ</th><th className="px-5 py-3">จัดการ</th></tr></thead><tbody className="divide-y divide-surface-100">{loading&&items.length===0?<tr><td colSpan={7} className="py-10 text-center text-xs text-surface-400">กำลังอ่านข้อมูล SQL...</td></tr>:items.map(l=><tr key={l.id} className="hover:bg-surface-50"><td className="px-5 py-3 font-bold">ห้อง {l.room.number}</td><td className="px-4 py-3">{l.tenant.title}{l.tenant.firstName} {l.tenant.lastName}</td><td className="px-4 py-3 text-xs">{formatThaiDate(l.startDate)} - {formatThaiDate(l.endDate)}</td><td className="px-4 py-3 font-mono text-xs">{formatCurrency(l.rent)}</td><td className="px-4 py-3 font-mono text-xs">{formatCurrency(l.deposit)}</td><td className="px-4 py-3"><span className="rounded-full bg-surface-100 px-2.5 py-1 text-xs font-semibold">{l.status==='ACTIVE'?'ใช้งานอยู่':l.status==='ENDED'?'สิ้นสุดแล้ว':'ยกเลิก'}</span></td><td className="px-5 py-3">{l.status==='ACTIVE'&&<div className="flex gap-1"><button onClick={()=>void changeStatus(l,'ENDED')} className="rounded-lg border px-2 py-1 text-xs">สิ้นสุด</button><button onClick={()=>void changeStatus(l,'CANCELLED')} className="rounded-lg border border-rose-200 px-2 py-1 text-xs text-rose-600">ยกเลิก</button></div>}</td></tr>)}</tbody></table></div></div>
  </div>;
};
