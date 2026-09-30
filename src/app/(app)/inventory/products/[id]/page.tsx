import { Pencil } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DetailHeader } from "@/components/shared/detail-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { ProductDetail } from "@/features/products/components/product-detail";
import { ProductStatusAction } from "@/features/products/components/product-status-action";
import { requireRouteAccess } from "@/services/auth.service";
import { getProduct, getProductActivity } from "@/services/product.service";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const [access, product, activity] = await Promise.all([requireRouteAccess(`/inventory/products/${id}`), getProduct(id), getProductActivity(id)]); if (!product) notFound(); const canEdit = access.permissions.includes("product.update"); const canArchive = access.permissions.includes("product.archive"); return <div className="page-stack"><DetailHeader title={product.name} identifier={product.sku} description={product.category?.name ?? "ไม่ระบุหมวดหมู่"} section={{ label: "สินค้า", href: "/inventory/products" }} status={<StatusBadge status={product.status === "ACTIVE" ? "active" : "inactive"} />} actions={<>{canEdit && <Button asChild size="sm" variant="outline"><Link href={`/inventory/products/${id}/edit`}><Pencil className="size-4" aria-hidden="true" />แก้ไข</Link></Button>}{canArchive && <ProductStatusAction id={id} name={product.name} status={product.status} />}</>} /><ProductDetail product={product} activity={activity} canViewCost={canEdit} /></div>; }
