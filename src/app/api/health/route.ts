import { NextResponse } from "next/server";
import { getSystemHealth } from "@/services/system.service";

export async function GET() { const health = await getSystemHealth(); return NextResponse.json(health, { status: health.status === "ok" ? 200 : 503 }); }
