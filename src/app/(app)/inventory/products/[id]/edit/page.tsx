import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { ProductForm } from "@/features/products/components/product-form";
import { requirePermission } from "@/services/auth.service";
import { getProduct, getProductOptions } from "@/services/product.service";

export const metadata = { title: "แก้ไขสินค้า" };
export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const access = await requirePermission("product.update"); const [product, options] = await Promise.all([getProduct(id), getProductOptions()]); if (!product) notFound(); return <div className="page-stack"><PageHeader title="แก้ไขสินค้า" description={`${product.sku} · ${product.name}`} breadcrumbs={[{ label: "สินค้า", href: "/inventory/products" }, { label: product.name, href: `/inventory/products/${id}` }]} /><ProductForm product={product} {...options} canArchive={access.permissions.includes("product.archive")} /></div>; }
