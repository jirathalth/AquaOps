# AquaOps

ระบบบริหารจัดการภายในสำหรับธุรกิจผลิตและจัดจำหน่ายน้ำดื่ม ปัจจุบันมี technical foundation, UI shell และ Phase 1 database architecture แล้ว แต่ยังไม่มี business CRUD หรือ workflow จริง

## Requirements

- Node.js 20.19+ (Node.js 22 LTS recommended)
- npm 10+
- PostgreSQL 16+

## Installation

```bash
npm install
cp .env.example .env
```

ตั้งค่า `.env`:

- `DATABASE_URL`: PostgreSQL connection string
- `BETTER_AUTH_SECRET`: secret แบบสุ่มอย่างน้อย 32 ตัวอักษร (`openssl rand -base64 32`)
- `BETTER_AUTH_URL`: URL ของแอป เช่น `http://localhost:3000`

## Database

สร้างฐานข้อมูล `aquaops` แล้วรัน:

```bash
npm run db:validate
npm run db:generate
npm run db:deploy
```

Prisma schema ครอบคลุมฐานข้อมูล Phase 1, Better Auth, RBAC และ audit history แล้ว ดูรายละเอียดและ transaction rules ที่ [DATABASE.md](./DATABASE.md)

ระหว่างพัฒนา schema ให้สร้าง migration ด้วย:

```bash
npm run db:migrate -- --name <change_name>
```

## Development

```bash
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000) หน้าแดชบอร์ดใช้ mock data เท่านั้น

ในโหมดพัฒนา เปิด `/dev/ui` เพื่อตรวจสอบ typography, forms, statuses, tables และ interaction patterns ของ design system หน้านี้คืนค่า 404 ใน production

## Quality and tests

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
```

ติดตั้ง Playwright browser ครั้งแรกด้วย `npx playwright install chromium` หากเครื่องยังไม่มี browser binary

## Production build

```bash
npm run build
npm start
```

ดูแนวทางโครงสร้างที่ [ARCHITECTURE.md](./ARCHITECTURE.md) และลำดับงานที่ [ROADMAP.md](./ROADMAP.md)
