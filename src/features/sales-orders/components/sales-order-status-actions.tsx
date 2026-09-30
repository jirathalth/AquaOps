"use client";

import { Ban, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useToast } from "@/components/shared/toast-provider";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { transitionSalesOrderAction } from "@/features/sales-orders/actions";

export function SalesOrderStatusActions({ id, orderNo, canConfirm, canCancel }: { id: string; orderNo: string; canConfirm: boolean; canCancel: boolean }) { const router = useRouter(); const { toast } = useToast(); const [cancelOpen, setCancelOpen] = useState(false); const [note, setNote] = useState(""); const [pending, setPending] = useState(false); async function transition(toStatus: "CONFIRMED" | "CANCELLED", reason = "") { const result = await transitionSalesOrderAction({ id, toStatus, note: reason }); if (!result.ok) { toast({ variant: "danger", title: result.message }); return; } toast({ variant: "success", title: toStatus === "CONFIRMED" ? "ยืนยันคำสั่งซื้อแล้ว" : "ยกเลิกคำสั่งซื้อแล้ว" }); router.refresh(); }
  return <>{canConfirm && <ConfirmDialog trigger={<Button size="sm"><CheckCircle2 className="size-4" aria-hidden="true" />ยืนยันคำสั่งซื้อ</Button>} title="ยืนยันคำสั่งซื้อ" description={`ยืนยัน ${orderNo} และล็อกราคา/ยอดเงินตามข้อมูลปัจจุบัน การยืนยันใน Phase 7 จะไม่ตัดหรือจองสต็อก`} confirmLabel="ยืนยันคำสั่งซื้อ" onConfirm={() => transition("CONFIRMED")} />}{canCancel && <Dialog open={cancelOpen} onOpenChange={(open) => { if (!pending) setCancelOpen(open); }}><DialogTrigger asChild><Button size="sm" variant="destructive"><Ban className="size-4" aria-hidden="true" />ยกเลิกคำสั่งซื้อ</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>ยกเลิกคำสั่งซื้อ</DialogTitle><DialogDescription>คำสั่งซื้อจะยังคงอยู่ในประวัติและไม่สามารถแก้ไขต่อได้</DialogDescription></DialogHeader><label className="space-y-1.5 text-sm font-medium" htmlFor="cancel-note">เหตุผล (ไม่บังคับ)<Textarea id="cancel-note" className="mt-1.5" maxLength={500} value={note} onChange={(event) => setNote(event.target.value)} /></label><DialogFooter><Button type="button" variant="outline" disabled={pending} onClick={() => setCancelOpen(false)}>กลับ</Button><Button type="button" variant="destructive" loading={pending} onClick={async () => { setPending(true); await transition("CANCELLED", note); setPending(false); setCancelOpen(false); }}>ยกเลิกคำสั่งซื้อ</Button></DialogFooter></DialogContent></Dialog>}</>;
}
