import type { AppNotification, DashboardSummary, Property, PropertyType, UserProfile } from '../types';

const API_BASE = '/api';

interface AuthResponse {
  token: string;
  expiresIn: number;
  user: UserProfile;
}

export interface RoomRecord {
  id: string;
  number: string;
  floor: number;
  monthlyRent: number;
  status: 'OCCUPIED' | 'VACANT';
  leases?: Array<{
    id: string;
    startDate: string;
    endDate: string;
    rent: number;
    deposit: number;
    status: 'ACTIVE' | 'ENDED' | 'CANCELLED';
    tenant: { id: string; title: string; firstName: string; lastName: string; phone?: string | null };
  }>;
}

export interface TenantRecord {
  id: string;
  title: string;
  firstName: string;
  lastName: string;
  gender: 'MALE' | 'FEMALE' | 'UNSPECIFIED';
  phone: string | null;
  avatarUrl: string | null;
  leases: Array<{
    id: string;
    startDate: string;
    endDate: string;
    rent: number;
    deposit: number;
    status: 'ACTIVE' | 'ENDED' | 'CANCELLED';
    room: RoomRecord;
  }>;
}

export interface LeaseRecord {
  id: string;
  roomId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  rent: number;
  deposit: number;
  status: 'ACTIVE' | 'ENDED' | 'CANCELLED';
  room: RoomRecord;
  tenant: { id: string; title: string; firstName: string; lastName: string; phone: string | null };
}

export interface PaymentRecord {
  id: string;
  amount: number;
  period: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  paidAt: string | null;
  lease: LeaseRecord;
}

export interface ExpenseRecord {
  id: string;
  category: string;
  amount: number;
  spentAt: string;
  note: string | null;
}

export interface MaintenanceRecord {
  id: string;
  roomId: string;
  title: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
  createdAt: string;
  room: RoomRecord;
}

export interface PropertyDetails extends Property {
  role?: string;
  _count?: { rooms: number; tenants: number; expenses: number; notifications: number };
}

export interface PagedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
}

const TOKEN_KEY = 'teehidz_auth_token';

