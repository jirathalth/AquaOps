import type { Metadata } from "next";
import { IBM_Plex_Sans_Thai } from "next/font/google";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { ToastProvider } from "@/components/shared/toast-provider";
import "./globals.css";

const ibmPlexSansThai = IBM_Plex_Sans_Thai({ weight: ["400", "500", "600", "700"], subsets: ["thai", "latin"], display: "swap", variable: "--font-ibm-plex-sans-thai" });

export const metadata: Metadata = { title: { default: "AquaOps", template: "%s | AquaOps" }, description: "ระบบบริหารจัดการธุรกิจผลิตและจัดจำหน่ายน้ำดื่ม" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="th" className={ibmPlexSansThai.variable} suppressHydrationWarning><body className="font-sans"><a className="skip-link" href="#main-content">ข้ามไปยังเนื้อหาหลัก</a><ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange><ToastProvider>{children}</ToastProvider></ThemeProvider></body></html>; }
