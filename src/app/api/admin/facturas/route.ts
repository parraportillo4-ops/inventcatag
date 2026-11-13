import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function GET(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const params = request.nextUrl.searchParams;
  const from = params.get("from");
  const to = params.get("to");
  const issuedAt: { gte?: Date; lt?: Date } = {};

  if (from) {
    const start = new Date(`${from}T00:00:00`);
    if (Number.isNaN(start.getTime())) {
      return NextResponse.json({ error: "Fecha inicial inválida" }, { status: 400 });
    }
    issuedAt.gte = start;
  }
  if (to) {
    const end = new Date(`${to}T00:00:00`);
    if (Number.isNaN(end.getTime())) {
      return NextResponse.json({ error: "Fecha final inválida" }, { status: 400 });
    }
    end.setDate(end.getDate() + 1);
    issuedAt.lt = end;
  }
  if (from && to && from > to) {
    return NextResponse.json({ error: "El periodo de fechas no es válido" }, { status: 400 });
  }

  const invoices = await prisma.invoice.findMany({
    where: {
      paymentMethod: "EFECTIVO",
      ...(from || to ? { issuedAt } : {}),
    },
    include: {
      order: {
        select: { id: true, orderNumber: true, customerName: true, email: true, phone: true },
      },
    },
    orderBy: { issuedAt: "desc" },
  });

  return NextResponse.json({
    invoices: invoices.map((invoice) => ({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      issuedAt: invoice.issuedAt,
      customerName: invoice.order.customerName,
      orderNumber: invoice.order.orderNumber,
      subtotal: invoice.subtotal.toString(),
      taxEnabled: invoice.taxEnabled,
      taxRate: invoice.taxRate.toString(),
      taxAmount: invoice.taxAmount.toString(),
      total: invoice.total.toString(),
      paymentMethod: invoice.paymentMethod,
    })),
  });
}
