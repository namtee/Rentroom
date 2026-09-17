# CLAUDE.md — TeeHidZ

ไฟล์นี้ Claude Code อ่านอัตโนมัติทุกครั้งที่เริ่ม session ในโปรเจกต์นี้

## โปรเจกต์

TeeHidZ — เว็บแอปจัดการห้องเช่า/คอนโด UI ภาษาไทย (ปี พ.ศ.) รองรับการกำหนดประเภทอสังหาฯ (ห้องเช่า, คอนโด, หอพัก ฯลฯ) ได้จากหลังบ้านแบบไดนามิก
Stack: Vite + React · TypeScript strict · Tailwind + shadcn/ui · SweetAlert2 · Recharts · Vitest · Playwright · pnpm
งานปัจจุบัน: Phase 1 — หน้า Dashboard ให้ตรงกับ `assets/reference-dashboard.png`

## เอกสารหลัก (import อัตโนมัติ)

@RULES.md
@SPEC.md
@DESIGN.md
@AGENT.md

## คำสั่ง

- `pnpm dev` — รัน local
- `pnpm lint && pnpm typecheck && pnpm test` — ต้องผ่านก่อนบอกว่างานเสร็จ
- `pnpm test:e2e` — Playwright
- `pnpm db:migrate` / `pnpm db:seed` — Prisma

## วิธีทำงานกับโปรเจกต์นี้

- ก่อนแก้ UI ให้เปิดดู `assets/reference-dashboard.png` ด้วย tool อ่านภาพทุกครั้ง อย่าทำจากความจำ
- งานที่มีหลายขั้นตอน ให้วางแผนเป็นรายการสั้น ๆ ก่อน แล้วทำทีละขั้นตาม AGENT.md "ลำดับการทำงานที่แนะนำ"
- เขียน test ของ `lib/format.ts` และ `lib/kpi.ts` ก่อนเขียนคอมโพเนนต์ที่ใช้มัน
- หลังแก้ UI ถ้ามี Playwright ให้ถ่าย screenshot ที่ 1536px และ 390px แล้วเทียบกับภาพอ้างอิง
- ทำตาม RULES.md §8 — หยุดถามก่อนเพิ่ม dependency, เปลี่ยน schema แบบลบข้อมูล หรือรันคำสั่งทำลายข้อมูล
- แจ้งผู้ใช้ทุกครั้งที่ตัดสินใจเรื่องที่ spec ไม่ได้ระบุ หรือเจอข้อขัดแย้งใน SPEC.md §11

## สิ่งที่มักพลาด

- บวก 543 เอง → ใช้ `Intl.DateTimeFormat("th-TH")`
- เก็บเงินเป็น float → เก็บเป็นสตางค์ (`Int`), API ส่งเป็นบาท
- ใส่ตัวเลขจากภาพลงในคอมโพเนนต์ หรือใช้ mock data → **ต้องใช้ฐานข้อมูล SQL จริง (PostgreSQL + Prisma) เท่านั้น ห้าม mock data**
- ลืมกรองด้วย `propertyId` ที่ผู้ใช้มีสิทธิ์
- สีรายจ่าย: ขึ้น = แดง (กลับทิศกับรายรับ)
- ใช้ hex ตรง ๆ → ใช้ token จาก DESIGN.md
