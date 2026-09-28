"use client";

import { ErrorState } from "@/components/shared/error-state";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <main className="flex min-h-screen items-center justify-center p-6"><div className="w-full max-w-lg"><ErrorState title="เกิดข้อผิดพลาด" description="ไม่สามารถเปิดหน้านี้ได้ กรุณาลองใหม่อีกครั้ง" onRetry={reset} /></div></main>; }
