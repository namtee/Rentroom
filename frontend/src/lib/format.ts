// format.ts — ฟังก์ชันจัดรูปแบบตัวเลข วันที่ และสกุลเงินภาษาไทย

export function formatBaht(value: number): string {
  return `฿ ${value.toLocaleString('th-TH')}`;
}

export function formatBahtText(value: number): string {
  return `${value.toLocaleString('th-TH')} บาท`;
}

export function formatRent(value: number): string {
  return `${value.toLocaleString('th-TH')} บาท/เดือน`;
}

export function formatThaiDateLong(dateInput: string | Date): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '-';
  return new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Bangkok',
  }).format(d);
}

export function formatThaiDateShort(dateInput: string | Date): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '-';
  return new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Bangkok',
  }).format(d);
}

export function formatThaiTime(dateInput: string | Date): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '-';
  const timeStr = new Intl.DateTimeFormat('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Bangkok',
  }).format(d);
  return `${timeStr} น.`;
}

export function formatRelativeTh(dateInput: string | Date, now: Date = new Date()): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '-';
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'เมื่อสักครู่';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} ชม.ที่แล้ว`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay <= 7) return `${diffDay} วันที่แล้ว`;
  return formatThaiDateShort(d);
}

export function formatChangePct(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  if (value > 0) return `↑ ${value}%`;
  if (value < 0) return `↓ ${Math.abs(value)}%`;
  return `0%`;
}

export function stripThaiTitle(name: string): string {
  if (!name) return '';
  return name.replace(/^(นาย|นางสาว|น\.ส\.|นาง)\s*/, '').trim();
}

export function getInitials(name: string): string {
  const clean = stripThaiTitle(name);
  if (!clean) return 'TH';
  const parts = clean.split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0]!.charAt(0)}${parts[1]!.charAt(0)}`;
  }
  return clean.slice(0, 2);
}

// Aliases & Convenience helpers
export const formatCurrency = formatBaht;
export const formatThaiDate = formatThaiDateShort;
export const formatRelativeThaiTime = formatRelativeTh;

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatThaiDateTime(dateInput: string | Date): string {
  return `${formatThaiDateLong(dateInput)} ${formatThaiTime(dateInput)}`;
}

