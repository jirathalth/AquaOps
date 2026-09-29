"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { PermissionCode } from "@/config/permissions";

const PermissionContext = createContext<ReadonlySet<string>>(new Set());
export function PermissionProvider({ permissions, children }: { permissions: readonly PermissionCode[]; children: ReactNode }) { const value = useMemo(() => new Set<string>(permissions), [permissions]); return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>; }
export function usePermission(permission: PermissionCode): boolean { return useContext(PermissionContext).has(permission); }
export function Can({ permission, children, fallback = null }: { permission: PermissionCode; children: ReactNode; fallback?: ReactNode }) { return usePermission(permission) ? children : fallback; }
