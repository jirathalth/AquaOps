import type { PermissionCode } from "@/config/permissions";

const routePermissions: readonly [string, PermissionCode][] = [
  ["/admin/audit-logs", "audit_log.view"], ["/admin/settings", "settings.view"], ["/admin/roles", "role.view"], ["/admin/users", "user.view"],
  ["/accounting/receivables", "ar.view"], ["/accounting/payments", "payment.view"], ["/accounting/billing", "billing.view"], ["/accounting/invoices", "invoice.view"],
  ["/inventory/movements", "inventory.view"], ["/inventory/stock", "inventory.view"], ["/inventory/products", "product.view"],
  ["/delivery/trips", "delivery.view"], ["/sales/customers", "customer.view"], ["/sales/orders", "sales_order.view"], ["/reports", "report.view"], ["/dashboard", "dashboard.view"],
];

export function getRoutePermission(pathname: string): PermissionCode | undefined { return routePermissions.find(([route]) => pathname === route || pathname.startsWith(`${route}/`))?.[1]; }
