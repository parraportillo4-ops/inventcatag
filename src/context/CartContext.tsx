"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CartLine = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string | null;
  quantity: number;
  stock: number;
};

type CartApi = {
  lines: CartLine[];
  ready: boolean;
  add: (line: Omit<CartLine, "quantity"> & { quantity?: number }) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, quantity: number) => void;
  clear: () => void;
  total: number;
  count: number;
};

const KEY = "santuario_cart_v1";

const CartContext = createContext<CartApi | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setLines(JSON.parse(raw) as CartLine[]);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(KEY, JSON.stringify(lines));
  }, [lines, ready]);

  const add = useCallback(
    (line: Omit<CartLine, "quantity"> & { quantity?: number }) => {
      const q = line.quantity ?? 1;
      setLines((prev) => {
        const idx = prev.findIndex((l) => l.productId === line.productId);
        if (idx === -1) {
          const quantity = Math.min(Math.max(1, q), Math.max(0, line.stock));
          if (quantity < 1) return prev;
          return [...prev, { ...line, quantity }];
        }
        const next = [...prev];
        const merged = Math.min(next[idx].quantity + q, line.stock);
        next[idx] = { ...next[idx], quantity: merged };
        return next;
      });
    },
    []
  );

  const remove = useCallback((productId: string) => {
    setLines((prev) => prev.filter((l) => l.productId !== productId));
  }, []);

  const setQty = useCallback((productId: string, quantity: number) => {
    setLines((prev) =>
      prev
        .map((l) =>
          l.productId === productId
            ? {
                ...l,
                quantity: Math.max(0, Math.min(quantity, l.stock)),
              }
            : l
        )
        .filter((l) => l.quantity > 0)
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const { total, count } = useMemo(() => {
    const total = lines.reduce((s, l) => s + l.price * l.quantity, 0);
    const count = lines.reduce((s, l) => s + l.quantity, 0);
    return { total, count };
  }, [lines]);

  const value = useMemo(
    () => ({
      lines,
      ready,
      add,
      remove,
      setQty,
      clear,
      total,
      count,
    }),
    [lines, ready, add, remove, setQty, clear, total, count]
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
}
