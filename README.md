# 🏢 TeeHidZ — ระบบบริหารจัดการห้องเช่าและคอนโดมิเนียม
> **Smart Condo & Room Rental Management Platform**  
> *"บริหารห้องเช่าและคอนโดให้เป็นเรื่องง่าย ด้วยเทคโนโลยี"*

---

## 🌟 ภาพรวมระบบ (Overview)

**TeeHidZ** เป็นระบบจัดการห้องเช่า คอนโดมิเนียม และอพาร์ตเมนต์แบบครบวงจร ที่พัฒนาด้วยเทคโนโลยีระดับโมเดิร์น พร้อมหน้าจอแดชบอร์ดสไตล์ **3-Column Layout** ที่ออกแบบมาเพื่อผู้ประกอบการและเจ้าของโครงการโดยเฉพาะ:

- 📊 **แดชบอร์ดบริหาร Real-time**: แสดงผล 4 การ์ดตัวชี้วัด (KPIs) ห้องพัก 48 ห้อง, ผู้เช่า 42 คน, กำไรสุทธิ, และรายการแจ้งซ่อม
- 📈 **กราฟการเงิน Recharts**: สถิติรายรับ-รายจ่ายย้อนหลัง 3 เดือน พร้อมโดนัทอัตราการเช่า (Occupancy Rate 88.0%)
- ⚡ **เมนูด่วน Quick Actions (3x2 Grid)**: ผสานรวม **SweetAlert2** สำหรับสร้างห้องใหม่, ทำสัญญาเช่า, บันทึกมิเตอร์น้ำ-ไฟ, และส่งเรื่องแจ้งซ่อม
- 🎨 **ดีไซน์ระดับพรีเมียม**: โทนสีน้ำเงินเข้ม (Deep Royal & Navy Blue) พร้อมโมเดลภาพจำลองอาคาร 3D และฟอนต์ภาษาไทย `Prompt` ร่วมกับข้อความสโลแกนลายมือ `Mali`
- 🗄️ **ฐานข้อมูล PostgreSQL จริง**: เชื่อมต่อข้อมูลจริงผ่าน Prisma ORM (ไม่มี Mock Data) พร้อมไฟล์ Export SQL แนบให้พร้อมใช้งานทันที

---

## 📸 ภาพตัวอย่างหน้าจอระบบ (System Screenshots)

### 📊 หน้าหลักแดชบอร์ดบริหาร (Executive Dashboard)
> หน้าจอภาพรวมสำหรับเจ้าของโครงการ แสดงสรุป KPIs, อัตราการเข้าพัก, กราฟรายรับ-รายจ่ายย้อนหลัง และเมนูด่วน SweetAlert2
![แดชบอร์ดบริหาร](screenshots/dashboard.png)

### 🛏️ ระบบผังห้องพักและสถานะ (Room Management)
> แสดงสถานะห้องว่าง/มีผู้เช่า ข้อมูลค่าเช่า ชั้น และวันหมดสัญญา พร้อมฟังก์ชันค้นหาและกรองสถานะ
![ผังห้องพักและสถานะ](screenshots/rooms.png)

### 📑 สัญญาเช่า & ทะเบียนผู้เช่า (Leases & Tenants)
| สัญญาเช่า (Lease Management) | ทะเบียนประวัติผู้เช่า (Tenant Directory) |
| :---: | :---: |
| ![สัญญาเช่า](screenshots/leases.png) | ![ทะเบียนผู้เช่า](screenshots/tenants.png) |

