import { Construction } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";

export function PlaceholderPage({ title, section }: { title: string; section: string }) { return <div className="page-stack"><PageHeader title={title} parent={{ label: section }} description="พื้นที่นี้เตรียมไว้สำหรับการพัฒนาในระยะถัดไป" /><Card><CardContent className="flex min-h-52 flex-col items-center justify-center p-6 text-center"><div className="rounded-full bg-muted p-2.5"><Construction className="size-5 text-muted-foreground" aria-hidden="true" /></div><p className="mt-3 text-sm font-medium">โมดูล {title}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">โครงสร้างพร้อมสำหรับเพิ่มความสามารถทางธุรกิจในงานถัดไป</p></CardContent></Card></div>; }
