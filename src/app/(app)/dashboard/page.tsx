import { DashboardOverview } from "@/features/dashboard/components/dashboard-overview";
import { PageHeader } from "@/components/shared/page-header";

export default function DashboardPage() { return <div className="page-stack"><PageHeader title="ภาพรวมธุรกิจ" description="ข้อมูลสำคัญของวันนี้และแนวโน้มการดำเนินงาน (ข้อมูลจำลอง)" /><DashboardOverview /></div>; }
