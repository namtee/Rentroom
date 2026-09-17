import React from 'react';
import { 
  Building2, 
  Eye, 
  FileText, 
  Calendar, 
  User, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { LatestRoom } from '../../types';
import { formatCurrency, formatThaiDate } from '../../lib/format';
import { showSuccess, showToast } from '../../lib/alert';

interface LatestRoomsTableProps {
  rooms: LatestRoom[];
}

export const LatestRoomsTable: React.FC<LatestRoomsTableProps> = ({ rooms }) => {
  const handleViewRoomDetails = (room: LatestRoom) => {
    showSuccess(
      `ข้อมูลห้อง ${room.number}`,
      `ชั้น: ${room.floor}\n` +
      `ค่าเช่า: ${formatCurrency(room.monthlyRent)} / เดือน\n` +
      `สถานะ: ${room.status === 'OCCUPIED' ? 'มีผู้เช่า' : 'ห้องว่าง'}\n` +
      `ผู้เช่า: ${room.tenantName || 'ไม่มี (ว่าง)'}\n` +
      `วันสิ้นสุดสัญญา: ${room.leaseEndDate ? formatThaiDate(room.leaseEndDate) : '-'}`
    );
  };

  return (
    <div className="rounded-2xl border border-surface-200/80 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-surface-100">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-indigo-600"></div>
          <h3 className="text-base font-bold text-surface-900 font-prompt">
            ห้องพักล่าสุด (5 ห้อง)
          </h3>
        </div>
        <button
          type="button"
          onClick={() => showToast('กำลังนำไปหน้ารายการห้องพักทั้งหมด', 'info')}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-800 transition-colors"
        >
          <span>ดูห้องทั้งหมด</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-50 text-[11px] uppercase tracking-wider text-surface-500 font-semibold border-b border-surface-150">
            <tr>
              <th className="px-5 py-3.5">ห้อง / ชั้น</th>
              <th className="px-4 py-3.5">ผู้เช่าปัจจุบัน</th>
              <th className="px-4 py-3.5">ค่าเช่า / เดือน</th>
              <th className="px-4 py-3.5">สถานะ</th>
              <th className="px-4 py-3.5">สิ้นสุดสัญญา</th>
              <th className="px-5 py-3.5 text-right">การจัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {rooms.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-xs text-surface-400">
                  ไม่พบรายการห้องพัก
                </td>
              </tr>
            ) : (
              rooms.map((room) => {
                const isOccupied = room.status === 'OCCUPIED';
                return (
                  <tr 
                    key={room.id}
                    className="hover:bg-surface-50/70 transition-colors group"
                  >
                    {/* Room & Floor */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-xl font-bold font-mono text-xs ${
                          isOccupied 
                            ? 'bg-primary-50 text-primary-700' 
                            : 'bg-surface-100 text-surface-500'
                        }`}>
                          {room.number}
                        </div>
                        <div>
                          <p className="font-bold text-surface-900 group-hover:text-primary-600 transition-colors">
                            ห้อง {room.number}
                          </p>
                          <p className="text-[11px] text-surface-400">ชั้น {room.floor}</p>
                        </div>
                      </div>
                    </td>

                    {/* Tenant */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {isOccupied ? (
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-surface-100 flex items-center justify-center text-surface-600 text-[10px] font-bold">
                            {room.tenantName ? room.tenantName.charAt(0) : 'U'}
                          </div>
                          <span className="font-medium text-surface-800 text-xs">
                            {room.tenantName}
                          </span>
                        </div>
                      ) : (
                        <span className="text-surface-400 text-xs italic">- ห้องว่าง -</span>
                      )}
                    </td>

                    {/* Monthly Rent */}
                    <td className="px-4 py-3.5 whitespace-nowrap font-mono font-semibold text-surface-800 text-xs">
                      {formatCurrency(room.monthlyRent)}
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        isOccupied 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' 
                          : 'bg-surface-100 text-surface-600 border border-surface-200'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${isOccupied ? 'bg-emerald-500' : 'bg-surface-400'}`}></span>
                        {isOccupied ? 'มีผู้เช่า' : 'ห้องว่าง'}
                      </span>
                    </td>

                    {/* Lease End Date */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-xs text-surface-600">
                      {room.leaseEndDate ? (
                        <span className="flex items-center gap-1 text-[11px]">
                          <Calendar className="h-3.5 w-3.5 text-surface-400" />
                          {formatThaiDate(room.leaseEndDate)}
                        </span>
                      ) : (
                        <span className="text-surface-400 text-xs">-</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                      <button
                        type="button"
                        onClick={() => handleViewRoomDetails(room)}
                        title="ดูรายละเอียดห้อง"
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-surface-600 hover:bg-surface-100 hover:text-primary-700 transition-colors border border-surface-200/80"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>ดูข้อมูล</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
