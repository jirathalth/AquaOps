import { AlertTriangle, Banknote, Boxes, ClipboardList, Truck, WalletCards } from "lucide-react";
import { DashboardCharts } from "@/features/dashboard/components/dashboard-charts";
import { StatCard } from "@/components/shared/stat-card";
import { FinancialValue } from "@/components/shared/financial-value";

const stats = [
  { label: "ยอดขายวันนี้", value: <FinancialValue value={81450} fractionDigits={0} />, helper: "+8.2% จากเมื่อวาน", icon: Banknote, tone: "success" as const },
  { label: "ยอดขายเดือนนี้", value: <FinancialValue value={1284900} fractionDigits={0} />, helper: "68% ของเป้าหมาย", icon: WalletCards },
  { label: "ลูกหนี้คงค้าง", value: <FinancialValue value={426700} fractionDigits={0} />, helper: "เกินกำหนด ฿58,200", icon: AlertTriangle, tone: "danger" as const },
  { label: "คำสั่งซื้อวันนี้", value: "48", helper: "ยืนยันแล้ว 39 รายการ", icon: ClipboardList },
  { label: "รอจัดส่ง", value: "17", helper: "5 เที่ยวจัดส่ง", icon: Truck, tone: "warning" as const },
  { label: "สินค้าใกล้หมด", value: "6", helper: "ควรตรวจสอบสต็อก", icon: Boxes, tone: "warning" as const },
];

export function DashboardOverview() { return <div className="space-y-4"><section aria-label="ตัวชี้วัดสำคัญ" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">{stats.map((stat) => <StatCard key={stat.label} {...stat} />)}</section><DashboardCharts /></div>; }
