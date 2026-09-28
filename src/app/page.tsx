import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";

export default async function HomePage() {
  const now = new Date();

  const [promotions, categories, featured] = await Promise.all([
    prisma.promotion.findMany({
      where: {
        active: true,
        startsAt: { lte: now },
        endsAt: { gte: now },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.product.findMany({
      where: { active: true, deletedAt: null, stock: { gt: 0 } },
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
      orderBy: { updatedAt: "desc" },
      take: 8,
    }),
  ]);

  return (
    <div className="pb-16">
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 text-white">
        <div className="absolute inset-0 opacity-20">
          <Image
            src="https://images.unsplash.com/photo-1556656793-08538906a9f8?w=1600&q=80"
            alt=""
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-24">
          <p className="text-sm font-semibold uppercase tracking-widest text-orange-100">
            Cereté · tecnología al alcance
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl font-bold leading-tight md:text-5xl">
            Tu santuario de accesorios y equipos móviles
          </h1>
          <p className="mt-4 max-w-xl text-lg text-orange-50">
            Explora el catálogo, aprovecha promociones y compra con métodos de pago
            electrónicos. Diseño pensado para móvil, como pidieron nuestros clientes.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/catalogo"
              className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-orange-700 shadow hover:bg-orange-50"
            >
              Ver catálogo
            </Link>
            <Link
              href="/contacto"
              className="rounded-xl border border-white/40 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              Contactar
            </Link>
          </div>
        </div>
      </section>

      {promotions.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-xl font-bold text-zinc-900">Promociones vigentes</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Ofertas con fecha de inicio y fin; las vencidas no se muestran.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {promotions.map((p) => (
              <Link
                key={p.id}
                href={p.linkUrl || "/catalogo"}
                className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md"
              >
                {p.imageUrl && (
                  <div className="relative aspect-[21/9] bg-zinc-100 md:aspect-[2.4/1]">
                    <Image
                      src={p.imageUrl}
                      alt={p.title}
                      fill
                      className="object-cover transition group-hover:scale-[1.02]"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-zinc-900">{p.title}</h3>
                  {p.subtitle && (
                    <p className="mt-1 text-sm text-zinc-600">{p.subtitle}</p>
                  )}
                  {p.discountPercent != null && (
                    <span className="mt-2 inline-block rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-800">
                      -{p.discountPercent}% referencia
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 py-8">
        <h2 className="text-xl font-bold text-zinc-900">Categorías</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/catalogo"
            className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
          >
            Todas
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/catalogo?categoria=${c.slug}`}
              className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:border-orange-300 hover:bg-orange-50"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-zinc-900">Destacados</h2>
            <p className="mt-1 text-sm text-zinc-600">
              Productos con stock disponible — inventario en tiempo real en la ficha.
            </p>
          </div>
          <Link
            href="/catalogo"
            className="text-sm font-semibold text-orange-600 hover:underline"
          >
            Ver todo
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {featured.map((p) => (
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
        {featured.length === 0 && (
          <p className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center text-zinc-500">
            Aún no hay productos. Ejecuta el seed o crea datos desde el panel admin.
          </p>
        )}
      </section>
    </div>
  );
}
