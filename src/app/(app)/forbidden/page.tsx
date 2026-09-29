import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = { title: "ไม่มีสิทธิ์เข้าถึง" };
export default function ForbiddenPage() { return <section className="flex min-h-[60vh] items-center justify-center"><div className="max-w-md text-center"><ShieldAlert className="mx-auto size-10 text-warning" aria-hidden="true" /><p className="mt-4 text-sm font-semibold text-muted-foreground">403</p><h1 className="mt-1 type-page-title">ไม่มีสิทธิ์เข้าถึง</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">บัญชีของคุณไม่มีสิทธิ์เปิดหน้านี้ หากจำเป็นต้องใช้งาน โปรดติดต่อผู้ดูแลระบบ</p><Button asChild className="mt-5"><Link href="/dashboard">กลับไปแดชบอร์ด</Link></Button></div></section>; }
