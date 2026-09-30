"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { createProductAction, updateProductAction } from "@/features/products/actions";
import type { CategoryOption, ProductDetailData, UnitOption } from "@/features/products/types";
import { productFormSchema, type ProductFormValues } from "@/validations/product";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { CurrencyInput, NumberInput } from "@/components/shared/form-controls";
import { FormActions, FormField, FormSection } from "@/components/shared/form-layout";
import { useToast } from "@/components/shared/toast-provider";

const defaults: ProductFormValues = { sku: "", name: "", description: "", categoryId: "", status: "ACTIVE", trackInventory: true, reorderLevel: "0.000", baseUnitId: "", barcode: "", cost: "0.0000", retailPrice: "0.0000", wholesalePrice: "0.0000" };

export function ProductForm({ product, categories, units, canArchive }: { product?: ProductDetailData; categories: CategoryOption[]; units: UnitOption[]; canArchive: boolean }) {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<ProductFormValues>({ resolver: zodResolver(productFormSchema), defaultValues: product ? { id: product.id, sku: product.sku, name: product.name, description: product.description, categoryId: product.categoryId, status: product.status, trackInventory: product.trackInventory, reorderLevel: product.reorderLevel, baseUnitId: product.baseUnitId, barcode: product.barcode, cost: product.cost, retailPrice: product.retailPrice, wholesalePrice: product.wholesalePrice } : defaults });
  const activeCategories = categories.filter((item) => item.isActive || item.id === product?.categoryId);
  const activeUnits = units.filter((item) => item.isActive || item.id === product?.baseUnitId);

  async function submit(values: ProductFormValues) {
    const result = product ? await updateProductAction(values) : await createProductAction(values);
    if (!result.ok) { form.setError("root", { message: result.message }); return; }
    toast({ variant: "success", title: product ? "บันทึกการเปลี่ยนแปลงแล้ว" : "เพิ่มสินค้าแล้ว" });
    router.push(`/inventory/products/${result.id}`);
    router.refresh();
  }

  return <Card><CardContent><form className="space-y-6" onSubmit={form.handleSubmit(submit)} noValidate>
    {form.formState.errors.root?.message && <Alert variant="danger"><AlertDescription>{form.formState.errors.root.message}</AlertDescription></Alert>}
    <FormSection title="ข้อมูลสินค้า" description="ข้อมูลหลักสำหรับค้นหาและใช้อ้างอิงในเอกสาร">
      <FormField label="SKU / รหัสสินค้า" htmlFor="sku" required error={form.formState.errors.sku?.message}><Input id="sku" autoComplete="off" placeholder="เช่น WATER-600" {...form.register("sku")} /></FormField>
      <FormField label="ชื่อสินค้า" htmlFor="name" required error={form.formState.errors.name?.message}><Input id="name" {...form.register("name")} /></FormField>
      <FormField label="หมวดหมู่" htmlFor="categoryId" error={form.formState.errors.categoryId?.message}><Controller name="categoryId" control={form.control} render={({ field }) => <Select value={field.value || "NONE"} onValueChange={(value) => field.onChange(value === "NONE" ? "" : value)}><SelectTrigger id="categoryId"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="NONE">ไม่ระบุหมวดหมู่</SelectItem>{activeCategories.map((item) => <SelectItem key={item.id} value={item.id} disabled={!item.isActive}>{item.name}{!item.isActive ? " (ไม่ใช้งาน)" : ""}</SelectItem>)}</SelectContent></Select>} /></FormField>
      <FormField className="sm:col-span-2 xl:col-span-3" label="คำอธิบาย" htmlFor="description" error={form.formState.errors.description?.message}><Textarea id="description" rows={3} {...form.register("description")} /></FormField>
      {!product && canArchive && <FormField label="สถานะเริ่มต้น" htmlFor="status" error={form.formState.errors.status?.message}><Controller name="status" control={form.control} render={({ field }) => <Select value={field.value} onValueChange={field.onChange}><SelectTrigger id="status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ACTIVE">ใช้งาน</SelectItem><SelectItem value="INACTIVE">ไม่ใช้งาน</SelectItem></SelectContent></Select>} /></FormField>}
    </FormSection>
    <FormSection title="หน่วยและบาร์โค้ด" description={product ? "หน่วยหลักเปลี่ยนไม่ได้หลังสร้าง เพื่อรักษาความถูกต้องของรายการอ้างอิง" : "กำหนดหน่วยหลักหนึ่งหน่วยสำหรับสินค้า"}>
      <FormField label="หน่วยหลัก" htmlFor="baseUnitId" required error={form.formState.errors.baseUnitId?.message}><Controller name="baseUnitId" control={form.control} render={({ field }) => <Select value={field.value} onValueChange={field.onChange} disabled={Boolean(product)}><SelectTrigger id="baseUnitId"><SelectValue placeholder="เลือกหน่วย" /></SelectTrigger><SelectContent>{activeUnits.map((item) => <SelectItem key={item.id} value={item.id} disabled={!item.isActive}>{item.nameTh} ({item.symbol}){!item.isActive ? " — ไม่ใช้งาน" : ""}</SelectItem>)}</SelectContent></Select>} /></FormField>
      <FormField label="บาร์โค้ด" htmlFor="barcode" description="ไม่บังคับและต้องไม่ซ้ำ" error={form.formState.errors.barcode?.message}><Input id="barcode" inputMode="numeric" autoComplete="off" {...form.register("barcode")} /></FormField>
    </FormSection>
    <FormSection title="ราคา" description="เก็บเป็น Decimal 4 ตำแหน่งและใช้เป็นราคาสำรองเมื่อไม่มีราคาพิเศษ">
      <FormField label="ต้นทุน" htmlFor="cost" error={form.formState.errors.cost?.message}><CurrencyInput id="cost" min="0" {...form.register("cost")} /></FormField>
      <FormField label="ราคาปลีก" htmlFor="retailPrice" required error={form.formState.errors.retailPrice?.message}><CurrencyInput id="retailPrice" min="0" {...form.register("retailPrice")} /></FormField>
      <FormField label="ราคาส่ง" htmlFor="wholesalePrice" required error={form.formState.errors.wholesalePrice?.message}><CurrencyInput id="wholesalePrice" min="0" {...form.register("wholesalePrice")} /></FormField>
    </FormSection>
    <FormSection title="การตั้งค่าสินค้าคงคลัง" description="เป็นค่ากำหนดเท่านั้น ยังไม่คำนวณสต็อกจริง">
      <FormField label="สต็อกขั้นต่ำ" htmlFor="reorderLevel" error={form.formState.errors.reorderLevel?.message}><NumberInput id="reorderLevel" min="0" step="0.001" {...form.register("reorderLevel")} /></FormField>
      <FormField label="ติดตามสินค้าคงคลัง" htmlFor="trackInventory"><Controller name="trackInventory" control={form.control} render={({ field }) => <label className="flex min-h-10 items-center gap-3"><Switch id="trackInventory" checked={field.value} onCheckedChange={field.onChange} /><span className="text-sm">{field.value ? "ติดตามจำนวนคงเหลือ" : "ไม่ติดตามจำนวนคงเหลือ"}</span></label>} /></FormField>
    </FormSection>
    <FormActions><Button type="button" variant="outline" onClick={() => router.back()} disabled={form.formState.isSubmitting}>ยกเลิก</Button><Button type="submit" loading={form.formState.isSubmitting}>{product ? "บันทึกการเปลี่ยนแปลง" : "เพิ่มสินค้า"}</Button></FormActions>
  </form></CardContent></Card>;
}
