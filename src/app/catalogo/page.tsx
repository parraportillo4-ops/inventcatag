import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";

type Props = {
  searchParams: Promise<{ categoria?: string; q?: string }>;
};

export default async function CatalogoPage({ searchParams }: Props) {
  const { categoria, q } = await searchParams;
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  const where = {
    active: true,
    deletedAt: null,
    ...(categoria
      ? { category: { slug: categoria } }
      : {}),
    ...(q?.trim()
      ? {
          OR: [
            { name: { contains: q.trim() } },
            { brand: { contains: q.trim() } },
            { description: { contains: q.trim() } },
          ],
        }
      : {}),
  };

  const products = await prisma.product.findMany({
    where,
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 }, category: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-zinc-900">Catálogo</h1>
      <p className="mt-1 text-sm text-zinc-600">
        Filtra por categoría o busca por nombre o palabra clave (búsqueda parcial).
      </p>

      <form className="mt-6 flex flex-col gap-3 md:flex-row md:items-end" action="/catalogo" method="get">
        <div className="flex-1">
          <label htmlFor="q" className="text-xs font-medium text-zinc-500">
            Buscar
          </label>
          <input
            id="q"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Ej. cargador, Samsung, cable..."
            className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-orange-500/30 focus:ring-2"
          />
        </div>
        <div className="md:w-56">
          <label htmlFor="categoria" className="text-xs font-medium text-zinc-500">
            Categoría
          </label>
          <select
            id="categoria"
            name="categoria"
            defaultValue={categoria ?? ""}
            className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-orange-500/30 focus:ring-2"
          >
            <option value="">Todas</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-500"
        >
          Aplicar
        </button>
        <Link
          href="/catalogo"
          className="rounded-xl border border-zinc-200 px-5 py-2.5 text-center text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Limpiar
        </Link>
      </form>

      <p className="mt-4 text-sm text-zinc-600">
        {products.length} resultado{products.length === 1 ? "" : "s"}
        {categoria && (
          <>
            {" "}
            en categoría{" "}
            <strong>
              {categories.find((c) => c.slug === categoria)?.name ?? categoria}
            </strong>
          </>
        )}
        {q?.trim() && (
          <>
            {" "}
            para «<strong>{q.trim()}</strong>»
          </>
        )}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            slug={p.slug}
            name={p.name}
            brand={p.brand}
            price={Number(p.price)}
            stock={p.stock}
            imageUrl={p.images[0]?.url ?? null}
          />
        ))}
      </div>

      {products.length === 0 && (
        <p className="mt-8 rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center text-zinc-500">
          No hay productos con estos filtros.
        </p>
      )}
    </div>
  );
}
