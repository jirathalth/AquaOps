import type { PaymentMethod } from "@/generated/prisma/client";

export type SettingsSection = "general" | "sales" | "documents" | "inventory-delivery" | "finance" | "localization" | "system";

export type SettingsPageData = {
  version: number;
  general: { businessName: string; legalName: string; taxId: string; branch: string; addressLine: string; subdistrict: string; district: string; province: string; postalCode: string; phone: string; email: string; website: string; logoUrl: string };
  sales: { defaultPriceListId: string; defaultCreditTermDays: number; defaultVatRate: string; allowManualPriceOverride: boolean };
  documents: { salesOrderPrefix: string; deliveryTripPrefix: string; inventoryMovementPrefix: string; invoicePrefix: string; billingNotePrefix: string; paymentPrefix: string; showTaxIdOnDocuments: boolean; showAddressOnDocuments: boolean; documentFooter: string; paymentInstructions: string };
  inventoryDelivery: { defaultWarehouseId: string; defaultDeliverySourceWarehouseId: string };
  finance: { defaultPaymentMethod: PaymentMethod; billingInstructions: string };
  localization: { locale: "th-TH"; currency: "THB"; timezone: "Asia/Bangkok" };
  options: { priceLists: Array<{ id: string; code: string; name: string }>; warehouses: Array<{ id: string; code: string; name: string; isDefault: boolean }> };
  counters: Record<string, number>;
  system: { applicationName: string; version: string; environment: string; application: string; database: string };
};
