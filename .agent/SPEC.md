# SPEC.md — TeeHidZ (ระบบจัดการห้องเช่า/คอนโด)

> สเปกการทำงานของระบบ โฟกัสที่หน้า Dashboard (หน้าหลัก) เป็นเฟสแรก
> รองรับห้องเช่า คอนโด หอพัก และอสังหาริมทรัพย์ให้เช่าหลากหลายรูปแบบ โดยประเภทที่พักสามารถกำหนดได้จากระบบหลังบ้าน ไม่จำกัดตายตัว
> ดีไซน์ดูที่ `DESIGN.md` · กฎการเขียนโค้ดดูที่ `RULES.md`

---

## 1. เป้าหมาย

เจ้าของห้องเช่า/คอนโด (หรือผู้ดูแลอสังหาฯ ให้เช่า) เปิดหน้าหลักแล้วตอบได้ภายใน 10 วินาทีว่า:

1. ตอนนี้มีห้องว่างกี่ห้อง มีผู้เช่ากี่คน
2. เดือนนี้เก็บเงินได้เท่าไร กำไรเท่าไร เทียบเดือนก่อนเป็นอย่างไร
3. มีงานอะไรค้างที่ต้องทำ (แจ้งซ่อม สัญญาใกล้หมด)
4. ไปทำงานที่ทำบ่อยได้ในคลิกเดียว (เพิ่มผู้เช่า บันทึกค่าเช่า ฯลฯ)

### ขอบเขต

| เฟส | สิ่งที่ทำ |
|---|---|
| **Phase 1 (MVP)** | Layout (Sidebar + Topbar), หน้า Dashboard ครบทุกการ์ดพร้อมข้อมูลจริงจาก DB, seed data, API สรุปข้อมูล |
| Phase 2 | CRUD: ห้องพัก/ยูนิต, ผู้เช่า, สัญญาเช่า, การชำระเงิน, รายจ่าย, แจ้งซ่อม |
| Phase 3 | รายงาน, ข้อความ, การแจ้งเตือนแบบ real-time, ตั้งค่าประเภทอสังหาฯ (ห้องเช่า/คอนโด/หอพัก), หลายโครงการต่อบัญชี |

หน้าอื่นใน Phase 1 ให้สร้างเป็น placeholder ที่มีหัวข้อหน้าและข้อความ "กำลังพัฒนา" เพื่อให้เมนูกดได้ครบ

---

## 2. Tech Stack (ข้อเสนอ — ปรับได้)

| ส่วน | เลือกใช้ |
|---|---|
| Build Tool & Dev Server | Vite |
| Framework / Library | React + TypeScript (strict) |
| Routing | react-router-dom |
| UI | Tailwind CSS + shadcn/ui |
| Popup / Alert / Dialog | SweetAlert2 (`sweetalert2` + `sweetalert2-react-content`) |
| ไอคอน | lucide-react |
| กราฟ | Recharts |
| Database & ORM | PostgreSQL + Prisma (**ใช้ฐานข้อมูล SQL จริงเท่านั้น ห้าม mock data**) |
| Validation | Zod |
| Auth | Supabase Auth หรือ Custom JWT |
| Test | Vitest (unit) + Playwright (e2e) |
| Package manager | pnpm |

---

## 3. โครงสร้างโปรเจกต์

