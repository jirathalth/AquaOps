"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;
const DialogPortal = DialogPrimitive.Portal;
function DialogOverlay({ className, ...props }: ComponentProps<typeof DialogPrimitive.Overlay>) { return <DialogPrimitive.Overlay className={cn("fixed inset-0 z-50 bg-black/50", className)} {...props} />; }
function DialogContent({ className, children, showClose = true, ...props }: ComponentProps<typeof DialogPrimitive.Content> & { showClose?: boolean }) { return <DialogPortal><DialogOverlay /><DialogPrimitive.Content className={cn("fixed left-1/2 top-1/2 z-50 grid max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 overflow-y-auto rounded-md border bg-background p-4 shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-5", className)} {...props}>{children}{showClose && <DialogPrimitive.Close className="absolute right-2 top-2 inline-flex size-8 items-center justify-center rounded-sm opacity-70 hover:bg-muted hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"><X className="size-4" /><span className="sr-only">ปิด</span></DialogPrimitive.Close>}</DialogPrimitive.Content></DialogPortal>; }
function DialogHeader({ className, ...props }: ComponentProps<"div">) { return <div className={cn("flex flex-col gap-1.5 pr-8 text-left", className)} {...props} />; }
function DialogFooter({ className, ...props }: ComponentProps<"div">) { return <div className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />; }
function DialogTitle({ className, ...props }: ComponentProps<typeof DialogPrimitive.Title>) { return <DialogPrimitive.Title className={cn("text-base font-semibold leading-6", className)} {...props} />; }
function DialogDescription({ className, ...props }: ComponentProps<typeof DialogPrimitive.Description>) { return <DialogPrimitive.Description className={cn("text-sm leading-6 text-muted-foreground", className)} {...props} />; }
export { Dialog, DialogTrigger, DialogClose, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription };
