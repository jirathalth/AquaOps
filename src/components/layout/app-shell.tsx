"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/use-media-query";
import { PermissionProvider } from "@/components/auth/permission-guard";
import type { AuthorizationContext } from "@/services/authorization-core";

export function AppShell({ children, access }: { children: ReactNode; access: AuthorizationContext }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const tablet = useMediaQuery("(min-width: 768px) and (max-width: 1199px)");
  const effectiveCollapsed = collapsed || tablet;
  return <PermissionProvider permissions={access.permissions}><div className="flex min-h-screen bg-background"><div className="sticky top-0 hidden h-screen shrink-0 md:block"><Sidebar collapsed={effectiveCollapsed} permissions={access.permissions} /></div><Sheet open={mobileOpen} onOpenChange={setMobileOpen}><SheetContent side="left"><SheetTitle className="sr-only">เมนูหลัก</SheetTitle><SheetDescription className="sr-only">เมนูนำทางของ AquaOps</SheetDescription><Sidebar mobile permissions={access.permissions} onClose={() => setMobileOpen(false)} /></SheetContent></Sheet><div className="flex min-w-0 flex-1 flex-col"><Topbar collapsed={effectiveCollapsed} user={access.user} permissions={access.permissions} onToggleCollapsed={() => setCollapsed((value) => !value)} onOpenMobile={() => setMobileOpen(true)} /><main id="main-content" tabIndex={-1} className="flex-1 p-4 outline-none sm:p-5 lg:p-6"><div className="page-container">{children}</div></main></div></div></PermissionProvider>;
}
