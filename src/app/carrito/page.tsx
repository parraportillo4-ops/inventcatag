"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatCOP } from "@/lib/format";

export default function CarritoPage() {
  const { lines, ready, setQty, remove, total, count } = useCart();

  if (!ready) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-zinc-500">
        Cargando carrito…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold text-zinc-900">Carrito</h1>
      {lines.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center text-zinc-600">
          Tu carrito está vacío.{" "}
          <Link href="/catalogo" className="font-semibold text-orange-600 hover:underline">
            Ir al catálogo
          </Link>
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {lines.map((l) => (
            <div
              key={l.productId}
              className="flex gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
            >
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                {l.image ? (
                  <Image src={l.image} alt={l.name} fill className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-zinc-400">
                    Sin img
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/producto/${l.slug}`}
                  className="font-semibold text-zinc-900 hover:text-orange-700"
                >
                  {l.name}
                </Link>
                <p className="text-sm text-zinc-600">{formatCOP(l.price)} c/u</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <label className="text-xs text-zinc-500">
                    Cantidad
                    <input
                      type="number"
                      min={1}
                      max={l.stock}
                      value={l.quantity}
                      onChange={(e) =>
                        setQty(l.productId, Number(e.target.value) || 1)
                      }
                      className="ml-2 w-16 rounded border border-zinc-200 px-2 py-1 text-sm"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => remove(l.productId)}
                    className="text-xs font-medium text-red-600 hover:underline"
                  >
                    Quitar
                  </button>
                </div>
              </div>
              <div className="text-right text-sm font-semibold text-zinc-900">
                {formatCOP(l.price * l.quantity)}
              </div>
            </div>
          ))}

          <div className="flex flex-col items-end gap-3 border-t border-zinc-200 pt-4">
            <p className="text-sm text-zinc-600">
              {count} artículo{count === 1 ? "" : "s"}
            </p>
            <p className="text-xl font-bold text-zinc-900">Total: {formatCOP(total)}</p>
            <Link
              href="/checkout"
              className="rounded-xl bg-orange-600 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-500"
            >
              Ir a pagar
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
