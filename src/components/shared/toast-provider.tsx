"use client";

import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "danger" | "info";
type ToastInput = { title: string; description?: string; variant?: ToastVariant };
type ToastItem = ToastInput & { id: string };
type ToastContextValue = { toast: (input: ToastInput) => void };

const ToastContext = createContext<ToastContextValue | null>(null);
const icons = { success: CheckCircle2, danger: AlertCircle, info: Info };
const tones = { success: "text-success", danger: "text-danger", info: "text-info" };

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const dismiss = useCallback((id: string) => setItems((current) => current.filter((item) => item.id !== id)), []);
  const toast = useCallback((input: ToastInput) => { const id = crypto.randomUUID(); setItems((current) => [...current.slice(-3), { ...input, id }]); window.setTimeout(() => dismiss(id), 4500); }, [dismiss]);
  const value = useMemo(() => ({ toast }), [toast]);
  return <ToastContext.Provider value={value}>{children}<div className="pointer-events-none fixed inset-x-3 top-3 z-[100] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-4 sm:top-4 sm:w-96" aria-live="polite" aria-atomic="false">{items.map((item) => { const variant = item.variant ?? "info"; const Icon = icons[variant]; return <div key={item.id} role={variant === "danger" ? "alert" : "status"} className="pointer-events-auto flex w-full gap-3 rounded-md border bg-popover p-3 text-popover-foreground shadow-lg"><Icon className={cn("mt-0.5 size-4 shrink-0", tones[variant])} aria-hidden="true" /><div className="min-w-0 flex-1"><p className="text-sm font-medium">{item.title}</p>{item.description && <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{item.description}</p>}</div><button type="button" aria-label="ปิดการแจ้งเตือน" className="inline-flex size-7 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring" onClick={() => dismiss(item.id)}><X className="size-4" /></button></div>; })}</div></ToastContext.Provider>;
}

export function useToast() { const context = useContext(ToastContext); if (!context) throw new Error("useToast must be used within ToastProvider"); return context; }