```
server/
├─ index.ts          # Backend API Server (Express/Hono) เชื่อมต่อ DB จริง
├─ routes/
│  └─ dashboard.ts   # GET /api/dashboard/summary (query Prisma จาก PostgreSQL จริง)
└─ db.ts             # Prisma Client instance
src/
├─ pages/
│  ├─ DashboardPage.tsx          # หน้าหลัก (Dashboard)
│  ├─ rooms/  tenants/  leases/  finance/
│  ├─ maintenance/  reports/  messages/  settings/
│  └─ notifications/  help/
├─ components/
│  ├─ layout/        Sidebar.tsx, Topbar.tsx, PropertyCard.tsx, MainLayout.tsx
│  ├─ dashboard/     HeroBanner.tsx, KpiCard.tsx, IncomeExpenseCard.tsx,
│  │                 RoomStatusCard.tsx, LatestRoomsTable.tsx,
│  │                 RecentPaymentsList.tsx, NotificationsPanel.tsx,
│  │                 QuickMenu.tsx, PromoCard.tsx
│  └─ ui/            # shadcn/ui
├─ lib/
│  ├─ alert.ts       # SweetAlert2 helper (MySwal) ปรับแต่งธีม/สีระบบ
│  ├─ api.ts         # Client API fetcher (ดึงข้อมูลจาก backend SQL จริง)
│  ├─ format.ts      # formatBaht, formatThaiDate, formatThaiTime, formatRelativeTh, stripThaiTitle
│  └─ kpi.ts         # ฟังก์ชันคำนวณ KPI (pure functions)
├─ routes/
│  └─ index.tsx      # react-router-dom routes
├─ types/
├─ App.tsx
├─ main.tsx
├─ index.css
prisma/
├─ schema.prisma
└─ seed.ts           # ใส่ข้อมูลตัวอย่างลงในฐานข้อมูล SQL จริง
public/images/
```

---

## 4. Data Model

```prisma
enum PropertyType      { CONDO ROOM_RENTAL APARTMENT DORMITORY COMMERCIAL OTHER } // กำหนดประเภทได้หลังบ้าน
enum RoomStatus        { OCCUPIED VACANT }          // v1 มี 2 สถานะตามดีไซน์
enum Gender            { MALE FEMALE UNSPECIFIED }
enum LeaseStatus       { ACTIVE ENDED CANCELLED }
enum PaymentStatus     { PAID PENDING OVERDUE }
enum MaintenanceStatus { PENDING IN_PROGRESS DONE CANCELLED }
enum NotificationType  { MAINTENANCE_NEW PAYMENT_RECEIVED LEASE_EXPIRING ROOM_AVAILABLE }
enum Plan              { FREE PREMIUM }
enum UserRole          { OWNER MANAGER STAFF }

model User {
  id          String   @id @default(cuid())
  email       String   @unique
  displayName String                     // "คุณนท ถาวร ..."
  avatarUrl   String?
  role        UserRole @default(OWNER)
  properties  PropertyMember[]
}

model Property {
  id            String          @id @default(cuid())
  name          String                         // เช่น "สุขสันต์ คอนโด", "ห้องเช่าสุขสันต์"
  type          PropertyType    @default(CONDO) // ประเภท: CONDO, ROOM_RENTAL, APARTMENT, DORMITORY ฯลฯ (กำหนดได้หลังบ้านไม่ตายตัว)
  typeLabel     String?                        // กำหนดชื่อเรียกประเภทเองได้จากหลังบ้าน เช่น "ห้องเช่า", "คอนโด", "หอพัก"
  plan          Plan            @default(FREE)
  rooms         Room[]
  members       PropertyMember[]
  expenses      Expense[]
  notifications Notification[]
}

model PropertyMember {
  userId      String
  propertyId  String
  role        UserRole
  user        User      @relation(fields: [userId], references: [id])
  property    Property  @relation(fields: [propertyId], references: [id])
  @@id([userId, propertyId])
}

model Room {
  id            String     @id @default(cuid())
  propertyId    String
  number        String                    // "101"
  floor         Int
  monthlyRent   Int                       // หน่วย: สตางค์
  status        RoomStatus @default(VACANT)
  coverImageUrl String?
  updatedAt     DateTime   @updatedAt
  property      Property   @relation(fields: [propertyId], references: [id])
  leases        Lease[]
  maintenance   MaintenanceRequest[]
  @@unique([propertyId, number])
}

model Tenant {
  id        String  @id @default(cuid())
  title     String                        // "น.ส." | "นาย" | "นาง"
  firstName String
  lastName  String
  gender    Gender  @default(UNSPECIFIED)
  phone     String?
  avatarUrl String?
  leases    Lease[]
}

model Lease {
  id        String      @id @default(cuid())
  roomId    String
  tenantId  String
  startDate DateTime
  endDate   DateTime
  rent      Int                           // สตางค์
  deposit   Int                           // สตางค์
  status    LeaseStatus @default(ACTIVE)
  room      Room        @relation(fields: [roomId], references: [id])
  tenant    Tenant      @relation(fields: [tenantId], references: [id])
  payments  Payment[]
}

model Payment {
  id       String        @id @default(cuid())
  leaseId  String
  amount   Int                            // สตางค์
  period   String                         // "2025-09" (ค.ศ. ใน DB เสมอ)
  status   PaymentStatus @default(PENDING)
  paidAt   DateTime?
  lease    Lease         @relation(fields: [leaseId], references: [id])
}

model Expense {
  id          String    @id @default(cuid())
  propertyId  String
  category    String                      // ค่าน้ำ-ไฟส่วนกลาง, ซ่อมบำรุง, เงินเดือน ...
  amount      Int                         // สตางค์
  spentAt     DateTime
  note        String?
  property    Property  @relation(fields: [propertyId], references: [id])
}

model MaintenanceRequest {
  id          String            @id @default(cuid())
  roomId      String
  title       String                      // "น้ำรั่วในห้องน้ำ"
  status      MaintenanceStatus @default(PENDING)
  createdAt   DateTime          @default(now())
  room        Room              @relation(fields: [roomId], references: [id])
}

model Notification {
  id          String           @id @default(cuid())
  propertyId  String
  type        NotificationType
  title       String
  body        String
  href        String?
  readAt      DateTime?
  createdAt   DateTime         @default(now())
  property    Property         @relation(fields: [propertyId], references: [id])
}
```

