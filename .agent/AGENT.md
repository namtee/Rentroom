# AGENT.md — คู่มือสำหรับ AI Coding Agent

> ใช้ได้กับ agent ทุกตัว (Codex, Cursor, Copilot, Gemini CLI, Windsurf ฯลฯ)
> เครื่องมือหลายตัวอ่านไฟล์ชื่อ **`AGENTS.md`** (มี s) — ถ้าเครื่องมือของคุณไม่เห็นไฟล์นี้ ให้เปลี่ยนชื่อหรือทำ symlink:
> `ln -s AGENT.md AGENTS.md`

---

## โปรเจกต์นี้คืออะไร

**TeeHidZ** — เว็บแอปจัดการห้องเช่า/คอนโดภาษาไทยสำหรับเจ้าของและผู้ดูแล (รองรับห้องเช่า, คอนโด, หอพัก ฯลฯ กำหนดประเภทได้จากหลังบ้านแบบไม่ตายตัว)
งานแรก: สร้างหน้า **Dashboard (หน้าหลัก)** ให้เหมือน `assets/reference-dashboard.png` โดยใช้ข้อมูลจริงจากฐานข้อมูล

## อ่านก่อนเริ่มงาน (ตามลำดับ)

1. `RULES.md` — กฎที่ห้ามละเมิด
2. `SPEC.md` — ขอบเขต, data model, สูตร KPI, API, seed data, acceptance criteria
3. `DESIGN.md` — token สี/ฟอนต์/ระยะ และสเปกของทุกคอมโพเนนต์
4. `assets/reference-dashboard.png` — ภาพอ้างอิง (เปิดดูจริง อย่าเดา)

ถ้าเอกสารขัดกันเอง ให้ถือลำดับ: **RULES > SPEC > DESIGN > ภาพ** แล้วแจ้งผู้ใช้ว่าพบความขัดแย้งตรงไหน

## Setup

```bash
pnpm install
cp .env.example .env          # ตั้งค่า DATABASE_URL
pnpm db:migrate               # prisma migrate dev
pnpm db:seed                  # ข้อมูลตัวอย่างตรงกับภาพดีไซน์
pnpm dev                      # http://localhost:5173 (Vite dev)
```

## คำสั่งที่ต้องใช้

| คำสั่ง | ใช้เมื่อ |
|---|---|
| `pnpm dev` | รันเครื่อง local |
| `pnpm build` | ตรวจว่า build ผ่าน |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` | Vitest (unit) |
| `pnpm test:e2e` | Playwright |
| `pnpm db:migrate` | สร้าง/รัน migration |
| `pnpm db:seed` | ใส่ seed data |

> ถ้าโปรเจกต์ยังไม่มีสคริปต์เหล่านี้ ให้เพิ่มลงใน `package.json` ตามชื่อข้างบน

## ลำดับการทำงานที่แนะนำ (Phase 1)

1. Scaffold Vite + React + TypeScript + Tailwind + shadcn/ui, ติดตั้ง `sweetalert2` + `sweetalert2-react-content` และ `react-router-dom`, ตั้ง design token ตาม DESIGN.md §8, โหลดฟอนต์ Prompt
2. เขียน Prisma schema ตาม SPEC.md §4 → migration → `seed.ts` ลงในฐานข้อมูล PostgreSQL จริงตาม §8 (**ใช้ SQL จริงเท่านั้น ห้าม mock data**)
3. เขียน `lib/format.ts` + unit test (SPEC.md §9)
4. เขียน `lib/kpi.ts` + unit test (SPEC.md §5) — ต้องได้ ↑12%, ↑5%, ↑18% จาก seed จริง
5. สร้าง Backend API server (`server/`) เชื่อมต่อ Prisma กับฐานข้อมูล SQL จริง และเขียน `lib/alert.ts` + `lib/api.ts` ใน frontend ดึงข้อมูลจริง
6. สร้าง layout: `Sidebar`, `Topbar`, `PropertyCard`, `MainLayout`
7. สร้างการ์ดทีละตัวตาม DESIGN.md §4.3–4.11 แต่ละตัวมี loading / empty / error
8. ประกอบหน้า `src/pages/DashboardPage.tsx` ด้วย grid ตาม DESIGN.md §3 และเชื่อมต่อ routing ด้วย react-router-dom
9. ทำ responsive ตาม DESIGN.md §3.2
10. สร้างหน้า placeholder ให้ทุกเมนู
11. เขียน e2e test แล้วไล่ checklist ใน SPEC.md §10

## Definition of Done

งานถือว่าเสร็จเมื่อ:

- ผ่าน `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`
- ถ้าแก้ UI: เทียบกับภาพอ้างอิงที่ความกว้าง 1536px และเช็กที่ 390px (มือถือ)
- ไม่มีตัวเลขหรือข้อความตัวอย่าง hard-code ในคอมโพเนนต์
- อัปเดตเอกสาร `.md` ที่เกี่ยวข้องถ้ามีการเปลี่ยน schema / ดีไซน์ / กฎ
- สรุปให้ผู้ใช้: ทำอะไรไป, ไฟล์ที่แก้, สิ่งที่ยังไม่ได้ทำ, คำถามที่ค้าง

## เมื่อไม่แน่ใจ

- ข้อมูลที่ภาพไม่ได้บอก (เช่น หน้ารายละเอียดห้อง) → ทำให้เรียบง่ายที่สุดตามสไตล์ DESIGN.md แล้วบอกผู้ใช้ว่าตัดสินใจอะไรไป
- เรื่องที่อยู่ใน RULES.md §8 → **หยุดและถามก่อน**
- ข้อสังเกตที่รอยืนยันอยู่ใน SPEC.md §11 → ทำตามข้อเสนอใน spec ไปก่อน แต่ต้องแจ้งผู้ใช้
