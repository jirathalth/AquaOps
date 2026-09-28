import { Droplets } from "lucide-react";
import { LoginForm } from "@/features/auth/components/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "เข้าสู่ระบบ" };
export default function LoginPage() { return <main className="flex min-h-screen items-center justify-center bg-muted/50 p-4"><Card className="w-full max-w-sm"><CardHeader className="items-center text-center"><div className="mb-2 flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Droplets className="size-6" /></div><CardTitle className="text-xl">เข้าสู่ระบบ</CardTitle><CardDescription>AquaFlow ระบบบริหารจัดการภายใน</CardDescription></CardHeader><CardContent><LoginForm /></CardContent></Card></main>; }
