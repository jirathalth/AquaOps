# AquaOps

ระบบบริหารจัดการภายในสำหรับธุรกิจผลิตและจัดจำหน่ายน้ำดื่ม ปัจจุบันมี technical foundation, UI shell, Phase 1 database architecture และ Authentication/RBAC แล้ว แต่ยังไม่มี business CRUD หรือ workflow จริง

## Requirements

- Node.js 20.19+ (Node.js 22 LTS recommended)
- npm 10+
- PostgreSQL 16+

## Installation

```bash
nvm use
npm install
cp .env.example .env
```

ตั้งค่า `.env`:

- `DATABASE_URL`: PostgreSQL connection string
- `BETTER_AUTH_SECRET`: secret แบบสุ่มอย่างน้อย 32 ตัวอักษร (`openssl rand -base64 32`)
- `BETTER_AUTH_URL`: URL ของแอป เช่น `http://localhost:3000`
- `AQUAOPS_AUTH_BYPASS`: ตั้ง `true` ได้เฉพาะ local development เพื่อดู UI โดยไม่ใช้ฐานข้อมูล; production จะไม่ยอม bypass
- `AQUAOPS_BOOTSTRAP_EMAIL` / `AQUAOPS_BOOTSTRAP_PASSWORD`: ใส่เฉพาะตอน seed บัญชี OWNER ครั้งแรก (รหัสผ่านอย่างน้อย 12 ตัวอักษร)
- `AQUAOPS_ENABLE_DEV_SEED` / `AQUAOPS_DEV_SEED_PASSWORD`: เปิดเฉพาะฐานข้อมูลพัฒนาเพื่อสร้างบัญชีตัวอย่าง ห้ามใช้ใน production

## Database

สร้างฐานข้อมูล `aquaops` แล้วรัน:

```bash
npm run db:validate
npm run db:generate
npm run db:deploy
npm run db:seed
```

Seed ทำงานแบบ idempotent สำหรับ permissions, system roles และ role-permission mappings โดยไม่เก็บรหัสผ่านไว้ใน source code หากไม่กำหนด bootstrap/dev seed variables จะสร้างเฉพาะ RBAC registry

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

ทุกหน้าภายในต้องเข้าสู่ระบบ หน้า `/admin/users` และ `/admin/roles` ใช้จัดการผู้ใช้ บทบาท และสิทธิ์ตาม permission ของผู้ปฏิบัติงาน บัญชี inactive จะเข้าสู่ระบบหรือใช้ session เดิมต่อไม่ได้

ในโหมดพัฒนา เปิด `/dev/ui` เพื่อตรวจสอบ typography, forms, statuses, tables และ interaction patterns ของ design system หน้านี้คืนค่า 404 ใน production

## Quality and tests

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
```

E2E ที่ต้องเข้าสู่ระบบใช้ฐานข้อมูลทดสอบที่ seed แล้ว และอ่าน credentials จาก `E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD`, `E2E_RESTRICTED_EMAIL`, `E2E_RESTRICTED_PASSWORD`; ชุดทดสอบดังกล่าวจะ skip พร้อมเหตุผลเมื่อไม่ได้กำหนดค่า

ติดตั้ง Playwright browser ครั้งแรกด้วย `npx playwright install chromium` หากเครื่องยังไม่มี browser binary

## Production build

```bash
npm run build
npm start
```

ดูแนวทางโครงสร้างที่ [ARCHITECTURE.md](./ARCHITECTURE.md) และลำดับงานที่ [ROADMAP.md](./ROADMAP.md)
