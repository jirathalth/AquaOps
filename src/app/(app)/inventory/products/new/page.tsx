import { PageHeader } from "@/components/shared/page-header";
import { ProductForm } from "@/features/products/components/product-form";
import { requirePermission } from "@/services/auth.service";
import { getProductOptions } from "@/services/product.service";

export const metadata = { title: "เพิ่มสินค้า" };
export default async function NewProductPage() { const access = await requirePermission("product.create"); const options = await getProductOptions(); return <div className="page-stack"><PageHeader title="เพิ่มสินค้า" description="บันทึกข้อมูล หน่วยหลัก และราคามาตรฐาน" breadcrumbs={[{ label: "สินค้า", href: "/inventory/products" }]} /><ProductForm {...options} canArchive={access.permissions.includes("product.archive")} /></div>; }
