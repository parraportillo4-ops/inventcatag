import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  productId: z.string().min(1),
  orderNumber: z.string().trim().min(1),
  authorName: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(150),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(5).max(1000),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const data = schema.parse(json);

    // 1. Buscar el pedido
    const order = await prisma.order.findUnique({
      where: {
        orderNumber: data.orderNumber,
      },
      include: {
        items: {
          where: {
            productId: data.productId,
          },
          include: {
            review: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "No encontramos ese pedido." },
        { status: 404 }
      );
    }

    // 2. Comprobar correo electrónico
    if (
      order.email.trim().toLowerCase() !==
      data.email.trim().toLowerCase()
    ) {
      return NextResponse.json(
        { error: "El correo no coincide con el pedido." },
        { status: 403 }
      );
    }

    // 3. Comprobar que el pedido esté pagado
    if (
      order.status !== "PAGADO" ||
      order.paymentMethod !== "EFECTIVO"
    ) {
      return NextResponse.json(
        {
          error:
            "Solo puedes opinar sobre compras pagadas en efectivo.",
        },
        { status: 403 }
      );
    }

    // 4. Comprobar que el producto pertenezca al pedido
    const orderItem = order.items[0];

    if (!orderItem) {
      return NextResponse.json(
        {
          error: "Este producto no aparece en tu pedido.",
        },
        { status: 403 }
      );
    }

    // 5. Evitar reseñas duplicadas
    if (orderItem.review) {
      return NextResponse.json(
        {
          error: "Ya dejaste una reseña sobre este producto en esta compra.",
        },
        { status: 409 }
      );
    }

    // 6. Comprobar que el producto exista
    const product = await prisma.product.findFirst({
      where: {
        id: data.productId,
        active: true,
        deletedAt: null,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Producto no encontrado." },
        { status: 404 }
      );
    }

    // 7. Crear reseña vinculada a la compra real
    const review = await prisma.review.create({
      data: {
        productId: product.id,
        orderItemId: orderItem.id,
        authorName: data.authorName,
        email: data.email.trim().toLowerCase(),
        rating: data.rating,
        comment: data.comment,
        approved: true,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        message: "Reseña registrada correctamente.",
        reviewId: review.id,
      },
      { status: 201 }
    );

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Revisa los datos ingresados." },
        { status: 400 }
      );
    }

    // Evitar duplicados incluso ante solicitudes simultáneas
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Ya existe una reseña para esta compra y producto." },
        { status: 409 }
      );
    }

    console.error("[ERROR REVIEWS]", error);

    return NextResponse.json(
      { error: "Error interno al registrar la reseña." },
      { status: 500 }
    );
  }
}
