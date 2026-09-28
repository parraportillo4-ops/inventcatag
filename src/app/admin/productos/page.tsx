import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCOP } from "@/lib/format";

export default async function AdminProductosPage() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-zinc-900">Productos</h1>
        <Link
          href="/admin/productos/nuevo"
          className="rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-500"
        >
          Nuevo producto
        </Link>
      </div>
      <div className="mt-6 overflow-x-auto rounded-xl border border-zinc-200 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50">
            <tr>
              <th className="px-4 py-3 font-semibold">Nombre</th>
              <th className="px-4 py-3 font-semibold">Categoría</th>
              <th className="px-4 py-3 font-semibold">Precio</th>
              <th className="px-4 py-3 font-semibold">Stock</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 font-semibold" />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-zinc-100">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/productos/${p.id}`}
                    className="font-medium text-orange-700 hover:underline"
                  >
                    {p.name}
                  </Link>
                  <div className="text-xs text-zinc-500">{p.slug}</div>
                </td>
                <td className="px-4 py-3">{p.category.name}</td>
                <td className="px-4 py-3">{formatCOP(Number(p.price))}</td>
                <td className="px-4 py-3">{p.stock}</td>
                <td className="px-4 py-3">
                  {p.deletedAt ? (
                    <span className="text-red-600">Eliminado</span>
                  ) : p.active ? (
                    <span className="text-green-700">Activo</span>
                  ) : (
                    <span className="text-zinc-500">Inactivo</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/producto/${p.slug}`}
                    className="text-xs text-zinc-500 hover:text-orange-600"
                    target="_blank"
                  >
                    Ver público
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-zinc-500">
        Eliminación lógica: el producto deja de mostrarse en tienda y conserva historial.
      </p>
    </div>
  );
}
