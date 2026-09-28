"use client";

import type { ComponentProps } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const Sheet = Dialog;
const SheetTrigger = DialogTrigger;
function SheetContent({ className, side = "left", ...props }: ComponentProps<typeof DialogContent> & { side?: "left" | "right" }) { return <DialogContent showClose={false} className={cn("top-0 h-dvh w-60 max-w-[85vw] translate-y-0 gap-0 rounded-none border-y-0 p-0", side === "left" ? "left-0 translate-x-0 border-l-0" : "right-0 left-auto translate-x-0 border-r-0", className)} {...props} />; }
const SheetTitle = DialogTitle;
const SheetDescription = DialogDescription;
export { Sheet, SheetTrigger, SheetContent, SheetTitle, SheetDescription };
