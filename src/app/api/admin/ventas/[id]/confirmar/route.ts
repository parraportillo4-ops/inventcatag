import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { randomBytes } from "crypto";

import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";


type Context = {
  params: Promise<{ id: string }>;
};

export async function POST(
  request: Request,
  { params }: Context
) {
  try {
    const auth = await requireAdmin();

    if (!auth) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;

    const result = await prisma.$transaction(async (tx) => {

      // 1. Buscar pedido
      const order = await tx.order.findUnique({
        where: { id },
      });

      if (!order) {
        throw new Error("PEDIDO_NO_ENCONTRADO");
      }

      if (order.status !== "PENDIENTE") {
        throw new Error("PEDIDO_NO_PENDIENTE");
      }

      // 2. Evitar generar otra factura
      const existingInvoice = await tx.invoice.findUnique({
        where: { orderId: id },
      });

      if (existingInvoice) {
        throw new Error("FACTURA_EXISTENTE");
      }

      // 3. Obtener productos del pedido
      const items = await tx.orderItem.findMany({
        where: { orderId: id },
      });

      if (items.length === 0) {
        throw new Error("PEDIDO_SIN_PRODUCTOS");
      }

      // 4. Configuración tributaria ya aplicada al pedido
      const taxEnabled = order.taxEnabled;
      const taxRate = new Prisma.Decimal(order.taxRate);

      if (
        !taxRate.isFinite() ||
        taxRate.isNegative() ||
        taxRate.greaterThan(100)
      ) {
        throw new Error("IVA_CONFIG_INVALIDA");
      }

      // 5. Descontar inventario
      for (const item of items) {

        const update = await tx.product.updateMany({
          where: {
            id: item.productId,
            active: true,
            deletedAt: null,
            stock: { gte: item.quantity },
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        if (update.count !== 1) {
          throw new Error("STOCK_INSUFICIENTE");
        }

        const product = await tx.product.findUniqueOrThrow({
          where: { id: item.productId },
          select: { stock: true },
        });

        await tx.inventoryMovement.create({
          data: {
            productId: item.productId,
            type: "SALIDA",
            quantity: item.quantity,
            previousStock: product.stock + item.quantity,
            newStock: product.stock,
            reason: "PEDIDO PAGADO EN EFECTIVO",
            referenceId: order.id,
          },
        });
      }

      // 6. Actualizar pedido
      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          status: "PAGADO",
          paymentMethod: "EFECTIVO",
        },
      });

      // 7. Crear factura
      const invoiceNumber =
        `FAC-${Date.now()}-${randomBytes(3)
          .toString("hex")
          .toUpperCase()}`;

      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          orderId: order.id,
          subtotal: order.subtotal,
          taxEnabled,
          taxRate,
          taxAmount: order.taxAmount,
          total: order.total,
          paymentMethod: "EFECTIVO",
        },
      });

      return {
        order: updatedOrder,
        invoice,
      };
    });

    return NextResponse.json({
      message: "Pago confirmado correctamente",
      orderNumber: result.order.orderNumber,
      invoiceNumber: result.invoice.invoiceNumber,
    });

  } catch (error) {
    console.error("Error confirmando pedido:", error);

    if (error instanceof Error) {
      const messages: Record<string, string> = {
        PEDIDO_NO_ENCONTRADO: "El pedido no existe",
        PEDIDO_NO_PENDIENTE: "El pedido ya fue procesado",
        FACTURA_EXISTENTE: "El pedido ya tiene una factura",
        PEDIDO_SIN_PRODUCTOS: "El pedido no contiene productos",
        STOCK_INSUFICIENTE: "No existe stock suficiente",
        IVA_CONFIG_INVALIDA: "La configuración del IVA no es válida",
      };

      const message = messages[error.message];

      if (message) {
        return NextResponse.json(
          { error: message },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: "No fue posible confirmar el pago" },
      { status: 500 }
    );
  }
}