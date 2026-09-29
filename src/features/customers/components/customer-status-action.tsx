"use client";

import { ArchiveRestore, Ban } from "lucide-react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useToast } from "@/components/shared/toast-provider";
import { Button } from "@/components/ui/button";
import { changeCustomerStatusAction } from "@/features/customers/actions";

export function CustomerStatusAction({ id, name, status }: { id: string; name: string; status: "ACTIVE" | "INACTIVE" }) {
  const router = useRouter();
  const { toast } = useToast();
  const activating = status === "INACTIVE";
  async function changeStatus() { const result = await changeCustomerStatusAction({ id, status: activating ? "ACTIVE" : "INACTIVE" }); if (!result.ok) { toast({ variant: "danger", title: "เปลี่ยนสถานะไม่สำเร็จ", description: result.message }); return; } toast({ variant: "success", title: activating ? "เปิดใช้งานลูกค้าแล้ว" : "ปิดใช้งานลูกค้าแล้ว" }); router.refresh(); }
  return <ConfirmDialog trigger={<Button variant={activating ? "outline" : "destructive"} size="sm">{activating ? <ArchiveRestore className="size-4" /> : <Ban className="size-4" />}{activating ? "เปิดใช้งาน" : "ปิดใช้งาน"}</Button>} title={activating ? "เปิดใช้งานลูกค้า?" : "ปิดใช้งานลูกค้า?"} description={activating ? `${name} จะกลับมาใช้งานในรายการขายได้` : `${name} จะไม่สามารถถูกเลือกในรายการขายใหม่ แต่ประวัติเดิมจะยังคงอยู่`} confirmLabel={activating ? "เปิดใช้งาน" : "ปิดใช้งาน"} cancelLabel="ยกเลิก" destructive={!activating} onConfirm={changeStatus} />;
}
