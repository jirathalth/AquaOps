import { Droplets } from "lucide-react";
import { LoginForm } from "@/features/auth/components/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";
import { getSafeReturnTo } from "@/lib/redirect";
import { InactiveUserError } from "@/lib/authorization-errors";
import { getAuthorizationContext } from "@/services/auth.service";

export const metadata = { title: "เข้าสู่ระบบ" };
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ returnTo?: string | string[]; reason?: string }> }) { const params = await searchParams; const returnTo = getSafeReturnTo(params.returnTo); let authenticated = false; let inactive = false; try { authenticated = Boolean(await getAuthorizationContext()); } catch (error) { if (error instanceof InactiveUserError) inactive = true; else throw error; } if (authenticated) redirect(returnTo); return <main className="flex min-h-screen items-center justify-center bg-muted/50 p-4"><Card className="w-full max-w-sm"><CardHeader className="items-center text-center"><div className="mb-2 flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Droplets className="size-6" /></div><CardTitle className="text-xl">เข้าสู่ระบบ</CardTitle><CardDescription>AquaOps ระบบบริหารจัดการภายใน</CardDescription></CardHeader><CardContent><LoginForm returnTo={returnTo} reason={inactive ? "inactive" : params.reason} /></CardContent></Card></main>; }
