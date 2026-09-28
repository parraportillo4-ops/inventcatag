import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCOP, stockLabel } from "@/lib/format";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ReviewForm } from "@/components/ReviewForm";

type Props = { params: Promise<{ slug: string }> };

export default async function ProductoPage({ params }: Props) {
  const { slug } = await params;
  const product = await prisma.product.findFirst({
    where: { slug, active: true, deletedAt: null },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      reviews: { where: { approved: true }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!product) notFound();

  const wa = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  const waDigits = wa?.whatsapp?.replace(/\D/g, "") ?? "";
  const waLink = waDigits
    ? `https://wa.me/${waDigits}?text=${encodeURIComponent(
        `Hola, consulto por: ${product.name}`
      )}`
    : "#";

  const avg =
    product.reviews.length > 0
      ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
      : null;

  const mainImage = product.images[0]?.url ?? null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <nav className="text-sm text-zinc-500">
        <Link href="/" className="hover:text-orange-600">
          Inicio
        </Link>
        <span className="mx-2">/</span>
        <Link href="/catalogo" className="hover:text-orange-600">
          Catálogo
        </Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-800">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-zinc-100">
            {mainImage ? (
              <Image
                src={mainImage}
                alt={product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-zinc-400">
                Sin imagen
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img) => (
                <div
                  key={img.id}
                  className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-zinc-100"
                >
                  <Image
                    src={img.url}
                    alt={img.alt ?? product.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-orange-600">{product.category.name}</p>
          <h1 className="mt-1 text-3xl font-bold text-zinc-900">{product.name}</h1>
          <p className="mt-1 text-sm text-zinc-500">{product.brand}</p>
          <p className="mt-4 text-3xl font-bold">{formatCOP(Number(product.price))}</p>
          <p className="mt-2 text-sm font-medium text-zinc-700">
            Inventario: {stockLabel(product.stock)}
          </p>

          <div className="mt-6 space-y-3">
            <AddToCartButton
              productId={product.id}
              slug={product.slug}
              name={product.name}
              price={Number(product.price)}
              stock={product.stock}
              image={mainImage}
            />
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center rounded-xl border border-green-600 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800 hover:bg-green-100"
            >
              Consultar por WhatsApp
            </a>
          </div>

          <div className="mt-8 border-t border-zinc-200 pt-6">
            <h2 className="font-semibold text-zinc-900">Descripción</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-600">
              {product.description}
            </p>
            <h3 className="mt-4 font-semibold text-zinc-900">Características</h3>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-600">
              {product.characteristics}
            </p>
          </div>
        </div>
      </div>

      <section className="mt-12 border-t border-zinc-200 pt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-zinc-900">Reseñas</h2>
            {avg != null && (
              <p className="mt-1 text-sm text-zinc-600">
                Promedio: <strong>{avg.toFixed(1)}</strong> / 5 ·{" "}
                {product.reviews.length} comentario
                {product.reviews.length === 1 ? "" : "s"}
              </p>
            )}
          </div>
        </div>

        <ul className="mt-6 space-y-4">
          {product.reviews.map((r) => (
            <li
              key={r.id}
              className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-zinc-900">{r.authorName}</span>
                <span className="text-sm text-amber-600">
                  {"★".repeat(r.rating)}
                  {"☆".repeat(5 - r.rating)}
                </span>
              </div>
              <p className="mt-2 text-sm text-zinc-600">{r.comment}</p>
              <p className="mt-2 text-xs text-zinc-400">
                {new Date(r.createdAt).toLocaleDateString("es-CO")}
              </p>
            </li>
          ))}
        </ul>
        {product.reviews.length === 0 && (
          <p className="mt-4 text-sm text-zinc-500">Aún no hay reseñas para este producto.</p>
        )}

        <div className="mt-8 max-w-lg">
          <h3 className="font-semibold text-zinc-900">Deja tu reseña</h3>
          <p className="mt-1 text-xs text-zinc-500">
            Publicación con nombre; el equipo puede moderar contenido inapropiado.
          </p>
          <ReviewForm productId={product.id} />
        </div>
      </section>
    </div>
  );
}
