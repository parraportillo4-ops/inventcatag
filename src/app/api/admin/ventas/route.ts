import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

// GET: consultar productos, ventas y configuración del IVA
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin();

    if (!auth) {
      return NextResponse.json(
        { error: "No autorizado. Inicie sesión como administrador." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);

    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const dateFilter: Prisma.DateTimeFilter = {};

    if (from) {
      const startDate = new Date(`${from}T00:00:00`);

      if (Number.isNaN(startDate.getTime())) {
        return NextResponse.json(
          { error: "Fecha inicial inválida" },
          { status: 400 }
        );
      }

      dateFilter.gte = startDate;
    }

    if (to) {
      const endDate = new Date(`${to}T00:00:00`);

      if (Number.isNaN(endDate.getTime())) {
        return NextResponse.json(
          { error: "Fecha final inválida" },
          { status: 400 }
        );
      }

      endDate.setDate(endDate.getDate() + 1);
      dateFilter.lt = endDate;
    }

    if (from && to && from > to) {
      return NextResponse.json(
        { error: "El periodo de fechas no es válido" },
        { status: 400 }
      );
    }

    const [products, orders, taxSetting] = await Promise.all([
      // Consultar todos los productos activos,
      // incluso los que tienen stock cero.
      prisma.product.findMany({
        where: {
          active: true,
          deletedAt: null,
        },
        select: {
          id: true,
          name: true,
          price: true,
          stock: true,
        },
        orderBy: {
          name: "asc",
        },
      }),

      prisma.order.findMany({
        where: {
          ...(from || to
            ? { createdAt: dateFilter }
            : {}),
        },
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          subtotal: true,
          taxAmount: true,
          total: true,
          status: true,
          paymentMethod: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.taxSetting.findUnique({
        where: { id: "singleton" },
      }),
    ]);

    const paidOrderIds = orders
      .filter((order) => order.status === "PAGADO")
      .map((order) => order.id);

    const unitsSold = await prisma.orderItem.aggregate({
      where: {
        orderId: {
          in: paidOrderIds,
        },
      },
      _sum: {
        quantity: true,
      },
    });

    const totalUnitsSold = unitsSold._sum.quantity ?? 0;

    return NextResponse.json({
      products: products.map((product) => ({
        ...product,
        price: product.price.toString(),
      })),

      orders: orders.map((order) => ({
        ...order,
        subtotal: order.subtotal.toString(),
        taxAmount: order.taxAmount.toString(),
        total: order.total.toString(),
      })),

      tax: {
        enabled: taxSetting?.enabled ?? false,
        rate: taxSetting?.rate.toString() ?? "19",
      },

      totalUnitsSold,
    });

  } catch (error) {
    console.error("Error consultando ventas:", error);

    return NextResponse.json(
      { error: "No fue posible consultar las ventas" },
      { status: 500 }
    );
  }
}


// POST: registrar una venta presencial en efectivo
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin();

    if (!auth) {
      return NextResponse.json(
        { error: "No autorizado. Inicie sesión como administrador." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      customerName,
      email,
      phone,
      address,
      notes,
      items,
    } = body;

    // Validar datos del cliente
    if (
      typeof customerName !== "string" ||
      !customerName.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof phone !== "string" ||
      !phone.trim() ||
      typeof address !== "string" ||
      !address.trim()
    ) {
      return NextResponse.json(
        { error: "Complete los datos del cliente" },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Debe agregar al menos un producto" },
        { status: 400 }
      );
    }

    // Unificar productos repetidos
    const quantities = new Map<string, number>();

    for (const item of items) {
      if (
        typeof item.productId !== "string" ||
        !Number.isSafeInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        return NextResponse.json(
          { error: "Los productos o cantidades no son válidos" },
          { status: 400 }
        );
      }

      const totalQuantity =
        (quantities.get(item.productId) ?? 0) + item.quantity;

      if (!Number.isSafeInteger(totalQuantity)) {
        return NextResponse.json(
          { error: "Cantidad de productos no válida" },
          { status: 400 }
        );
      }

      quantities.set(item.productId, totalQuantity);
    }

    // Ejecutar toda la operación en una transacción
    const result = await prisma.$transaction(async (tx) => {

      // Obtener configuración del IVA
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

      const productIds = Array.from(quantities.keys());

      // Consultar productos
      const products = await tx.product.findMany({
        where: {
          id: { in: productIds },
          active: true,
          deletedAt: null,
        },
      });

      if (products.length !== productIds.length) {
        throw new Error("PRODUCTO_NO_DISPONIBLE");
      }

      const productMap = new Map(
        products.map((product) => [product.id, product])
      );

      let subtotal = new Prisma.Decimal(0);

      // Calcular subtotal y validar existencias
      for (const [productId, quantity] of quantities) {
        const product = productMap.get(productId);

        if (!product) {
          throw new Error("PRODUCTO_NO_DISPONIBLE");
        }

        if (product.stock < quantity) {
          throw new Error(
            `STOCK_INSUFICIENTE:${product.name}`
          );
        }

        const lineTotal = product.price.mul(quantity);

        subtotal = subtotal.add(lineTotal);
      }

      // Calcular IVA y total
      const taxAmount = taxEnabled
        ? subtotal.mul(taxRate).div(100)
        : new Prisma.Decimal(0);

      const total = subtotal.add(taxAmount);

      const orderNumber =
        `VEN-${Date.now()}-${randomBytes(3)
          .toString("hex")
          .toUpperCase()}`;

      // 1. Crear venta
      const order = await tx.order.create({
        data: {
          orderNumber,
          customerName: customerName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          address: address.trim(),
          notes:
            typeof notes === "string"
              ? notes.trim()
              : null,

          subtotal,
          taxAmount,
          total,

          status: "PAGADO",
          paymentMethod: "EFECTIVO",
        },
      });

      // 2. Registrar detalles y descontar inventario
      for (const [productId, quantity] of quantities) {
        const product = productMap.get(productId)!;

        const update = await tx.product.updateMany({
          where: {
            id: productId,
            active: true,
            stock: { gte: quantity },
          },
          data: {
            stock: { decrement: quantity },
          },
        });

        if (update.count !== 1) {
          throw new Error(
            `STOCK_INSUFICIENTE:${product.name}`
          );
        }

        const updatedProduct =
          await tx.product.findUniqueOrThrow({
            where: { id: productId },
            select: { stock: true },
          });

        const newStock = updatedProduct.stock;

        // Guardar detalle de venta
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId,
            quantity,
            priceSnapshot: product.price,
          },
        });

        // Registrar movimiento de inventario
        await tx.inventoryMovement.create({
          data: {
            productId,
            type: "SALIDA",
            quantity,
            previousStock: newStock + quantity,
            newStock,
            reason: "VENTA EN EFECTIVO",
            referenceId: order.id,
          },
        });
      }

      // 3. Generar factura
      const invoiceNumber =
        `FAC-${Date.now()}-${randomBytes(3)
          .toString("hex")
          .toUpperCase()}`;

      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          orderId: order.id,
          subtotal,
          taxEnabled,
          taxRate,
          taxAmount,
          total,
          paymentMethod: "EFECTIVO",
        },
      });

      return {
        order,
        invoice,
      };
    });

    return NextResponse.json(
      {
        message: "Venta registrada correctamente",

        order: {
          id: result.order.id,
          orderNumber: result.order.orderNumber,
          total: result.order.total.toString(),
          status: result.order.status,
        },

        invoice: {
          id: result.invoice.id,
          invoiceNumber: result.invoice.invoiceNumber,
        },
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error registrando venta:", error);

    if (error instanceof Error) {
      if (error.message.startsWith("STOCK_INSUFICIENTE:")) {
        return NextResponse.json(
          {
            error: `Stock insuficiente para ${error.message.split(":")[1]}`,
          },
          { status: 409 }
        );
      }

      if (error.message === "PRODUCTO_NO_DISPONIBLE") {
        return NextResponse.json(
          { error: "Uno de los productos no está disponible" },
          { status: 400 }
        );
      }

      if (error.message === "IVA_CONFIG_INVALIDA") {
        return NextResponse.json(
          { error: "La configuración del IVA no es válida" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "No fue posible registrar la venta" },
      { status: 500 }
    );
  }
}