### 💰 การเงินและค่าเช่า & แจ้งซ่อมบำรุง (Finance & Maintenance)
| บันทึกรายรับ-รายจ่าย & ค่าเช่า | รายการแจ้งซ่อมบำรุงและสถานะช่าง |
| :---: | :---: |
| ![การเงินและค่าเช่า](screenshots/finance.png) | ![แจ้งซ่อมบำรุง](screenshots/maintenance.png) |

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```text
├── screenshots/                  # 📸 ภาพพรีวิวหน้าจอการทำงานจริงของระบบ (Dashboard, Rooms, Leases ฯลฯ)
├── frontend/                     # ซอร์สโค้ดฝั่งหน้าบ้าน (Vite + React 19 + Tailwind CSS)
│   ├── public/                   # Static assets & ภาพ 3D อาคารคอนโด (/condo_hero.jpg)
│   ├── src/
│   │   ├── components/           # UI Components (Sidebar, Topbar, HeroBanner, KpiCard, etc.)
│   │   ├── context/              # DashboardContext จัดการ State ข้อมูล SQL แบบ Real-time
│   │   ├── lib/                  # ฟังก์ชันเชื่อมต่อ API (api.ts), จัดรูปแบบภาษาไทย (format.ts), SweetAlert2 (alert.ts)
│   │   ├── pages/                # DashboardPage และหน้ารองรับทั้ง 9 เส้นทาง
│   │   └── types/                # TypeScript Interfaces สำหรับข้อมูลห้อง, ผู้เช่า, การเงิน
│   ├── package.json
│   └── vite.config.ts            # Proxy /api ไปยังพอร์ต 8787
├── server/                       # ซอร์สโค้ดฝั่งหลังบ้าน (Express + TypeScript + Prisma)
│   ├── routes/                   # API Endpoints (/auth, /dashboard, /properties, ฯลฯ)
│   ├── middleware/               # ระบบความปลอดภัยและ JWT Auth Middleware
│   └── index.ts                  # เซิร์ฟเวอร์หลัก (พอร์ต 8787)
├── prisma/                       # Prisma Schema & Database Migrations
│   ├── schema.prisma
│   └── seed.ts
├── teehidz_database.sql          # 📦 ไฟล์ Export SQL ฐานข้อมูล PostgreSQL ฉบับสมบูรณ์
├── .env.example                  # ตัวอย่างการตั้งค่า Environment Variables
└── README.md                     # คู่มือการติดตั้งและใช้งานระบบ
```

---

## 🛠️ ความต้องการของระบบ (Prerequisites)

ก่อนเริ่มใช้งาน กรุณาตรวจสอบว่าเครื่องของคุณมีโปรแกรมต่อไปนี้:
1. **Node.js**: เวอร์ชัน `>= 20.6.0` (แนะนำ v20 LTS หรือ v22)
2. **PostgreSQL**: เวอร์ชัน `15+` (หรือรันผ่าน Docker / Supabase / Neon)
3. **Git**: สำหรับดาวน์โหลดและจัดการเวอร์ชันโค้ด

---

## 🚀 วิธีการติดตั้งและเริ่มใช้งาน (Quick Start Guide)

### 1. โคลนโปรเจกต์ (Clone Repository)
```bash
git clone https://github.com/namtee/Rentroom.git
cd Rentroom
```

---

### 2. การนำเข้าฐานข้อมูล SQL (Import Database)

ในโปรเจกต์นี้มีไฟล์ [teehidz_database.sql](teehidz_database.sql) ซึ่งเป็นฐานข้อมูล PostgreSQL Dump ที่มีโครงสร้างตารางและข้อมูลตั้งต้น (48 ห้องพัก, 42 ผู้เช่า, โครงการตี๋หิด คอนโด, เจ้าของ คุณตี๋หิด) ไว้อย่างครบถ้วน

#### วิธีที่ 2.1: นำเข้าผ่านคำสั่ง Command Line (psql)
```bash
# 1. สร้างฐานข้อมูลใหม่ใน PostgreSQL (ถ้ายังไม่มี)
createdb -U postgres teehidz

# 2. นำเข้าไฟล์ SQL เข้าสู่ฐานข้อมูล
psql -U postgres -d teehidz -f teehidz_database.sql
```

#### วิธีที่ 2.2: นำเข้าผ่าน pgAdmin 4
1. เปิดโปรแกรม **pgAdmin 4** แล้วเชื่อมต่อไปยัง PostgreSQL Server
2. คลิกขวาที่ **Databases** -> เลือก **Create** -> **Database...** ตั้งชื่อว่า `teehidz`
3. คลิกขวาที่ฐานข้อมูล `teehidz` ที่สร้างขึ้น -> เลือก **Query Tool**
4. เปิดไฟล์ `teehidz_database.sql` แล้วกดปุ่ม **Execute (F5)** เพื่อรันคำสั่งทั้งหมด

---

### 3. การตั้งค่าตัวแปรระบบ (.env)

คัดลอกไฟล์ `.env.example` เป็น `.env` ในโฟลเดอร์หลัก:
```bash
cp .env.example .env
```

ตรวจสอบค่าในไฟล์ `.env` ให้ตรงกับฐานข้อมูล PostgreSQL ของคุณ:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/teehidz?schema=public"
PORT=8787
CORS_ORIGIN="http://localhost:5173"
JWT_SECRET="teehidz-super-secret-jwt-key-32-chars-min"
AUTH_BOOTSTRAP_SECRET="replace-this-local-bootstrap-secret"
LEASE_JOB_SECRET="replace-this-job-secret"
JWT_TTL_SECONDS=28800
```

---

### 4. การติดตั้งและเปิดใช้งาน Backend API (Server)

```bash
# 1. ติดตั้ง Dependencies ในโฟลเดอร์หลัก
npm install

