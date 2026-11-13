
import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  customerName: z.string().trim().min(2, "Nombre inválido"),
  email: z.string().trim().email("Correo inválido"),
  phone: z.string().trim().min(7, "Teléfono inválido"),
  address: z.string().trim().min(5, "Dirección inválida"),
  notes: z.string().optional(),
  paymentMethod: z.literal("EFECTIVO"),
  items: z.array(
    z.object({
      productId: z.string().min(1),
      quantity: z.number().int().min(1),
    })
  ).min(1),
});

function generateOrderNumber() {
  return `ORD-${Date.now()}-${randomBytes(3)
    .toString("hex").toUpperCase()}`;
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const validation = schema.safeParse(json);

    if (!validation.success) {
      return NextResponse.json({
        error: "Datos inválidos",
        details: validation.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      }, { status: 400 });
    }

    const data = validation.data;

    // Unificar productos repetidos.
    const quantities = new Map<string, number>();

    for (const item of data.items) {
      quantities.set(
        item.productId,
        (quantities.get(item.productId) ?? 0) + item.quantity
      );
    }

    const result = await prisma.$transaction(async (tx) => {

      // Obtener configuración del IVA.
      const taxSetting = await tx.taxSetting.findUnique({
        where: { id: "singleton" },
      });

      const taxEnabled = taxSetting?.enabled ?? false;
      const taxRate = new Prisma.Decimal(
        taxSetting?.rate ?? 19
      );

      if (
        !taxRate.isFinite() ||
        taxRate.isNegative() ||
        taxRate.greaterThan(100)
      ) {
        throw new Error("IVA_CONFIG_INVALIDA");
      }

      let subtotal = new Prisma.Decimal(0);

      const orderItems = [];

      // Consultar y validar productos directamente en la BD.
      for (const [productId, quantity] of quantities) {

        const product = await tx.product.findFirst({
          where: {
            id: productId,
            active: true,
            deletedAt: null,
          },
        });

        if (!product) {
          throw new Error("PRODUCTO_NO_DISPONIBLE");
        }

        if (product.stock < quantity) {
          throw new Error(`STOCK:${product.name}`);
        }

        const price = product.price;

        subtotal = subtotal.add(
          price.mul(quantity)
        );

        orderItems.push({
          productId: product.id,
          quantity,
          priceSnapshot: price,
        });
      }

      // Calcular IVA.
      const taxAmount = taxEnabled
        ? subtotal.mul(taxRate).div(100)
        : new Prisma.Decimal(0);

      const total = subtotal.add(taxAmount);

      // Crear pedido pendiente.
      const order = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),

          customerName: data.customerName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          notes: data.notes || null,

          subtotal,
          taxAmount,
          total,

          taxEnabled,
          taxRate,

          status: "PENDIENTE",
          paymentMethod: "EFECTIVO",

          items: {
            create: orderItems,
          },
        },
      });

      return order;
    });

    return NextResponse.json({
      success: true,
      message: "Pedido registrado correctamente",
      orderNumber: result.orderNumber,
      status: result.status,
      paymentMethod: result.paymentMethod,
      total: result.total.toString(),
    }, { status: 201 });

  } catch (error) {
    console.error("[ERROR CHECKOUT]", error);

    if (error instanceof Error) {

      if (error.message.startsWith("STOCK:")) {
        return NextResponse.json({
          error: `Stock insuficiente para ${error.message.split(":")[1]}`,
        }, { status: 409 });
      }

      if (error.message === "PRODUCTO_NO_DISPONIBLE") {
        return NextResponse.json({
          error: "Uno de los productos ya no está disponible",
        }, { status: 400 });
      }

      if (error.message === "IVA_CONFIG_INVALIDA") {
        return NextResponse.json({
          error: "La configuración del IVA no es válida",
        }, { status: 400 });
      }
    }

    return NextResponse.json({
      error: "No fue posible registrar el pedido",
    }, { status: 500 });
  }
}
