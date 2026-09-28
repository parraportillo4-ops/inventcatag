import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

const patchSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  brand: z.string().min(1).optional(),
  description: z.string().min(5).optional(),
  characteristics: z.string().min(3).optional(),
  price: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
  categoryId: z.string().optional(),
  active: z.boolean().optional(),
  imageUrls: z.array(z.string().url()).optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Params) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await ctx.params;
  try {
    const json = await req.json();
    const data = patchSchema.parse(json);

    const { imageUrls, ...rest } = data;
    const scalar = Object.fromEntries(
      Object.entries(rest).filter(([, v]) => v !== undefined)
    );

    const product = await prisma.$transaction(async (tx) => {
      if (Object.keys(scalar).length > 0) {
        await tx.product.update({
          where: { id },
          data: scalar,
        });
      }
      const p = await tx.product.findUniqueOrThrow({ where: { id } });
      if (imageUrls) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        if (imageUrls.length > 0) {
          await tx.productImage.createMany({
            data: imageUrls.map((url, i) => ({
              productId: id,
              url,
              sortOrder: i,
              alt: p.name,
            })),
          });
        }
      }
      return p;
    });

    return NextResponse.json(product);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "No se pudo actualizar" }, { status: 400 });
  }
}

export async function DELETE(_req: Request, ctx: Params) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await ctx.params;
  await prisma.product.update({
    where: { id },
    data: { deletedAt: new Date(), active: false },
  });
  return NextResponse.json({ ok: true });
}
