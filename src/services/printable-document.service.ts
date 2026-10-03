import "server-only";
import { formatBusinessAddress } from "@/features/printable-documents/printable-document-core";
import { getBusinessSettings, getDocumentSettings } from "@/services/settings.service";

export async function getPrintableDocumentContext() {
  const [business, documents] = await Promise.all([getBusinessSettings(), getDocumentSettings()]);
  return {
    business: { ...business, address: documents.showAddressOnDocuments ? formatBusinessAddress(business) : "", taxId: documents.showTaxIdOnDocuments ? business.taxId : null },
    footer: documents.documentFooter,
  };
}
