import { PageHeader } from "@/components/shared/page-header";
import { TransferForm } from "@/features/inventory/components/transfer-form";
import { requirePermission } from "@/services/auth.service";
import { getInventoryOptions } from "@/services/inventory.service";

export const metadata = { title: "โอนย้ายสต็อก" };
export default async function NewTransferPage() { await requirePermission("inventory.transfer"); const options = await getInventoryOptions(); return <div className="page-stack"><PageHeader title="โอนย้ายสต็อก" description="ย้ายสินค้าออกจากคลังต้นทางและเข้าคลังปลายทางในรายการเดียว" breadcrumbs={[{ label: "สต็อก", href: "/inventory/stock" }]} /><TransferForm {...options} /></div>; }
