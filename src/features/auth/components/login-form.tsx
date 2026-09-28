"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { loginSchema, type LoginValues } from "@/validations/auth";

export function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string>();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });
  async function onSubmit(values: LoginValues) { setServerError(undefined); const result = await authClient.signIn.email(values); if (result.error) { setServerError("อีเมลหรือรหัสผ่านไม่ถูกต้อง"); return; } router.push("/dashboard"); router.refresh(); }
  return <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>{serverError && <Alert variant="danger"><AlertDescription>{serverError}</AlertDescription></Alert>}<div className="space-y-1.5"><Label htmlFor="email">อีเมล</Label><Input id="email" type="email" autoComplete="email" placeholder="name@company.com" aria-invalid={Boolean(errors.email)} {...register("email")} />{errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}</div><div className="space-y-1.5"><Label htmlFor="password">รหัสผ่าน</Label><Input id="password" type="password" autoComplete="current-password" aria-invalid={Boolean(errors.password)} {...register("password")} />{errors.password && <p className="text-xs text-danger">{errors.password.message}</p>}</div><Button className="w-full" type="submit" disabled={isSubmitting}>{isSubmitting && <LoaderCircle className="size-4 animate-spin" />}เข้าสู่ระบบ</Button></form>;
}