---

## 5. กฎการคำนวณ KPI

ช่วงเวลา "เดือนนี้" = เดือนปัจจุบันตามเขตเวลา `Asia/Bangkok`

| ค่า | สูตร |
|---|---|
| `rooms.total` | จำนวน Room ของโครงการ/ที่พัก |
| `rooms.occupied` | Room ที่ `status = OCCUPIED` |
| `rooms.vacant` | Room ที่ `status = VACANT` |
| `rooms.occupancyPct` | `round(occupied / total × 100)` → 42/48 = 88 |
| `tenants.total` | จำนวน Tenant ที่มี Lease `ACTIVE` (นับคนไม่ซ้ำ) |
| `tenants.male / female` | แยกตาม `gender` (UNSPECIFIED ไม่แสดงในบรรทัดล่าง) |
| `finance.income` | ผลรวม `Payment.amount` ที่ `status = PAID` และ `paidAt` อยู่ในเดือนนี้ |
| `finance.expense` | ผลรวม `Expense.amount` ที่ `spentAt` อยู่ในเดือนนี้ |
| `finance.profit` | `income − expense` |
| `changePct` | `round((ค่าเดือนนี้ − ค่าเดือนก่อน) / ค่าเดือนก่อน × 100)`; ถ้าเดือนก่อนเป็น 0 → แสดง "—" |
| `maintenance.open` | `PENDING + IN_PROGRESS` |
| `maintenance.inProgress` | `IN_PROGRESS` → "กำลังดำเนินการ" |
| `maintenance.pending` | `PENDING` → "รอรับ" |
| `chart` | income/expense ของ 3 เดือนล่าสุด (รวมเดือนนี้) เรียงเก่า → ใหม่ |

ทิศทางของสีตัวบ่งชี้:

| ตัวชี้วัด | ขึ้น | ลง |
|---|---|---|
| รายรับ, กำไร | เขียว | แดง |
| รายจ่าย | แดง | เขียว |

---

## 6. รายการข้อมูลในการ์ด

| การ์ด | Query | จำนวน | เรียง |
|---|---|---|---|
| ห้องพักล่าสุด | Room + Lease ACTIVE (ถ้ามี) + Tenant | 5 | `updatedAt` desc |
| การชำระค่าเช่าล่าสุด | Payment `PAID` + Lease + Room + Tenant | 5 | `paidAt` desc |
| แจ้งเตือน | Notification ของโครงการ/ที่พัก | 4 | `createdAt` desc |

### การสร้าง Notification อัตโนมัติ

