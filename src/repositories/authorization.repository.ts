import "server-only";
import { db } from "@/lib/db";

export async function findUserAccess(userId: string) {
  return db.user.findUnique({
    where: { id: userId },
    select: {
      id: true, name: true, email: true, image: true, status: true,
      roles: { where: { role: { isActive: true } }, select: { role: { select: { id: true, code: true, name: true, permissions: { select: { permission: { select: { code: true } } } } } } } },
    },
  });
}
