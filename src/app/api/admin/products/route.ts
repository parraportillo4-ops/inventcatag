import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

const createSchema = z.object({
  name: z.string().min(2),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  brand: z.string().min(1),
  description: z.string().min(5),
  characteristics: z.string().min(3),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  categoryId: z.string(),
  imageUrls: z.array(z.string().url()).default([]),
});

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const products = await prisma.product.findMany({
    include: { category: true, images: true },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const json = await req.json();
    const data = createSchema.parse(json);
    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        brand: data.brand,
        description: data.description,
        characteristics: data.characteristics,
        price: data.price,
        stock: data.stock,
        categoryId: data.categoryId,
        images: {
          create: data.imageUrls.map((url, i) => ({
            url,
            sortOrder: i,
            alt: data.name,
          })),
        },
      },
    });
    return NextResponse.json(product);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "No se pudo crear (¿slug duplicado?)" }, { status: 400 });
  }
}