| เหตุการณ์ | Type | ตัวอย่าง title / body |
|---|---|---|
| สร้าง MaintenanceRequest | `MAINTENANCE_NEW` | มีแจ้งซ่อมใหม่ / ห้อง 203 - น้ำรั่วในห้องน้ำ |
| Payment เปลี่ยนเป็น PAID | `PAYMENT_RECEIVED` | ผู้เช่าชำระค่าเช่า / ห้อง 101 - 3,500 บาท |
| Lease ACTIVE เหลือ ≤ 30 วัน (job รายวัน, แจ้งครั้งเดียวต่อสัญญา) | `LEASE_EXPIRING` | ใกล้หมดสัญญาเช่า / ห้อง 110 - เหลือ 15 วัน |
| Room เปลี่ยนเป็น VACANT | `ROOM_AVAILABLE` | ห้องว่างพร้อมให้เช่า / ห้อง 103 - 3,800 บาท/เดือน |

---

## 7. API

> ⚠️ **ข้อกำหนดสำคัญ: ใช้ฐานข้อมูล SQL จริงเท่านั้น (PostgreSQL + Prisma) — ห้ามใช้ Mock Data โดยเด็ดขาด**
> ข้อมูลทุกอย่างที่แสดงผลต้องมาจากการ query ฐานข้อมูลจริงผ่าน backend API server (`server/`)

### `GET /api/dashboard/summary?propertyId={id}`

- ต้องล็อกอิน และผู้ใช้ต้องเป็นสมาชิกของโครงการ/ที่พักนั้น (ไม่ใช่ → `403`)
- เงินใน response เป็น **บาท (จำนวนเต็ม)** แปลงจากสตางค์ที่ชั้น API
- วันเวลาเป็น ISO 8601 (UTC) — ฝั่ง UI แปลงเป็นไทย

```json
{
  "property": { "id": "p_1", "name": "สุขสันต์ คอนโด", "type": "CONDO", "typeLabel": "คอนโด", "plan": "PREMIUM" },
  "user": { "displayName": "คุณนท ถาวร ศรีเสนพิลา", "role": "OWNER", "avatarUrl": null },
  "unreadNotifications": 3,
  "rooms": { "total": 48, "occupied": 42, "vacant": 6, "occupancyPct": 88 },
  "tenants": { "total": 42, "male": 18, "female": 24 },
  "finance": {
    "income":  { "value": 126500, "changePct": 12 },
    "expense": { "value": 52300,  "changePct": 5 },
    "profit":  { "value": 74200,  "changePct": 18 },
    "chart": [
      { "period": "2025-07", "income": 105200, "expense": 47600 },
      { "period": "2025-08", "income": 112900, "expense": 49800 },
      { "period": "2025-09", "income": 126500, "expense": 52300 }
    ]
  },
  "maintenance": { "open": 3, "inProgress": 2, "pending": 1 },
  "latestRooms": [
    {
      "id": "r_101", "number": "101", "floor": 1, "monthlyRent": 3500,
      "status": "OCCUPIED", "coverImageUrl": null,
      "tenantName": "น.ส.วราภรณ์ ใจดี", "leaseEndDate": "2026-01-31"
    }
  ],
  "recentPayments": [
    {
      "id": "p_1", "tenantName": "น.ส.วราภรณ์ ใจดี", "avatarUrl": null,
      "roomNumber": "101", "amount": 3500, "status": "PAID",
      "paidAt": "2025-09-11T13:05:00Z"
    }
  ],
  "notifications": [
    {
      "id": "n_1", "type": "MAINTENANCE_NEW", "title": "มีแจ้งซ่อมใหม่",
      "body": "ห้อง 203 - น้ำรั่วในห้องน้ำ", "href": "/maintenance/m_1",
      "readAt": null, "createdAt": "2025-09-11T12:12:00Z"
    }
  ]
}
```

ในสถาปัตยกรรม Vite + React ให้เรียก API ผ่าน `lib/api.ts` ไปยัง Backend server ซึ่ง query ข้อมูลจากฐานข้อมูล SQL จริง (PostgreSQL) ผ่าน Prisma — **ห้ามใช้ mock data แทนที่การ query จริง**

---

## 8. Seed Data (ตรงกับภาพดีไซน์)

