import type { LucideIcon } from "lucide-react";
import { BarChart3, Boxes, Building2, Factory, FileText, Gauge, Handshake, ReceiptText, Settings, ShieldCheck, ShoppingCart, Truck, UserRoundCog, UsersRound, WalletCards, Warehouse } from "lucide-react";
import type { MessageKey } from "@/config/i18n";

export type NavItem = { label: MessageKey; href?: string; icon?: LucideIcon; disabled?: boolean };
export type NavGroup = { label?: MessageKey; items: NavItem[] };

export const navigation: NavGroup[] = [
  { items: [{ label: "dashboard", href: "/dashboard", icon: Gauge }] },
  { label: "sales", items: [{ label: "orders", href: "/sales/orders", icon: ReceiptText }, { label: "customers", href: "/sales/customers", icon: UsersRound }] },
  { label: "delivery", items: [{ label: "deliveryTrips", href: "/delivery/trips", icon: Truck }] },
  { label: "accounting", items: [{ label: "invoices", href: "/accounting/invoices", icon: FileText }, { label: "billing", href: "/accounting/billing", icon: Building2 }, { label: "payments", href: "/accounting/payments", icon: WalletCards }, { label: "receivables", href: "/accounting/receivables", icon: BarChart3 }] },
  { label: "inventory", items: [{ label: "products", href: "/inventory/products", icon: Boxes }, { label: "stock", href: "/inventory/stock", icon: Warehouse }, { label: "stockMovements", href: "/inventory/movements", icon: Boxes }] },
  { items: [{ label: "reports", href: "/reports", icon: BarChart3 }] },
  { label: "administration", items: [{ label: "users", href: "/admin/users", icon: UserRoundCog }, { label: "roles", href: "/admin/roles", icon: ShieldCheck }, { label: "auditLogs", href: "/admin/audit-logs", icon: FileText }, { label: "settings", href: "/admin/settings", icon: Settings }] },
  { label: "futureModules", items: [{ label: "production", icon: Factory, disabled: true }, { label: "purchasing", icon: ShoppingCart, disabled: true }, { label: "suppliers", icon: Handshake, disabled: true }] },
];
