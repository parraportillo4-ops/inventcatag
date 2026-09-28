"use client";

import { useCart } from "@/context/CartContext";

type Props = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  stock: number;
  image: string | null;
};

export function AddToCartButton({ productId, slug, name, price, stock, image }: Props) {
  const { add } = useCart();

  if (stock <= 0) {
    return (
      <button
        type="button"
        disabled
        className="w-full cursor-not-allowed rounded-xl bg-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-500"
      >
        Sin disponibilidad
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() =>
        add({
          productId,
          slug,
          name,
          price,
          stock,
          image,
          quantity: 1,
        })
      }
      className="w-full rounded-xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-500"
    >
      Añadir al carrito
    </button>
  );
}
