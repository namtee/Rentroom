import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
  ArrowLeft,
  BedDouble,
  Building2,
  CircleDollarSign,
  Plus,
  RefreshCw,
  Search,
  User,
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { createRoom, listRooms, type RoomRecord } from '../lib/api';
import { showError, showSuccess } from '../lib/alert';
import { formatCurrency, formatThaiDate } from '../lib/format';

type StatusFilter = 'ALL' | 'OCCUPIED' | 'VACANT';

export const RoomsPage: React.FC = () => {
  const { summary, loading: dashboardLoading, refetch: refetchDashboard } = useDashboard();
  const [rooms, setRooms] = useState<RoomRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('ALL');

  const propertyId = summary?.property.id;

  const loadRooms = useCallback(async () => {
    if (!propertyId) return;
    try {
      setLoading(true);
      setError(null);
      const result = await listRooms(propertyId, {
        status: status === 'ALL' ? undefined : status,
        search: search.trim() || undefined,
        limit: 100,
      });
      setRooms(result.items);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'ไม่สามารถโหลดข้อมูลห้องพักได้';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [propertyId, search, status]);

  useEffect(() => {
    void loadRooms();
  }, [loadRooms]);

  const occupiedCount = useMemo(() => rooms.filter((room) => room.status === 'OCCUPIED').length, [rooms]);
  const vacantCount = useMemo(() => rooms.filter((room) => room.status === 'VACANT').length, [rooms]);

  const handleAddRoom = async () => {
    if (!propertyId) return;

    const { value } = await Swal.fire({
      title: 'เพิ่มห้องพักใหม่',
      html: `
        <div style="text-align:left;font-family:Prompt,sans-serif;font-size:13px">
          <label style="display:block;margin-bottom:4px;font-weight:600;color:#334155">หมายเลขห้อง</label>
          <input id="room-number" class="swal2-input" placeholder="เช่น 501" style="width:90%;margin:0 0 12px">
          <label style="display:block;margin-bottom:4px;font-weight:600;color:#334155">ชั้น</label>
          <input id="room-floor" type="number" class="swal2-input" placeholder="เช่น 5" style="width:90%;margin:0 0 12px">
          <label style="display:block;margin-bottom:4px;font-weight:600;color:#334155">ค่าเช่าต่อเดือน (บาท)</label>
          <input id="room-rent" type="number" class="swal2-input" placeholder="เช่น 4500" style="width:90%;margin:0">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'บันทึกลง SQL',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#2563eb',
      focusConfirm: false,
      preConfirm: () => {
        const number = (document.getElementById('room-number') as HTMLInputElement | null)?.value.trim() ?? '';
        const floorText = (document.getElementById('room-floor') as HTMLInputElement | null)?.value ?? '';
        const rentText = (document.getElementById('room-rent') as HTMLInputElement | null)?.value ?? '';
        const floor = Number(floorText);
        const monthlyRent = Number(rentText);
        if (!number || !Number.isInteger(floor) || !Number.isInteger(monthlyRent) || monthlyRent <= 0) {
          Swal.showValidationMessage('กรุณากรอกเลขห้อง ชั้น และค่าเช่าให้ถูกต้อง');
          return false;
        }
        return { number, floor, monthlyRent };
      },
    });

    if (!value) return;

    try {
      const room = await createRoom(propertyId, value);
      await Promise.all([loadRooms(), refetchDashboard()]);
      await showSuccess('เพิ่มห้องสำเร็จ', `ห้อง ${room.number} ถูกบันทึกลง PostgreSQL แล้ว`);
    } catch (err: unknown) {
      showError('เพิ่มห้องไม่สำเร็จ', err instanceof Error ? err.message : 'ไม่สามารถบันทึกข้อมูลได้');
    }
  };

  if (dashboardLoading && !summary) {
    return <div className="py-20 text-center text-sm text-surface-500">กำลังโหลดข้อมูลโครงการจาก SQL...</div>;
  }

  if (!summary) {
    return <div className="py-20 text-center text-sm text-rose-600">ไม่พบข้อมูลโครงการที่สามารถใช้งานได้</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-surface-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-xs text-surface-400">
            <Link to="/" className="transition-colors hover:text-primary-600">หน้าหลัก</Link>
            <span>/</span>
            <span className="font-medium text-surface-700">ผังห้องพัก & สถานะ</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 shadow-sm">
              <BedDouble className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-prompt text-xl font-bold text-surface-900">ผังห้องพัก & สถานะ</h1>
              <p className="text-xs text-surface-500">
                ข้อมูลจริงจาก PostgreSQL · {summary.property.name} · ห้องทั้งหมด {summary.rooms.total} ห้อง
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/" className="inline-flex items-center gap-1.5 rounded-xl border border-surface-200 bg-white px-3 py-2 text-xs font-semibold text-surface-600 shadow-sm hover:bg-surface-50">
            <ArrowLeft className="h-3.5 w-3.5" />
            กลับหน้าหลัก
          </Link>
          <button type="button" onClick={handleAddRoom} className="inline-flex items-center gap-1.5 rounded-xl bg-primary-600 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-primary-600/20 hover:bg-primary-700">
            <Plus className="h-3.5 w-3.5" />
            เพิ่มห้องใหม่
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-surface-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600"><Building2 className="h-5 w-5" /></div>
            <div><p className="text-xs text-surface-500">ห้องที่แสดง</p><p className="text-xl font-bold text-surface-900">{rooms.length}</p></div>
          </div>
        </div>
        <div className="rounded-2xl border border-surface-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600"><User className="h-5 w-5" /></div>
            <div><p className="text-xs text-surface-500">มีผู้เช่า</p><p className="text-xl font-bold text-surface-900">{occupiedCount}</p></div>
          </div>
        </div>
        <div className="rounded-2xl border border-surface-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600"><BedDouble className="h-5 w-5" /></div>
            <div><p className="text-xs text-surface-500">ห้องว่าง</p><p className="text-xl font-bold text-surface-900">{vacantCount}</p></div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-surface-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ค้นหาเลขห้อง..."
              className="h-10 w-full rounded-xl border border-surface-200 bg-surface-50 pl-9 pr-3 text-sm outline-none focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <div className="flex items-center gap-2">
            <select value={status} onChange={(event) => setStatus(event.target.value as StatusFilter)} className="h-10 rounded-xl border border-surface-200 bg-white px-3 text-xs font-medium text-surface-700 outline-none focus:border-primary-500">
              <option value="ALL">ทุกสถานะ</option>
              <option value="OCCUPIED">มีผู้เช่า</option>
              <option value="VACANT">ห้องว่าง</option>
            </select>
            <button type="button" onClick={() => void loadRooms()} className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-surface-200 bg-white px-3 text-xs font-semibold text-surface-700 hover:bg-surface-50">
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              รีเฟรช
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
      )}

      <div className="overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-surface-200 bg-surface-50 text-[11px] font-semibold uppercase tracking-wider text-surface-500">
              <tr>
                <th className="px-5 py-3.5">ห้อง</th>
                <th className="px-4 py-3.5">ชั้น</th>
                <th className="px-4 py-3.5">ผู้เช่าปัจจุบัน</th>
                <th className="px-4 py-3.5">ค่าเช่า</th>
                <th className="px-4 py-3.5">สถานะ</th>
                <th className="px-5 py-3.5">สิ้นสุดสัญญา</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {loading && rooms.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-xs text-surface-400">กำลังอ่านข้อมูลห้องจาก PostgreSQL...</td></tr>
              ) : rooms.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-xs text-surface-400">ไม่พบห้องตามเงื่อนไขที่ค้นหา</td></tr>
              ) : rooms.map((room) => {
                const activeLease = room.leases?.[0];
                const tenantName = activeLease ? `${activeLease.tenant.title} ${activeLease.tenant.firstName} ${activeLease.tenant.lastName}` : null;
                return (
                  <tr key={room.id} className="transition-colors hover:bg-surface-50/70">
                    <td className="px-5 py-3.5 font-bold text-surface-900">ห้อง {room.number}</td>
                    <td className="px-4 py-3.5 text-surface-600">{room.floor}</td>
                    <td className="px-4 py-3.5 text-xs text-surface-700">{tenantName ?? <span className="text-surface-400">- ไม่มีผู้เช่า -</span>}</td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-surface-800"><CircleDollarSign className="h-3.5 w-3.5 text-surface-400" />{formatCurrency(room.monthlyRent)}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${room.status === 'OCCUPIED' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-surface-200 bg-surface-100 text-surface-600'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${room.status === 'OCCUPIED' ? 'bg-emerald-500' : 'bg-surface-400'}`} />
                        {room.status === 'OCCUPIED' ? 'มีผู้เช่า' : 'ห้องว่าง'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-surface-600">{activeLease?.endDate ? formatThaiDate(activeLease.endDate) : '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
