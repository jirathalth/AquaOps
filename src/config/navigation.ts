import type { LucideIcon } from "lucide-react";
import { BarChart3, Boxes, Building2, Factory, FileText, Gauge, Handshake, MapPinned, ReceiptText, Settings, ShieldCheck, ShoppingCart, Tags, Truck, UserRoundCog, UsersRound, WalletCards, Warehouse } from "lucide-react";
import type { MessageKey } from "@/config/i18n";
import type { PermissionCode } from "@/config/permissions";

export type NavItem = { label: MessageKey; href?: string; icon?: LucideIcon; disabled?: boolean; permission?: PermissionCode };
export type NavGroup = { label?: MessageKey; items: NavItem[] };

export const navigation: NavGroup[] = [
  { items: [{ label: "dashboard", href: "/dashboard", icon: Gauge, permission: "dashboard.view" }] },
  { label: "sales", items: [{ label: "orders", href: "/sales/orders", icon: ReceiptText, permission: "sales_order.view" }, { label: "customers", href: "/customers", icon: UsersRound, permission: "customer.view" }, { label: "priceLists", href: "/price-lists", icon: Tags, permission: "price_list.view" }] },
  { label: "delivery", items: [{ label: "deliveryOverview", href: "/delivery", icon: MapPinned, permission: "delivery.view" }, { label: "deliveryTrips", href: "/delivery/trips", icon: Truck, permission: "delivery.view" }, { label: "deliveryVehicles", href: "/delivery/vehicles", icon: Truck, permission: "delivery.view" }] },
  { label: "accounting", items: [{ label: "invoices", href: "/accounting/invoices", icon: FileText, permission: "invoice.view" }, { label: "billing", href: "/accounting/billing", icon: Building2, permission: "billing.view" }, { label: "payments", href: "/accounting/payments", icon: WalletCards, permission: "payment.view" }, { label: "receivables", href: "/accounting/ar", icon: BarChart3, permission: "ar.view" }] },
  { label: "inventory", items: [{ label: "products", href: "/inventory/products", icon: Boxes, permission: "product.view" }, { label: "stock", href: "/inventory/stock", icon: Warehouse, permission: "inventory.view" }, { label: "stockMovements", href: "/inventory/movements", icon: Boxes, permission: "inventory.view" }, { label: "warehouses", href: "/inventory/warehouses", icon: Building2, permission: "inventory.view" }] },
  { items: [{ label: "reports", href: "/reports", icon: BarChart3, permission: "report.view" }] },
  { label: "administration", items: [{ label: "users", href: "/admin/users", icon: UserRoundCog, permission: "user.view" }, { label: "roles", href: "/admin/roles", icon: ShieldCheck, permission: "role.view" }, { label: "auditLogs", href: "/admin/audit-logs", icon: FileText, permission: "audit_log.view" }, { label: "settings", href: "/admin/settings", icon: Settings, permission: "settings.view" }] },
  { label: "futureModules", items: [{ label: "production", icon: Factory, disabled: true }, { label: "purchasing", icon: ShoppingCart, disabled: true }, { label: "suppliers", icon: Handshake, disabled: true }] },
];

export function filterNavigation(permissions: ReadonlySet<string>): NavGroup[] { return navigation.map((group) => ({ ...group, items: group.items.filter((item) => !item.permission || permissions.has(item.permission)) })).filter((group) => group.items.length > 0); }