export function clearAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export async function getAuthToken(): Promise<string> {
  const existingToken = localStorage.getItem(TOKEN_KEY);
  if (existingToken) return existingToken;

  const res = await fetch(`${API_BASE}/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'owner@teehidz.local',
      bootstrapSecret: 'replace-this-local-bootstrap-secret',
    }),
  });

  if (!res.ok) throw new Error(`Authentication failed with status ${res.status}`);

  const data: AuthResponse = await res.json();
  localStorage.setItem(TOKEN_KEY, data.token);
  return data.token;
}

export async function fetchWithAuth<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  let token = await getAuthToken();
  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${token}`);
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');

  let res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

  if (res.status === 401) {
    clearAuthToken();
    token = await getAuthToken();
    headers.set('Authorization', `Bearer ${token}`);
    res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: res.statusText })) as { message?: string };
    throw new Error(errorData.message || `Request failed with status ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export function getDashboardSummary(propertyId: string): Promise<DashboardSummary> {
  return fetchWithAuth<DashboardSummary>(`/dashboard/summary?propertyId=${encodeURIComponent(propertyId)}`);
}

export function getCurrentUser(): Promise<{ user: UserProfile; properties: Property[] }> {
  return fetchWithAuth<{ user: UserProfile; properties: Property[] }>('/auth/me');
}

export function getProperty(propertyId: string): Promise<PropertyDetails> {
  return fetchWithAuth<PropertyDetails>(`/properties/${propertyId}`);
}

export function updateProperty(
  propertyId: string,
  input: { name?: string; type?: PropertyType; typeLabel?: string | null },
): Promise<PropertyDetails> {
  return fetchWithAuth<PropertyDetails>(`/properties/${propertyId}`, { method: 'PATCH', body: JSON.stringify(input) });
}

export function markNotificationAsRead(propertyId: string, notificationId: string): Promise<void> {
  return fetchWithAuth<void>(`/properties/${propertyId}/notifications/${notificationId}/read`, { method: 'PATCH' });
}

export function markAllNotificationsAsRead(propertyId: string): Promise<{ updated: number }> {
  return fetchWithAuth<{ updated: number }>(`/properties/${propertyId}/notifications/read-all`, { method: 'POST' });
}

export function listNotifications(propertyId: string, limit = 100): Promise<PagedResponse<AppNotification> & { unread: number }> {
  return fetchWithAuth<PagedResponse<AppNotification> & { unread: number }>(`/properties/${propertyId}/notifications?limit=${limit}`);
}

export function listRooms(
  propertyId: string,
  options: { status?: 'OCCUPIED' | 'VACANT'; search?: string; limit?: number } = {},
): Promise<PagedResponse<RoomRecord>> {
  const params = new URLSearchParams();
  if (options.status) params.set('status', options.status);
  if (options.search) params.set('search', options.search);
  params.set('limit', String(options.limit ?? 100));
  return fetchWithAuth<PagedResponse<RoomRecord>>(`/properties/${propertyId}/rooms?${params.toString()}`);
}

export function createRoom(propertyId: string, input: { number: string; floor: number; monthlyRent: number }): Promise<RoomRecord> {
  return fetchWithAuth<RoomRecord>(`/properties/${propertyId}/rooms`, { method: 'POST', body: JSON.stringify(input) });
}

export function listTenants(propertyId: string, options: { search?: string; limit?: number } = {}): Promise<PagedResponse<TenantRecord>> {
  const params = new URLSearchParams({ limit: String(options.limit ?? 100) });
  if (options.search) params.set('search', options.search);
  return fetchWithAuth<PagedResponse<TenantRecord>>(`/properties/${propertyId}/tenants?${params.toString()}`);
}

export function createTenant(
  propertyId: string,
  input: { title: string; firstName: string; lastName: string; gender?: 'MALE' | 'FEMALE' | 'UNSPECIFIED'; phone?: string | null },
): Promise<{ id: string }> {
  return fetchWithAuth<{ id: string }>(`/properties/${propertyId}/tenants`, { method: 'POST', body: JSON.stringify(input) });
}

export function listLeases(propertyId: string, options: { status?: LeaseRecord['status']; limit?: number } = {}): Promise<PagedResponse<LeaseRecord>> {
  const params = new URLSearchParams({ limit: String(options.limit ?? 100) });
  if (options.status) params.set('status', options.status);
  return fetchWithAuth<PagedResponse<LeaseRecord>>(`/properties/${propertyId}/leases?${params.toString()}`);
}

export function createLease(
  propertyId: string,
  input: { roomId: string; tenantId: string; startDate: string; endDate: string; rent: number; deposit: number },
): Promise<LeaseRecord> {
  return fetchWithAuth<LeaseRecord>(`/properties/${propertyId}/leases`, { method: 'POST', body: JSON.stringify(input) });
}

export function updateLease(propertyId: string, leaseId: string, input: Partial<Pick<LeaseRecord, 'startDate' | 'endDate' | 'rent' | 'deposit' | 'status'>>): Promise<LeaseRecord> {
  return fetchWithAuth<LeaseRecord>(`/properties/${propertyId}/leases/${leaseId}`, { method: 'PATCH', body: JSON.stringify(input) });
}

export function listPayments(propertyId: string, options: { status?: PaymentRecord['status']; period?: string; limit?: number } = {}): Promise<PagedResponse<PaymentRecord>> {
  const params = new URLSearchParams({ limit: String(options.limit ?? 100) });
  if (options.status) params.set('status', options.status);
  if (options.period) params.set('period', options.period);
  return fetchWithAuth<PagedResponse<PaymentRecord>>(`/properties/${propertyId}/finance/payments?${params.toString()}`);
}

export function createPayment(
  propertyId: string,
  input: { leaseId: string; amount: number; period: string; status: PaymentRecord['status']; paidAt?: string | null },
): Promise<PaymentRecord> {
  return fetchWithAuth<PaymentRecord>(`/properties/${propertyId}/finance/payments`, { method: 'POST', body: JSON.stringify(input) });
}

export function updatePayment(propertyId: string, paymentId: string, input: Partial<Pick<PaymentRecord, 'amount' | 'period' | 'status' | 'paidAt'>>): Promise<PaymentRecord> {
  return fetchWithAuth<PaymentRecord>(`/properties/${propertyId}/finance/payments/${paymentId}`, { method: 'PATCH', body: JSON.stringify(input) });
}

export function listExpenses(propertyId: string, options: { category?: string; limit?: number } = {}): Promise<PagedResponse<ExpenseRecord>> {
  const params = new URLSearchParams({ limit: String(options.limit ?? 100) });
  if (options.category) params.set('category', options.category);
  return fetchWithAuth<PagedResponse<ExpenseRecord>>(`/properties/${propertyId}/finance/expenses?${params.toString()}`);
}

export function createExpense(
  propertyId: string,
  input: { category: string; amount: number; spentAt: string; note?: string | null },
): Promise<ExpenseRecord> {
  return fetchWithAuth<ExpenseRecord>(`/properties/${propertyId}/finance/expenses`, { method: 'POST', body: JSON.stringify(input) });
}

export function listMaintenance(propertyId: string, options: { status?: MaintenanceRecord['status']; limit?: number } = {}): Promise<PagedResponse<MaintenanceRecord>> {
  const params = new URLSearchParams({ limit: String(options.limit ?? 100) });
  if (options.status) params.set('status', options.status);
  return fetchWithAuth<PagedResponse<MaintenanceRecord>>(`/properties/${propertyId}/maintenance?${params.toString()}`);
}

export function createMaintenance(propertyId: string, input: { roomId: string; title: string }): Promise<MaintenanceRecord> {
  return fetchWithAuth<MaintenanceRecord>(`/properties/${propertyId}/maintenance`, { method: 'POST', body: JSON.stringify(input) });
}

export function updateMaintenance(propertyId: string, maintenanceId: string, input: { title?: string; status?: MaintenanceRecord['status'] }): Promise<MaintenanceRecord> {
  return fetchWithAuth<MaintenanceRecord>(`/properties/${propertyId}/maintenance/${maintenanceId}`, { method: 'PATCH', body: JSON.stringify(input) });
}
