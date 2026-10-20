
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

const updateSchema = z.object({
  costPrice: z.number().min(0).optional(),
  price: z.number().positive().optional(),
  minStock: z.number().int().min(0).optional(),
  supplierId: z.string().nullable().optional(),
});

type Context = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: Request, ctx: Context) {
  const admin = await requireAdmin();

  if (!admin) {
    return NextResponse.json(
      { error: "No autorizado" },
      { status: 401 }
    );
  }

  try {
    const { id } = await ctx.params;
    const data = updateSchema.parse(await req.json());

    const product = await prisma.product.findFirst({
      where: { id, deletedAt: null },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    if (data.supplierId) {
      const supplier = await prisma.supplier.findFirst({
        where: { id: data.supplierId, active: true },
      });

      if (!supplier) {
        return NextResponse.json(
          { error: "Proveedor no válido" },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data,
      include: { supplier: true },
    });

    return NextResponse.json({
      ...updated,
      price: Number(updated.price),
      costPrice: Number(updated.costPrice),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Revisa los valores enviados" },
        { status: 400 }
      );
    }

    console.error(error);

    return NextResponse.json(
      { error: "No se pudo actualizar el inventario" },
      { status: 500 }
    );
  }
}
