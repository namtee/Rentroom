export type PropertyType = 'CONDO' | 'ROOM_RENTAL' | 'APARTMENT' | 'DORMITORY' | 'COMMERCIAL' | 'OTHER';

export interface Property {
  id: string;
  name: string;
  type: PropertyType;
  typeLabel?: string | null;
  plan: 'FREE' | 'PREMIUM';
}

export interface UserProfile {
  id?: string;
  displayName: string;
  role: string;
  avatarUrl?: string | null;
  email?: string;
}

export interface FinanceMetric {
  value: number;
  changePct: number | null;
}

export interface FinanceChartItem {
  period: string; // e.g. "2026-09"
  income: number;
  expense: number;
}

export interface LatestRoom {
  id: string;
  number: string;
  floor: number;
  monthlyRent: number;
  status: 'OCCUPIED' | 'VACANT';
  coverImageUrl: string | null;
  tenantName: string | null;
  leaseEndDate: string | null;
}

export interface RecentPayment {
  id: string;
  tenantName: string;
  avatarUrl: string | null;
  roomNumber: string;
  amount: number;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  paidAt: string;
}

export interface AppNotification {
  id: string;
  propertyId: string;
  type: 'MAINTENANCE_NEW' | 'PAYMENT_RECEIVED' | 'LEASE_EXPIRING' | 'ROOM_AVAILABLE' | string;
  title: string;
  body: string;
  href: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface DashboardSummary {
  property: Property;
  user: UserProfile;
  unreadNotifications: number;
  rooms: {
    total: number;
    occupied: number;
    vacant: number;
    occupancyPct: number;
  };
  tenants: {
    total: number;
    male: number;
    female: number;
  };
  finance: {
    income: FinanceMetric;
    expense: FinanceMetric;
    profit: FinanceMetric;
    chart: FinanceChartItem[];
  };
  maintenance: {
    open: number;
    inProgress: number;
    pending: number;
  };
  latestRooms: LatestRoom[];
  recentPayments: RecentPayment[];
  notifications: AppNotification[];
}
