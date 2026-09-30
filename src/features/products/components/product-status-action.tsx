"use client";

import { useRouter } from "next/navigation";
import { changeProductStatusAction } from "@/features/products/actions";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/shared/toast-provider";

export function ProductStatusAction({ id, name, status }: { id: string; name: string; status: "ACTIVE" | "INACTIVE" }) { const router = useRouter(); const { toast } = useToast(); const activate = status === "INACTIVE"; return <ConfirmDialog title={activate ? "เปิดใช้งานสินค้า?" : "ปิดใช้งานสินค้า?"} description={activate ? `${name} จะกลับมาเลือกใช้ในรายการราคาและรายการขายใหม่ได้` : `${name} จะไม่สามารถเลือกใช้ในรายการราคาและรายการขายใหม่ แต่ข้อมูลเดิมยังคงอยู่`} confirmLabel={activate ? "เปิดใช้งาน" : "ปิดใช้งาน"} destructive={!activate} trigger={<Button size="sm" variant={activate ? "outline" : "destructive"}>{activate ? "เปิดใช้งาน" : "ปิดใช้งาน"}</Button>} onConfirm={async () => { const result = await changeProductStatusAction({ id, status: activate ? "ACTIVE" : "INACTIVE" }); if (!result.ok) throw new Error(result.message); toast({ variant: "success", title: activate ? "เปิดใช้งานสินค้าแล้ว" : "ปิดใช้งานสินค้าแล้ว" }); router.refresh(); }} />; }
