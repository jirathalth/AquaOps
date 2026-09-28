import { systemRepository } from "@/repositories/system.repository";

export async function getSystemHealth() { try { await systemRepository.isDatabaseAvailable(); return { status: "ok" as const, database: "connected" as const }; } catch { return { status: "degraded" as const, database: "unavailable" as const }; } }
