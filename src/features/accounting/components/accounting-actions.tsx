"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/shared/toast-provider";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cancelBillingNoteAction, issueBillingNoteAction, issueInvoiceAction, voidInvoiceAction, voidPaymentAction } from "@/features/accounting/actions";

type Result = { ok: true; id: string } | { ok: false; message: string };
export function AccountingActions({ id, kind, canIssue, canCancel, issueLabel = "ออกเอกสาร", cancelLabel = "ยกเลิกเอกสาร" }: { id: string; kind: "invoice" | "billing" | "payment"; canIssue: boolean; canCancel: boolean; issueLabel?: string; cancelLabel?: string }) {
  const router = useRouter(); const { toast } = useToast(); const [pending, setPending] = useState(false); const [dialog, setDialog] = useState(false); const [reason, setReason] = useState(""); const [error, setError] = useState("");
  async function issue() { setPending(true); const result: Result = kind === "invoice" ? await issueInvoiceAction({ id }) : await issueBillingNoteAction({ id }); setPending(false); if (!result.ok) { toast({ variant: "danger", title: result.message }); return; } toast({ variant: "success", title: `${issueLabel}แล้ว` }); router.refresh(); }
  async function cancel() { setError(""); if (reason.trim().length < 3) { setError("กรุณาระบุเหตุผลอย่างน้อย 3 ตัวอักษร"); return; } setPending(true); const result: Result = kind === "invoice" ? await voidInvoiceAction({ id, reason }) : kind === "billing" ? await cancelBillingNoteAction({ id, reason }) : await voidPaymentAction({ id, reason }); setPending(false); if (!result.ok) { setError(result.message); return; } setDialog(false); toast({ variant: "success", title: `${cancelLabel}แล้ว` }); router.refresh(); }
  return <>{canIssue && <Button size="sm" loading={pending} onClick={issue}>{issueLabel}</Button>}{canCancel && <Button size="sm" variant="outline" className="text-danger" disabled={pending} onClick={() => setDialog(true)}>{cancelLabel}</Button>}<Dialog open={dialog} onOpenChange={setDialog}><DialogContent><DialogHeader><DialogTitle>{cancelLabel}?</DialogTitle><DialogDescription>รายการทางการเงินจะยังคงอยู่ในประวัติและไม่สามารถลบถาวรได้</DialogDescription></DialogHeader><div className="space-y-1.5"><label className="type-label" htmlFor="cancel-reason">เหตุผล <span className="text-danger">*</span></label><Textarea id="cancel-reason" value={reason} onChange={(event) => setReason(event.target.value)} aria-invalid={Boolean(error)} aria-describedby={error ? "cancel-error" : undefined} rows={3} />{error && <p id="cancel-error" className="text-sm text-danger" role="alert">{error}</p>}</div><DialogFooter><Button variant="outline" onClick={() => setDialog(false)}>กลับ</Button><Button variant="destructive" loading={pending} onClick={cancel}>ยืนยันการยกเลิก</Button></DialogFooter></DialogContent></Dialog></>;
}
