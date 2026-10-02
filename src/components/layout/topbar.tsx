"use client";

import { Bell, ChevronLeft, ChevronRight, Menu, Moon, Sun, UserRound } from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { t } from "@/config/i18n";
import { filterNavigation } from "@/config/navigation";
import type { PermissionCode } from "@/config/permissions";

type TopbarProps = { collapsed: boolean; user: { name: string; email: string }; permissions: readonly PermissionCode[]; onToggleCollapsed: () => void; onOpenMobile: () => void };

export function Topbar({ collapsed, user, permissions, onToggleCollapsed, onOpenMobile }: TopbarProps) {
  const { setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const currentItem = filterNavigation(new Set(permissions)).flatMap((group) => group.items).find((item) => item.href && (item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href)));
  async function signOut() { await authClient.signOut(); router.push("/login"); router.refresh(); }
  return <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2 border-b border-border/80 bg-card/90 px-3 shadow-xs backdrop-blur-md sm:px-4"><Button aria-label="เปิดเมนู" className="border border-border bg-card shadow-xs md:hidden" variant="ghost" size="icon" onClick={onOpenMobile}><Menu className="size-5" /></Button><Button aria-label={collapsed ? "ขยายแถบเมนู" : "ย่อแถบเมนู"} className="hidden border border-border bg-card shadow-xs xl:inline-flex" variant="ghost" size="icon" onClick={onToggleCollapsed}>{collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}</Button><div className="ml-1 min-w-0"><p className="truncate text-sm font-semibold">{currentItem ? t(currentItem.label) : "AquaOps"}</p><p className="hidden text-[11px] text-muted-foreground sm:block">ระบบบริหารจัดการภายใน</p></div><div className="ml-auto flex items-center gap-1.5"><Button aria-label="สลับธีม" className="border border-border bg-card shadow-xs" variant="ghost" size="icon" onClick={() => setTheme(document.documentElement.classList.contains("dark") ? "light" : "dark")}><Sun className="hidden size-4 dark:block" aria-hidden="true" /><Moon className="size-4 dark:hidden" aria-hidden="true" /></Button><Button aria-label="การแจ้งเตือน" className="border border-border bg-card shadow-xs" variant="ghost" size="icon"><Bell className="size-4" /></Button><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" className="gap-2 border border-border bg-card px-2 shadow-xs" aria-label="เมนูผู้ใช้งาน"><span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary"><UserRound className="size-4" /></span><span className="hidden max-w-36 truncate text-sm sm:inline">{user.name}</span></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel><span className="block">{user.name}</span><span className="block max-w-56 truncate font-normal text-muted-foreground">{user.email}</span></DropdownMenuLabel><DropdownMenuSeparator /><DropdownMenuItem disabled>โปรไฟล์</DropdownMenuItem>{permissions.includes("settings.view") && <DropdownMenuItem onSelect={() => router.push("/admin/settings")}>ตั้งค่า</DropdownMenuItem>}<DropdownMenuSeparator /><DropdownMenuItem onSelect={signOut}>ออกจากระบบ</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div></header>;
}
