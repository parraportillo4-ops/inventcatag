import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      order: {
        include: {
          items: {
            include: {
              product: { select: { name: true } },
            },
          },
        },
      },
    },
  });

  if (!invoice || invoice.paymentMethod !== "EFECTIVO") {
    return NextResponse.json({ error: "Factura no encontrada" }, { status: 404 });
  }

  return NextResponse.json({
    invoice: {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      issuedAt: invoice.issuedAt,
      subtotal: invoice.subtotal.toString(),
      taxEnabled: invoice.taxEnabled,
      taxRate: invoice.taxRate.toString(),
      taxAmount: invoice.taxAmount.toString(),
      total: invoice.total.toString(),
      paymentMethod: invoice.paymentMethod,
      customer: {
        name: invoice.order.customerName,
        email: invoice.order.email,
        phone: invoice.order.phone,
        address: invoice.order.address,
      },
      orderNumber: invoice.order.orderNumber,
      items: invoice.order.items.map((item) => ({
        id: item.id,
        name: item.product.name,
        quantity: item.quantity,
        unitPrice: item.priceSnapshot.toString(),
        lineTotal: item.priceSnapshot.mul(item.quantity).toString(),
      })),
    },
  });
}
