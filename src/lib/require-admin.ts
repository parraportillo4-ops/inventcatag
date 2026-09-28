import { getAdminIdFromCookies } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function requireAdmin() {
  const id = await getAdminIdFromCookies();
  if (!id) return null;
  return prisma.adminUser.findUnique({ where: { id } });
}
