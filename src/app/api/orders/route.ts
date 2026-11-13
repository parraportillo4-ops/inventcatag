
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const schema = z.object({
  customerName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  address: z.string().min(5),
  notes: z.string().optional(),

  paymentMethod: z.literal("EFECTIVO"),

  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().min(1),
      })
    )
    .min(1),
});

function orderNumber() {
  const t = Date.now().toString(36).toUpperCase();
  const r = Math.random().toString(36).slice(2, 7).toUpperCase();

  return `ORD-${t}-${r}`;
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const data = schema.parse(json);

    const result = await prisma.$transaction(async (tx) => {
      let subtotal = new Prisma.Decimal(0);

      const lines: {
        productId: string;
        quantity: number;
        price: Prisma.Decimal;
      }[] = [];

      for (const line of data.items) {
        const product = await tx.product.findFirst({
          where: {
            id: line.productId,
            active: true,
            deletedAt: null,
          },
        });

        if (!product) {
          throw new Error(
            `Producto no disponible: ${line.productId}`
          );
        }

        if (product.stock < line.quantity) {
          throw new Error(
            `Stock insuficiente para: ${product.name}`
          );
        }

        const price = product.price;

        subtotal = subtotal.add(price.mul(line.quantity));

        lines.push({
          productId: product.id,
          quantity: line.quantity,
          price,
        });
      }

      const order = await tx.order.create({
  data: {
    orderNumber: orderNumber(),
    customerName: data.customerName,
    email: data.email,
    phone: data.phone,
    address: data.address,
    notes: data.notes,

    subtotal: subtotal,
    taxAmount: new Prisma.Decimal(0),
    total: subtotal,

    status: "PENDIENTE",
    paymentMethod: "EFECTIVO",

    items: {
      create: lines.map((line) => ({
        productId: line.productId,
        quantity: line.quantity,
        priceSnapshot: line.price,
      })),
    },
  },
});

      //tx.product.update(...) no descontar stock aquí
      // El administrador lo descontará al confirmar el pago.

      return order;
    });

    return NextResponse.json(
      {
        message: "Pedido registrado correctamente. Pendiente de pago en efectivo.",
        orderNumber: result.orderNumber,
      },
      { status: 201 }
    );

  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Datos inválidos",
          details: e.issues,
        },
        { status: 400 }
      );
    }

    console.error("[ERROR PEDIDO]", e);

    const msg =
      e instanceof Error ? e.message : "Error del servidor";

    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}