- โครงการ/ที่พัก: **สุขสันต์ คอนโด** (หรือห้องเช่าสุขสันต์, PREMIUM, กำหนดประเภทได้จากหลังบ้าน เช่น คอนโด, ห้องเช่า, หอพัก)
- ผู้ใช้: คุณนท ถาวร ศรีเสนพิลา — เจ้าของ / ผู้จัดการโครงการ
- "เวลาปัจจุบัน" สำหรับ seed/ภาพตัวอย่าง: **11 ก.ย. 2568 20:12 น.** (2025-09-11 13:12 UTC)
- ห้อง 48 ห้อง: 4 ชั้น × 12 ห้อง (101–112, 201–212, 301–312, 401–412)
  - ค่าเช่า: 3,500 หรือ 3,800 บาท
  - ว่าง 6 ห้อง (รวมห้อง 103), มีผู้เช่า 42 ห้อง
- ผู้เช่า 42 คน: ชาย 18, หญิง 24 (1 คนต่อ 1 ห้อง)

ห้องพัก (5 แถวที่แสดง):

| ห้อง | ชั้น | ค่าเช่า | ผู้เช่า | หมดสัญญา | สถานะ |
|---|---|---|---|---|---|
| 101 | 1 | 3,500 | น.ส.วราภรณ์ ใจดี | 31 ม.ค. 2569 | มีผู้เช่า |
| 102 | 1 | 3,500 | นายศักดิ์ชัย แสนสุข | 15 ก.พ. 2569 | มีผู้เช่า |
| 103 | 1 | 3,800 | - | - | ว่าง |
| 104 | 1 | 3,800 | น.ส.ธนพร พรมมา | 20 ธ.ค. 2568 | มีผู้เช่า |
| 105 | 1 | 3,800 | นายกิตติพงษ์ รัตนวงศ์ | 10 ม.ค. 2569 | มีผู้เช่า |

การชำระล่าสุด (ทั้งหมด PAID):

| ผู้เช่า | ห้อง | จำนวน | เวลา |
|---|---|---|---|
| น.ส.วราภรณ์ ใจดี | 101 | 3,500 | 11 ก.ย. 2568 20:05 น. |
| นายศักดิ์ชัย แสนสุข | 102 | 3,500 | 11 ก.ย. 2568 19:42 น. |
| น.ส.ธนพร พรมมา | 104 | 3,800 | 11 ก.ย. 2568 18:30 น. |
| นายกิตติพงษ์ รัตนวงศ์ | 105 | 3,800 | 11 ก.ย. 2568 17:20 น. |
| นายสุรเชษฐ์ จันทร์ดี | 108 | 3,500 | 10 ก.ย. 2568 16:12 น. |

แจ้งซ่อมค้าง 3 รายการ: IN_PROGRESS 2, PENDING 1 (หนึ่งในนั้นคือ ห้อง 203 น้ำรั่วในห้องน้ำ)

แจ้งเตือน 4 รายการ (unread รวม 3):

| Type | ข้อความ | เวลา |
|---|---|---|
| MAINTENANCE_NEW | ห้อง 203 - น้ำรั่วในห้องน้ำ | 1 ชม.ที่แล้ว |
| PAYMENT_RECEIVED | ห้อง 101 - 3,500 บาท | 7 นาทีที่แล้ว (ดูหมายเหตุ §11) |
| LEASE_EXPIRING | ห้อง 110 - เหลือ 15 วัน | 5 ชม.ที่แล้ว |
| ROOM_AVAILABLE | ห้อง 103 - 3,800 บาท/เดือน | 7 ชม.ที่แล้ว |

รายรับ/รายจ่าย: ก.ค. 105,200 / 47,600 · ส.ค. 112,900 / 49,800 · ก.ย. 126,500 / 52,300
(ตัวเลขนี้ทำให้ได้ ↑12%, ↑5%, ↑18% ตรงกับดีไซน์)

---

## 9. การจัดรูปแบบข้อความ

