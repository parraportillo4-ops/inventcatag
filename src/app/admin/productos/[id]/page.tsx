import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductoForm } from "@/components/admin/ProductoForm";

type Props = { params: Promise<{ id: string }> };

export default async function EditarProductoPage({ params }: Props) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });
  if (!product) notFound();

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-zinc-900">Editar producto</h1>
      <ProductoForm
        categories={categories}
        product={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          brand: product.brand,
          description: product.description,
          characteristics: product.characteristics,
          price: Number(product.price),
          stock: product.stock,
          categoryId: product.categoryId,
          active: product.active,
          imageUrls: product.images.map((i) => i.url),
        }}
      />
    </div>
  );
}
