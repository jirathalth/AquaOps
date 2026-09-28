import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() { return <main className="flex min-h-screen items-center justify-center p-6"><div className="text-center"><p className="text-sm font-medium text-primary">404</p><h1 className="mt-2 text-2xl font-semibold">ไม่พบหน้าที่ต้องการ</h1><p className="mt-2 text-sm text-muted-foreground">ตรวจสอบที่อยู่หรือลองกลับไปที่แดชบอร์ด</p><Button className="mt-5" asChild><Link href="/dashboard">กลับไปแดชบอร์ด</Link></Button></div></main>; }
