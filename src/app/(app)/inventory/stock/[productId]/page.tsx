import { Pencil } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DetailHeader } from "@/components/shared/detail-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { StockDetail } from "@/features/inventory/components/stock-detail";
import { requireRouteAccess } from "@/services/auth.service";
import { getStockDetail } from "@/services/inventory.service";

export default async function StockDetailPage({ params }: { params: Promise<{ productId: string }> }) { const { productId } = await params; const [access, stock] = await Promise.all([requireRouteAccess(`/inventory/stock/${productId}`), getStockDetail(productId)]); if (!stock) notFound(); return <div className="page-stack"><DetailHeader title={stock.name} identifier={stock.sku} description={stock.categoryName ?? "ไม่ระบุหมวดหมู่"} section={{ label: "สต็อก", href: "/inventory/stock" }} status={<StatusBadge status={stock.productStatus === "ACTIVE" ? "active" : "inactive"} />} actions={access.permissions.includes("product.update") ? <Button size="sm" variant="outline" asChild><Link href={`/inventory/products/${productId}/edit`}><Pencil className="size-4" aria-hidden="true" />แก้ไขสินค้า</Link></Button> : undefined} /><StockDetail stock={stock} /></div>; }
