import type { ProductFormValues } from "@/validations/product";

export type CategoryOption = { id: string; code: string; name: string; isActive: boolean; productCount?: number };
export type UnitOption = { id: string; code: string; nameTh: string; nameEn: string; symbol: string; decimalScale: number; isActive: boolean; productCount?: number };
export type ProductUnitData = { id: string; unitId: string; barcode: string; conversionFactor: string; cost: string; retailPrice: string; wholesalePrice: string; isBase: boolean; isActive: boolean; unit: UnitOption };
export type ProductRow = { id: string; sku: string; name: string; description: string | null; status: "ACTIVE" | "INACTIVE"; trackInventory: boolean; reorderLevel: string; createdAt: string; updatedAt: string; category: CategoryOption | null; baseUnit: ProductUnitData | null };
export type ProductDetailData = Omit<ProductFormValues, "id" | "baseUnitId"> & { id: string; createdAt: string; updatedAt: string; category: CategoryOption | null; baseUnitId: string; units: ProductUnitData[] };
