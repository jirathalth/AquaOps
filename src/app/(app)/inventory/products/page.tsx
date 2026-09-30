import { PageHeader } from "@/components/shared/page-header";
import { CatalogManagement } from "@/features/products/components/catalog-management";
import { ProductTable } from "@/features/products/components/product-table";
import { requireRouteAccess } from "@/services/auth.service";
import { getProductOptions, getProducts } from "@/services/product.service";
import { productListQuerySchema } from "@/validations/product";

export const metadata = { title: "สินค้า" };
export default async function ProductsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) { const [access, params] = await Promise.all([requireRouteAccess("/inventory/products"), searchParams]); const parsed = productListQuerySchema.safeParse(params); const query = parsed.success ? parsed.data : productListQuerySchema.parse({}); const [result, options] = await Promise.all([getProducts(query), getProductOptions()]); return <div className="page-stack"><PageHeader title="สินค้า" description="จัดการสินค้า หมวดหมู่ หน่วย และราคามาตรฐาน" actions={<CatalogManagement {...options} canManage={access.permissions.includes("product.update")} />} /><ProductTable {...result} query={query} categories={options.categories} canCreate={access.permissions.includes("product.create")} /></div>; }
