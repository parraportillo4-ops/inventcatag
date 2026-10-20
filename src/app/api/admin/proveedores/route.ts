
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

const supplierSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().max(30).optional(),
  email: z.string().trim().email().optional().or(z.literal("")),
  address: z.string().trim().max(200).optional(),
});

export async function GET() {
  const admin = await requireAdmin();

  if (!admin) {
    return NextResponse.json(
      { error: "No autorizado" },
      { status: 401 }
    );
  }

  const suppliers = await prisma.supplier.findMany({
    orderBy: { name: "asc" },
  });

  return NextResponse.json(suppliers);
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
    const data = supplierSchema.parse(await req.json());

    const supplier = await prisma.supplier.create({
      data: {
        name: data.name,
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
      },
    });

    return NextResponse.json(supplier, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos del proveedor inválidos" },
        { status: 400 }
      );
    }

    console.error(error);

    return NextResponse.json(
      { error: "No se pudo registrar el proveedor" },
      { status: 500 }
    );
  }
}
