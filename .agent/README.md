# TeeHidZ — Markdown Spec Pack

ชุดไฟล์ `.md` สำหรับสร้างหน้า Dashboard ระบบจัดการห้องเช่า/คอนโด **TeeHidZ** ด้วย AI coding agent (Claude Code, Codex, Cursor ฯลฯ) หรือทีมนักพัฒนา (รองรับห้องเช่า, คอนโด, หอพัก โดยกำหนดประเภทได้จากระบบหลังบ้าน)

## มีอะไรบ้าง

| ไฟล์ | เนื้อหา |
|---|---|
| `DESIGN.md` | ระบบดีไซน์: สี ฟอนต์ ระยะ layout และสเปกทุกคอมโพเนนต์ |
| `SPEC.md` | ขอบเขตงาน, data model, สูตร KPI, API, seed data, acceptance criteria |
| `RULES.md` | กฎการเขียนโค้ด ภาษา วันที่/เงิน accessibility ความปลอดภัย |
| `AGENT.md` | คู่มือสำหรับ AI agent ทั่วไป: setup, ลำดับงาน, definition of done |
| `CLAUDE.md` | ไฟล์ memory สำหรับ Claude Code (import ไฟล์อื่นอัตโนมัติ) |
| `assets/reference-dashboard.png` | ภาพหน้าจอต้นแบบ |

## วิธีใช้

1. แตก zip ไว้ที่ root ของโปรเจกต์ (ระดับเดียวกับ `package.json`)
2. ถ้าใช้ Codex / Cursor / เครื่องมือที่อ่าน `AGENTS.md` ให้รัน `ln -s AGENT.md AGENTS.md` (หรือเปลี่ยนชื่อไฟล์)
3. สั่ง agent ว่า: *"อ่าน AGENT.md แล้วเริ่ม Phase 1"*

## หมายเหตุ

- ค่าสีและฟอนต์ถอดจากภาพหน้าจอแบบประมาณ ถ้ามีไฟล์ดีไซน์ต้นฉบับให้ปรับตาม
- Tech stack ใน SPEC.md เป็นข้อเสนอ (ค่าเริ่มต้น: Vite + React + Tailwind + SweetAlert2) เปลี่ยนได้ตามทีม
- ชื่อบุคคลและข้อมูลทั้งหมดเป็นข้อมูลสมมติ
- ดูข้อสังเกตเรื่องจุดที่ภาพดีไซน์ขัดกันเองได้ที่ `SPEC.md` §11
