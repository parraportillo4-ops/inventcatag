import { prisma } from "@/lib/prisma";
import { ProductoForm } from "@/components/admin/ProductoForm";

export default async function NuevoProductoPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-zinc-900">Nuevo producto</h1>
      <ProductoForm categories={categories} />
    </div>
  );
}
