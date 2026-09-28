"use client";

import { Bell, ChevronLeft, ChevronRight, Menu, Moon, Sun, UserRound } from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { navigation } from "@/config/navigation";
import { t } from "@/config/i18n";

type TopbarProps = { collapsed: boolean; onToggleCollapsed: () => void; onOpenMobile: () => void };

export function Topbar({ collapsed, onToggleCollapsed, onOpenMobile }: TopbarProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const currentItem = navigation.flatMap((group) => group.items).find((item) => item.href && (item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href)));
  async function signOut() { await authClient.signOut(); router.push("/login"); router.refresh(); }
  return <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2 border-b bg-card/95 px-3 backdrop-blur-sm sm:px-4"><Button aria-label="เปิดเมนู" className="md:hidden" variant="ghost" size="icon" onClick={onOpenMobile}><Menu className="size-5" /></Button><Button aria-label={collapsed ? "ขยายแถบเมนู" : "ย่อแถบเมนู"} className="hidden xl:inline-flex" variant="ghost" size="icon" onClick={onToggleCollapsed}>{collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}</Button><div className="ml-1 min-w-0"><p className="truncate text-sm font-medium">{currentItem ? t(currentItem.label) : "AquaOps"}</p><p className="hidden text-[11px] text-muted-foreground sm:block">ระบบบริหารจัดการภายใน</p></div><div className="ml-auto flex items-center gap-0.5"><Button aria-label={resolvedTheme === "dark" ? "ใช้ธีมสว่าง" : "ใช้ธีมมืด"} variant="ghost" size="icon" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>{resolvedTheme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}</Button><Button aria-label="การแจ้งเตือน" variant="ghost" size="icon"><Bell className="size-4" /></Button><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" className="gap-2 px-2" aria-label="เมนูผู้ใช้งาน"><span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary"><UserRound className="size-4" /></span><span className="hidden text-sm sm:inline">ผู้ดูแลระบบ</span></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel>บัญชีผู้ใช้งาน</DropdownMenuLabel><DropdownMenuSeparator /><DropdownMenuItem disabled>โปรไฟล์</DropdownMenuItem><DropdownMenuItem onSelect={() => router.push("/admin/settings")}>ตั้งค่า</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem onSelect={signOut}>ออกจากระบบ</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div></header>;
}
