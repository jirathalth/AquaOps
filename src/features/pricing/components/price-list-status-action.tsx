"use client";

import { useRouter } from "next/navigation";
import { changePriceListStatusAction } from "@/features/pricing/actions";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/shared/toast-provider";

export function PriceListStatusAction({ id, name, status }: { id: string; name: string; status: "DRAFT" | "ACTIVE" | "INACTIVE" }) { const router = useRouter(); const { toast } = useToast(); const activate = status !== "ACTIVE"; return <ConfirmDialog title={activate ? "เปิดใช้งานรายการราคา?" : "ปิดใช้งานรายการราคา?"} description={activate ? `${name} จะสามารถกำหนดให้ลูกค้าและใช้หาราคาใหม่ได้` : `${name} จะไม่ถูกใช้หาราคาใหม่ แต่ข้อมูลเดิมยังคงอยู่`} confirmLabel={activate ? "เปิดใช้งาน" : "ปิดใช้งาน"} destructive={!activate} trigger={<Button size="sm" variant={activate ? "outline" : "destructive"}>{activate ? "เปิดใช้งาน" : "ปิดใช้งาน"}</Button>} onConfirm={async () => { const result = await changePriceListStatusAction({ id, status: activate ? "ACTIVE" : "INACTIVE" }); if (!result.ok) throw new Error(result.message); toast({ variant: "success", title: activate ? "เปิดใช้งานรายการราคาแล้ว" : "ปิดใช้งานรายการราคาแล้ว" }); router.refresh(); }} />; }
