
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

/*api del inventario: la API es el intermediario entre la pantalla y la base de datos.
No queremos que React modifique directamente las tablas ni que una
persona pueda alterar el stock enviando una petición sin autorización.

equireAdmin() comprueba que la petición provenga de una sesión administrativa válida.

GET obtiene los productos y proveedores para mostrarlos en pantalla.

POST recibe el producto, el tipo de movimiento, la cantidad y el motivo.

prisma.$transaction() agrupa el cambio de stock y la creación del movimiento en una misma transacción.

Si una salida supera las existencias, la operación se rechaza.

Se conserva el stock anterior, el nuevo stock y la cantidad del movimiento.*/

const movimientoSchema = z.object({
  productId: z.string().min(1),
  type: z.enum(["ENTRADA", "SALIDA"]),
  quantity: z.number().int().positive(),
  reason: z.string().trim().min(3).max(200),
});

export async function GET() {
  const admin = await requireAdmin();

  if (!admin) {
    return NextResponse.json(
      { error: "No autorizado" },
      { status: 401 }
    );
  }

  const [products, suppliers, movements] = await Promise.all([
    prisma.product.findMany({
      where: { deletedAt: null },
      include: {
        category: true,
        supplier: true,
        brandRef: true,
      },
      orderBy: { name: "asc" },
    }),
    prisma.supplier.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    }),
    prisma.inventoryMovement.findMany({
      include: {
        product: {
          select: { name: true, slug: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  return NextResponse.json({
    products: products.map((p) => ({
      ...p,
      price: Number(p.price),
      costPrice: Number(p.costPrice),
    })),
    suppliers,
    movements: movements.map((m) => ({
      ...m,
      createdAt: m.createdAt.toISOString(),
    })),
  });
}

export async function POST(req: Request) {
  const admin = await requireAdmin();

  if (!admin) {
    return NextResponse.json(
      { error: "No autorizado" },
      { status: 401 }
    );
  }

  try {
    const data = movimientoSchema.parse(await req.json());

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: data.productId },
      });

      if (!product || product.deletedAt || !product.active) {
        throw new Error("PRODUCTO_NO_DISPONIBLE");
      }

      const previousStock = product.stock;

      const newStock =
        data.type === "ENTRADA"
          ? previousStock + data.quantity
          : previousStock - data.quantity;

      if (newStock < 0) {
        throw new Error("STOCK_INSUFICIENTE");
      }

      const updatedProduct = await tx.product.update({
        where: { id: product.id },
        data: { stock: newStock },
      });

      const movement = await tx.inventoryMovement.create({
        data: {
          productId: product.id,
          type: data.type,
          quantity: data.quantity,
          previousStock,
          newStock,
          reason: data.reason,
          referenceId: `ADMIN:${admin.id}`,
        },
      });

      return { updatedProduct, movement };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos" },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      if (error.message === "STOCK_INSUFICIENTE") {
        return NextResponse.json(
          { error: "No hay suficientes unidades en stock" },
          { status: 409 }
        );
      }

      if (error.message === "PRODUCTO_NO_DISPONIBLE") {
        return NextResponse.json(
          { error: "Producto no disponible" },
          { status: 404 }
        );
      }
    }

    console.error(error);

    return NextResponse.json(
      { error: "No se pudo registrar el movimiento" },
      { status: 500 }
    );

    

  }
}
