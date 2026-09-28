"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState, type ReactNode } from "react";

type ConfirmDialogProps = { trigger: ReactNode; title: string; description: string; confirmLabel?: string; cancelLabel?: string; onConfirm: () => void | Promise<void>; destructive?: boolean };
export function ConfirmDialog({ trigger, title, description, confirmLabel = "ยืนยัน", cancelLabel = "ยกเลิก", onConfirm, destructive }: ConfirmDialogProps) { const [open, setOpen] = useState(false); const [pending, setPending] = useState(false); async function confirm() { setPending(true); try { await onConfirm(); setOpen(false); } finally { setPending(false); } } return <Dialog open={open} onOpenChange={(next) => { if (!pending) setOpen(next); }}><DialogTrigger asChild>{trigger}</DialogTrigger><DialogContent><DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription></DialogHeader><DialogFooter><Button type="button" variant="outline" disabled={pending} onClick={() => setOpen(false)}>{cancelLabel}</Button><Button type="button" variant={destructive ? "destructive" : "default"} loading={pending} onClick={confirm}>{confirmLabel}</Button></DialogFooter></DialogContent></Dialog>; }
