import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

const patchSchema = z.object({
  whatsapp: z.string().optional(),
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  tiktok: z.string().optional(),
  email: z.union([z.string().email(), z.literal("")]).optional(),
  address: z.string().optional(),
  mapEmbedUrl: z.string().optional().nullable(),
  aboutHtml: z.string().optional(),
  servicesHtml: z.string().optional(),
});

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const s =
    (await prisma.siteSettings.findUnique({ where: { id: "singleton" } })) ??
    (await prisma.siteSettings.create({
      data: { id: "singleton" },
    }));
  return NextResponse.json(s);
}

export async function PATCH(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const json = await req.json();
    const data = patchSchema.parse(json);
    const scalar = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined)
    );
    const s = await prisma.siteSettings.upsert({
      where: { id: "singleton" },
      update: scalar,
      create: { id: "singleton", ...scalar },
    });
    return NextResponse.json(s);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "No se pudo guardar" }, { status: 400 });
  }
}
