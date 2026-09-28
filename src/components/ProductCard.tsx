import Image from "next/image";
import Link from "next/link";
import { formatCOP, stockLabel } from "@/lib/format";

export type ProductCardProps = {
  slug: string;
  name: string;
  brand: string;
  price: number;
  stock: number;
  imageUrl: string | null;
};

export function ProductCard({
  slug,
  name,
  brand,
  price,
  stock,
  imageUrl,
}: ProductCardProps) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md">
      <Link href={`/producto/${slug}`} className="relative aspect-square bg-zinc-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover transition group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-400">
            Sin imagen
          </div>
        )}
        {stock <= 0 && (
          <span className="absolute left-2 top-2 rounded bg-zinc-900/80 px-2 py-0.5 text-xs text-white">
            Sin disponibilidad
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-orange-600">
          {brand}
        </p>
        <Link href={`/producto/${slug}`}>
          <h3 className="mt-1 line-clamp-2 font-semibold text-zinc-900 hover:text-orange-700">
            {name}
          </h3>
        </Link>
        <p className="mt-2 text-lg font-bold text-zinc-900">{formatCOP(price)}</p>
        <p className="mt-1 text-xs text-zinc-500">{stockLabel(stock)}</p>
        <Link
          href={`/producto/${slug}`}
          className="mt-3 inline-flex items-center justify-center rounded-xl bg-orange-600 px-3 py-2 text-center text-sm font-semibold text-white transition hover:bg-orange-500"
        >
          Ver detalle
        </Link>
      </div>
    </article>
  );
}
