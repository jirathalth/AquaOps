"use client";

import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip, type ChartOptions } from "chart.js";
import { useTheme } from "next-themes";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { chartColors } from "@/config/charts";

ChartJS.register(ArcElement, BarElement, CategoryScale, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip);

export function DashboardCharts() {
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === "dark" ? chartColors.dark : chartColors.light;
  const tooltipText = resolvedTheme === "dark" ? "#172033" : "#ffffff";
  const tooltipBody = resolvedTheme === "dark" ? "#334155" : "#e2e8f0";
  const lineOptions: ChartOptions<"line"> = { responsive: true, maintainAspectRatio: false, interaction: { intersect: false, mode: "index" }, plugins: { legend: { display: false }, tooltip: { backgroundColor: theme.tooltip, titleColor: tooltipText, bodyColor: tooltipBody, padding: 10, displayColors: false } }, scales: { x: { grid: { display: false }, ticks: { color: theme.text, font: { size: 11 } }, border: { display: false } }, y: { beginAtZero: true, grid: { color: theme.grid }, ticks: { color: theme.text, font: { size: 11 }, callback: (value) => `฿${Number(value) / 1000}k` }, border: { display: false } } } };
  const barOptions: ChartOptions<"bar"> = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { backgroundColor: theme.tooltip, titleColor: tooltipText, bodyColor: tooltipBody } }, scales: { x: { grid: { display: false }, ticks: { color: theme.text, font: { size: 11 } }, border: { display: false } }, y: { beginAtZero: true, max: 100, grid: { color: theme.grid }, ticks: { color: theme.text, font: { size: 11 }, callback: (value) => `${value}%` }, border: { display: false } } } };
  return <section aria-label="กราฟสรุป" className="grid gap-3 xl:grid-cols-4"><Card className="xl:col-span-2"><CardHeader><CardTitle>แนวโน้มยอดขาย</CardTitle><CardDescription>ยอดขายรายวันใน 7 วันที่ผ่านมา</CardDescription></CardHeader><CardContent><div className="h-52"><Line options={lineOptions} data={{ labels: ["จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส.", "อา."], datasets: [{ data: [42000, 51000, 47000, 68000, 72000, 64000, 81000], borderColor: chartColors.primary, backgroundColor: "rgba(14, 116, 144, 0.1)", pointBackgroundColor: chartColors.primary, pointRadius: 2, pointHoverRadius: 4, borderWidth: 2, fill: true, tension: 0.3 }] }} /></div></CardContent></Card><Card><CardHeader><CardTitle>เงินสดเทียบกับเครดิต</CardTitle><CardDescription>สัดส่วนยอดขายตามเงื่อนไขชำระ</CardDescription></CardHeader><CardContent><div className="mx-auto h-52 max-w-60"><Doughnut options={{ responsive: true, maintainAspectRatio: false, cutout: "70%", plugins: { legend: { position: "bottom", labels: { boxWidth: 9, boxHeight: 9, color: theme.text, padding: 14, font: { size: 11 } } }, tooltip: { backgroundColor: theme.tooltip, titleColor: tooltipText, bodyColor: tooltipBody } } }} data={{ labels: ["เงินสด", "เครดิต"], datasets: [{ data: [62, 38], backgroundColor: [chartColors.success, chartColors.warning], borderWidth: 0, spacing: 2 }] }} /></div></CardContent></Card><Card><CardHeader><CardTitle>ค้าปลีกเทียบกับค้าส่ง</CardTitle><CardDescription>สัดส่วนยอดขายตามกลุ่มลูกค้า</CardDescription></CardHeader><CardContent><div className="h-52"><Bar options={barOptions} data={{ labels: ["ค้าปลีก", "ค้าส่ง"], datasets: [{ data: [44, 56], backgroundColor: [chartColors.primary, chartColors.muted], borderRadius: 3, maxBarThickness: 44 }] }} /></div></CardContent></Card></section>;
}
