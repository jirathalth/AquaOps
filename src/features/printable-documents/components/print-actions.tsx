"use client";

import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import styles from "./printable-document.module.css";

export function PrintActions({ backHref }: { backHref: string }) {
  return <nav className={styles.actions} aria-label="การทำงานเอกสาร"><Button variant="outline" asChild><Link href={backHref}><ArrowLeft aria-hidden="true" />กลับ</Link></Button><Button onClick={() => window.print()}><Printer aria-hidden="true" />พิมพ์</Button></nav>;
}
