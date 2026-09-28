import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  productId: z.string(),
  authorName: z.string().min(2),
  email: z.union([z.string().email(), z.literal("")]).optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(5),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const data = schema.parse(json);
    const product = await prisma.product.findFirst({
      where: { id: data.productId, active: true, deletedAt: null },
    });
    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }
    await prisma.review.create({
      data: {
        productId: data.productId,
        authorName: data.authorName,
        email: data.email || null,
        rating: data.rating,
        comment: data.comment,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