| ฟังก์ชัน | Input | Output |
|---|---|---|
| `formatBaht(126500)` | บาท | `฿ 126,500` |
| `formatBahtText(3500)` | บาท | `3,500 บาท` |
| `formatRent(3800)` | บาท | `3,800 บาท/เดือน` |
| `formatThaiDateLong(d)` | Date | `11 กันยายน 2568` |
| `formatThaiDateShort(d)` | Date | `11 ก.ย. 2568` |
| `formatThaiTime(d)` | Date | `20:12 น.` |
| `formatRelativeTh(d, now)` | Date | `เมื่อสักครู่` (< 1 นาที), `7 นาทีที่แล้ว`, `1 ชม.ที่แล้ว`, `2 วันที่แล้ว`, เกิน 7 วัน → `formatThaiDateShort` |
| `formatChangePct(12)` | number | `↑ 12%` / `↓ 3%` / `—` |
| `stripThaiTitle("น.ส.วราภรณ์")` | string | `วราภรณ์` (ใช้ทำ initials ของ avatar) |

ใช้ `Intl.DateTimeFormat("th-TH", { timeZone: "Asia/Bangkok" })` ซึ่งให้ปี พ.ศ. อยู่แล้ว ห้ามบวก 543 เอง

---

## 10. Acceptance Criteria (Phase 1)

- [ ] ข้อมูลและตัวเลขทุกตัวมาจากฐานข้อมูล SQL จริง (PostgreSQL ผ่าน Prisma) — **ห้ามใช้ mock data หรือ hard-code ในคอมโพเนนต์โดยเด็ดขาด**
- [ ] เมื่อรัน seed แล้ว ตัวเลขตรงกับตารางใน §8 ทุกตัว
- [ ] วันที่/เวลาใน hero เป็นค่าปัจจุบันจริง แสดงเป็น พ.ศ.
- [ ] Badge กระดิ่งแสดงจำนวน notification ที่ยังไม่อ่าน ถ้าเป็น 0 ไม่แสดง badge; เกิน 99 แสดง `99+`
- [ ] คลิก KPI card, แถวห้อง, ปุ่มเมนูด่วน, "ดูทั้งหมด" ไปยัง route ที่กำหนดใน DESIGN.md
- [ ] แต่ละการ์ดมีสถานะ loading / empty / error ของตัวเอง
- [ ] Responsive ตาม breakpoint ใน DESIGN.md §3.2 และไม่มี horizontal scroll ที่ body
- [ ] ทุกปุ่มใช้คีย์บอร์ดได้ มี focus ring มองเห็นชัด
- [ ] Unit test ครอบคลุม `lib/kpi.ts` และ `lib/format.ts`
- [ ] E2E test: โหลดหน้า Dashboard ด้วย seed แล้วเห็น "48 ห้อง", "฿ 126,500", "3 รายการ"
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test` ผ่านทั้งหมด

---

## 11. ข้อสังเกตจากภาพดีไซน์ (ต้องแก้ตอน implement)

1. **กราฟเดือน ก.ย. ไม่ตรงกับการ์ดสรุป** — ในภาพแท่ง ก.ย. สูงเกิน 126,500 / 52,300 → ให้กราฟใช้ข้อมูลเดียวกับการ์ดสรุป
2. **หัวการ์ดกราฟเขียนว่า "(เดือนนี้)" แต่กราฟแสดง 3 เดือน** → ข้อเสนอ: การ์ดสรุปเป็นของเดือนนี้ ส่วนกราฟใส่ subtitle "3 เดือนล่าสุด" (รอยืนยันจากเจ้าของดีไซน์)
3. **เวลาแจ้งเตือนการชำระห้อง 101 ขัดกับรายการชำระ** — ภาพบอก "3 ชม.ที่แล้ว" แต่ชำระ 20:05 น. และตอนนี้ 20:12 น. → ต้องคำนวณจาก `createdAt` จริง (= 7 นาทีที่แล้ว)
4. **"ห้องพักล่าสุด"** ในภาพเรียงตามเลขห้อง 101–105 → spec นี้กำหนดให้เรียงตาม `updatedAt` desc (รอยืนยัน)
5. ชื่อผู้ใช้ในภาพอ่านได้ไม่ชัด → ใช้จากข้อมูล `User.displayName`
