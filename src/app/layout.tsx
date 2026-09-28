import type { Metadata } from "next";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { ToastProvider } from "@/components/shared/toast-provider";
import "./globals.css";

export const metadata: Metadata = { title: { default: "AquaFlow", template: "%s | AquaFlow" }, description: "ระบบบริหารจัดการธุรกิจผลิตและจัดจำหน่ายน้ำดื่ม" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="th" suppressHydrationWarning><body><a className="skip-link" href="#main-content">ข้ามไปยังเนื้อหาหลัก</a><ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange><ToastProvider>{children}</ToastProvider></ThemeProvider></body></html>; }
