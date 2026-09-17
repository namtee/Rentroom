import React from 'react';
import { FileSignature, PlusCircle, Receipt, Send, Wrench, Zap } from 'lucide-react';
import Swal from 'sweetalert2';
import { createExpense, createLease, createMaintenance, createRoom, createTenant, listRooms } from '../../lib/api';
import { showError, showSuccess, showToast } from '../../lib/alert';

interface QuickMenuProps {
  propertyId: string;
  onChanged: () => Promise<void>;
}

export const QuickMenu: React.FC<QuickMenuProps> = ({ propertyId, onChanged }) => {
  const handleAddRoom = async () => {
    const { value } = await Swal.fire({
      title: 'เพิ่มห้องพักใหม่',
      html: `
        <input id="room-number" class="swal2-input" placeholder="เลขห้อง เช่น 501">
        <input id="room-floor" type="number" class="swal2-input" placeholder="ชั้น">
        <input id="room-rent" type="number" class="swal2-input" placeholder="ค่าเช่ารายเดือน (บาท)">
      `,
      showCancelButton: true,
      confirmButtonText: 'บันทึก',
      cancelButtonText: 'ยกเลิก',
      preConfirm: () => {
        const number = (document.getElementById('room-number') as HTMLInputElement).value.trim();
        const floor = Number((document.getElementById('room-floor') as HTMLInputElement).value);
        const monthlyRent = Number((document.getElementById('room-rent') as HTMLInputElement).value);
        if (!number || !Number.isInteger(floor) || monthlyRent <= 0) {
          Swal.showValidationMessage('กรอกเลขห้อง ชั้น และค่าเช่าให้ถูกต้อง');
          return false;
        }
        return { number, floor, monthlyRent };
      },
    });
    if (!value) return;

    try {
      await createRoom(propertyId, value);
      await onChanged();
      await showSuccess('เพิ่มห้องพักแล้ว', `ห้อง ${value.number} ถูกบันทึกลงฐานข้อมูลเรียบร้อย`);
    } catch (error: unknown) {
      await showError('เพิ่มห้องไม่สำเร็จ', error instanceof Error ? error.message : 'เกิดข้อผิดพลาด');
    }
  };

  const handleNewLease = async () => {
    const { value } = await Swal.fire({
      title: 'ทำสัญญาเช่าใหม่',
      html: `
        <input id="tenant-first" class="swal2-input" placeholder="ชื่อ">
        <input id="tenant-last" class="swal2-input" placeholder="นามสกุล">
        <input id="tenant-phone" class="swal2-input" placeholder="เบอร์โทร (ไม่บังคับ)">
        <input id="lease-room" class="swal2-input" placeholder="เลขห้องว่าง เช่น 103">
        <input id="lease-start" type="date" class="swal2-input">
        <input id="lease-end" type="date" class="swal2-input">
        <input id="lease-deposit" type="number" class="swal2-input" placeholder="เงินประกัน (บาท)">
      `,
      showCancelButton: true,
      confirmButtonText: 'สร้างสัญญา',
      cancelButtonText: 'ยกเลิก',
      preConfirm: () => {
        const firstName = (document.getElementById('tenant-first') as HTMLInputElement).value.trim();
        const lastName = (document.getElementById('tenant-last') as HTMLInputElement).value.trim();
        const phone = (document.getElementById('tenant-phone') as HTMLInputElement).value.trim();
        const roomNumber = (document.getElementById('lease-room') as HTMLInputElement).value.trim();
        const startDate = (document.getElementById('lease-start') as HTMLInputElement).value;
        const endDate = (document.getElementById('lease-end') as HTMLInputElement).value;
        const deposit = Number((document.getElementById('lease-deposit') as HTMLInputElement).value);
        if (!firstName || !lastName || !roomNumber || !startDate || !endDate || deposit < 0) {
          Swal.showValidationMessage('กรอกชื่อ นามสกุล ห้อง วันที่สัญญา และเงินประกันให้ครบ');
          return false;
        }
        return { firstName, lastName, phone, roomNumber, startDate, endDate, deposit };
      },
    });
    if (!value) return;

    try {
      const rooms = await listRooms(propertyId, { status: 'VACANT', search: value.roomNumber, limit: 20 });
      const room = rooms.items.find((item) => item.number === value.roomNumber);
      if (!room) throw new Error(`ไม่พบห้องว่างหมายเลข ${value.roomNumber}`);

      const tenant = await createTenant(propertyId, {
        title: 'คุณ',
        firstName: value.firstName,
        lastName: value.lastName,
        gender: 'UNSPECIFIED',
        phone: value.phone || null,
      });
      await createLease(propertyId, {
        roomId: room.id,
        tenantId: tenant.id,
        startDate: new Date(`${value.startDate}T00:00:00+07:00`).toISOString(),
        endDate: new Date(`${value.endDate}T23:59:59+07:00`).toISOString(),
        rent: room.monthlyRent,
        deposit: value.deposit,
      });
      await onChanged();
      await showSuccess('สร้างสัญญาเช่าแล้ว', `${value.firstName} ${value.lastName} ห้อง ${room.number}`);
    } catch (error: unknown) {
      await showError('สร้างสัญญาไม่สำเร็จ', error instanceof Error ? error.message : 'เกิดข้อผิดพลาด');
    }
  };

  const handleMaintenance = async () => {
    const { value } = await Swal.fire({
      title: 'บันทึกแจ้งซ่อม',
      html: `
        <input id="maintenance-room" class="swal2-input" placeholder="เลขห้อง">
        <textarea id="maintenance-title" class="swal2-textarea" placeholder="รายละเอียดปัญหา"></textarea>
      `,
      showCancelButton: true,
      confirmButtonText: 'บันทึกแจ้งซ่อม',
      cancelButtonText: 'ยกเลิก',
      preConfirm: () => {
        const roomNumber = (document.getElementById('maintenance-room') as HTMLInputElement).value.trim();
        const title = (document.getElementById('maintenance-title') as HTMLTextAreaElement).value.trim();
        if (!roomNumber || title.length < 2) {
          Swal.showValidationMessage('กรอกเลขห้องและรายละเอียดปัญหา');
          return false;
        }
        return { roomNumber, title };
      },
    });
    if (!value) return;

    try {
      const rooms = await listRooms(propertyId, { search: value.roomNumber, limit: 20 });
      const room = rooms.items.find((item) => item.number === value.roomNumber);
      if (!room) throw new Error(`ไม่พบห้องหมายเลข ${value.roomNumber}`);
      await createMaintenance(propertyId, { roomId: room.id, title: value.title });
      await onChanged();
      await showSuccess('บันทึกแจ้งซ่อมแล้ว', `ห้อง ${room.number} ถูกบันทึกลงฐานข้อมูลเรียบร้อย`);
    } catch (error: unknown) {
      await showError('บันทึกแจ้งซ่อมไม่สำเร็จ', error instanceof Error ? error.message : 'เกิดข้อผิดพลาด');
    }
  };

  const handleAddExpense = async () => {
    const { value } = await Swal.fire({
      title: 'บันทึกรายจ่าย',
      html: `
        <input id="expense-category" class="swal2-input" placeholder="หมวดรายจ่าย">
        <input id="expense-amount" type="number" class="swal2-input" placeholder="จำนวนเงิน (บาท)">
        <textarea id="expense-note" class="swal2-textarea" placeholder="หมายเหตุ (ไม่บังคับ)"></textarea>
      `,
      showCancelButton: true,
      confirmButtonText: 'บันทึกรายจ่าย',
      cancelButtonText: 'ยกเลิก',
      preConfirm: () => {
        const category = (document.getElementById('expense-category') as HTMLInputElement).value.trim();
        const amount = Number((document.getElementById('expense-amount') as HTMLInputElement).value);
        const note = (document.getElementById('expense-note') as HTMLTextAreaElement).value.trim();
        if (!category || amount <= 0) {
          Swal.showValidationMessage('กรอกหมวดรายจ่ายและจำนวนเงินให้ถูกต้อง');
          return false;
        }
        return { category, amount, note };
      },
    });
    if (!value) return;

    try {
      await createExpense(propertyId, {
        category: value.category,
        amount: value.amount,
        spentAt: new Date().toISOString(),
        note: value.note || null,
      });
      await onChanged();
      await showSuccess('บันทึกรายจ่ายแล้ว', `${value.category} ${value.amount.toLocaleString()} บาท`);
    } catch (error: unknown) {
      await showError('บันทึกรายจ่ายไม่สำเร็จ', error instanceof Error ? error.message : 'เกิดข้อผิดพลาด');
    }
  };

  const unsupported = (feature: string) => () => {
    showToast(`${feature} ยังไม่มี Backend API จึงยังไม่บันทึกข้อมูล`, 'warning');
  };

  const actions = [
    { id: 'add-room', title: 'เพิ่มห้องพัก', desc: 'บันทึก SQL จริง', icon: PlusCircle, color: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100/80', action: handleAddRoom },
    { id: 'new-lease', title: 'ทำสัญญาเช่า', desc: 'ผู้เช่า + สัญญาจริง', icon: FileSignature, color: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100/80', action: handleNewLease },
    { id: 'meter', title: 'จดมิเตอร์', desc: 'ยังไม่มี Backend API', icon: Zap, color: 'bg-amber-50 text-amber-600 hover:bg-amber-100/80', action: unsupported('ระบบจดมิเตอร์') },
    { id: 'repair', title: 'บันทึกแจ้งซ่อม', desc: 'บันทึก SQL จริง', icon: Wrench, color: 'bg-rose-50 text-rose-600 hover:bg-rose-100/80', action: handleMaintenance },
    { id: 'expense', title: 'บันทึกรายจ่าย', desc: 'บันทึก SQL จริง', icon: Receipt, color: 'bg-purple-50 text-purple-600 hover:bg-purple-100/80', action: handleAddExpense },
    { id: 'broadcast', title: 'ส่งแจ้งเตือน', desc: 'ยังไม่มี Backend API', icon: Send, color: 'bg-sky-50 text-sky-600 hover:bg-sky-100/80', action: unsupported('Broadcast LINE') },
  ];

  return (
    <div className="rounded-2xl border border-surface-200/80 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-surface-100 mb-3">
        <h3 className="text-sm font-bold text-surface-900 font-prompt">เมนูด่วน</h3>
        <span className="text-[11px] text-surface-400">SQL Backend</span>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {actions.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.id} type="button" onClick={item.action} className={`flex flex-col items-start p-3 rounded-xl border border-surface-200/60 text-left transition-all hover:scale-[1.02] active:scale-[0.98] ${item.color}`}>
              <Icon className="h-5 w-5 mb-1.5" />
              <span className="text-xs font-bold text-surface-800 leading-tight">{item.title}</span>
              <span className="text-[10px] text-surface-500 line-clamp-1 mt-0.5">{item.desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
