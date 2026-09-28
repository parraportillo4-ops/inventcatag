import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

const schema = z.object({
  title: z.string().min(2),
  subtitle: z.string().optional(),
  imageUrl: z.union([z.string().url(), z.literal("")]).optional(),
  linkUrl: z.string().optional(),
  discountPercent: z.number().int().min(0).max(100).optional(),
  startsAt: z.string().min(1),
  endsAt: z.string().min(1),
  productId: z.string().optional().nullable(),
});

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const list = await prisma.promotion.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const json = await req.json();
    const data = schema.parse(json);
    const promo = await prisma.promotion.create({
      data: {
        title: data.title,
        subtitle: data.subtitle,
        imageUrl: data.imageUrl || null,
        linkUrl: data.linkUrl || null,
        discountPercent: data.discountPercent ?? null,
        startsAt: new Date(data.startsAt),
        endsAt: new Date(data.endsAt),
        productId: data.productId || null,
        active: true,
      },
    });
    return NextResponse.json(promo);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Error al crear" }, { status: 400 });
  }
}