# 2. สั่ง Generate Prisma Client
npx prisma generate

# 3. รันเซิร์ฟเวอร์ Backend (พอร์ต 8787)
node --env-file=.env ./node_modules/tsx/dist/cli.mjs server/index.ts
```
> เซิร์ฟเวอร์ Backend จะเริ่มทำงานที่: **http://localhost:8787**  
> สามารถทดสอบสถานะระบบได้ที่: `http://localhost:8787/api/health`

---

### 5. การติดตั้งและเปิดใช้งาน Frontend App (Web UI)

เปิดหน้าต่าง Terminal หรือ Command Prompt ใหม่:
```bash
# 1. ไปยังโฟลเดอร์ frontend
cd frontend

# 2. ติดตั้ง Dependencies ของ Frontend
npm install

# 3. เริ่มต้นเซิร์ฟเวอร์ Vite Dev Server
npm run dev -- --port 5173
```
> เซิร์ฟเวอร์ Frontend จะเริ่มทำงานที่: **http://localhost:5173**  
> เปิดเว็บเบราว์เซอร์แล้วเข้าไปที่ [http://localhost:5173](http://localhost:5173) เพื่อเริ่มใช้งานได้ทันที!

---

## 🔑 ข้อมูลบัญชีผู้ใช้เริ่มต้น (Default Account)

ระบบมาพร้อมกับบัญชีเจ้าของหอพัก/คอนโดตั้งต้นสำหรับทดสอบ:

| รายการ | ข้อมูล |
| :--- | :--- |
| **ชื่อเจ้าของโครงการ** | คุณตี๋หิด |
| **บทบาท (Role)** | เจ้าของ (`OWNER`) |
| **อีเมล (Email)** | `owner@teehidz.local` |
| **ชื่อโครงการหลัก** | **ตี๋หิด คอนโด** (แพ็กเกจ `PREMIUM`) |
| **Bootstrap Secret** | `replace-this-local-bootstrap-secret` |

*(หน้าบ้าน Frontend มีระบบ Auto-bootstrap ทำการล็อกอินและรับสิทธิ์ JWT Token ให้อัตโนมัติเมื่อเปิดใช้งาน)*

---

## 📱 สรุปฟังก์ชันการทำงานหลัก (Key Features)

1. **ภาพรวมกิจการ (Executive Dashboard)**:
   - แสดงการทักทายพร้อมนาฬิกาดิจิทัลภาษาไทยแบบ Real-time
   - สรุปตัวเลขสำคัญ 4 หมวด: ห้องพักทั้งหมด, ผู้เช่าทั้งหมด, กำไรสุทธิ, และรายการแจ้งซ่อมบำรุง
2. **รายงานกระแสเงินสด & สถิติ (Financials & Occupancy)**:
   - กราฟแท่งเปรียบเทียบรายรับ-รายจ่าย 3 เดือนล่าสุด
   - โดนัทแสดงอัตราการเข้าพักพร้อมสัดส่วนห้องว่าง
3. **ระบบจัดการห้องพักและสัญญา (Rooms & Leases)**:
   - ตารางแสดงรายการห้องพัก 5 ห้องล่าสุด พร้อมชื่อผู้เช่าและวันหมดสัญญา
   - ประวัติการรับชำระเงินค่าเช่า 5 รายการล่าสุดพร้อมระบุสถานะ
4. **เมนูด่วนป๊อปอัป SweetAlert2 (Interactive Quick Actions)**:
   - เพิ่มห้องพักใหม่ (ระบุหมายเลขห้อง, ชั้น, ค่าเช่า)
   - ทำสัญญาเช่าใหม่ (ระบุชื่อผู้เช่า, เบอร์โทร, ห้องที่เลือก)
   - จดมิเตอร์น้ำ-ไฟประจำเดือน
   - บันทึกงานแจ้งซ่อมบำรุง
   - บันทึกรายจ่ายส่วนกลาง
   - ส่งข้อความแจ้งเตือนค่าเช่าผ่าน LINE
5. **ศูนย์การแจ้งเตือน (Notification Center)**:
   - แจ้งเตือนงานซ่อมใหม่, ได้รับชำระเงิน, และสัญญาเช่าใกล้หมดอายุ

---

## 📄 ใบอนุญาตการใช้งาน (License)

พัฒนาขึ้นเพื่อระบบบริหารจัดการ **TeeHidZ** ลิขสิทธิ์ถูกต้องตามมาตรฐาน MIT License
