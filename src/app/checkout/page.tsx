"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatCOP } from "@/lib/format";

const PAYMENT_METHODS = [
  { id: "PSE", label: "PSE (simulado)" },
  { id: "MERCADOPAGO", label: "Mercado Pago (simulado)" },
  { id: "ADDI", label: "Addi (simulado)" },
] as const;

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, ready, total, clear } = useCart();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (lines.length === 0) return;
    setPending(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const paymentMethod = String(fd.get("paymentMethod"));
    const body = {
      customerName: String(fd.get("customerName") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      phone: String(fd.get("phone") ?? "").trim(),
      address: String(fd.get("address") ?? "").trim(),
      notes: String(fd.get("notes") ?? "").trim() || undefined,
      paymentMethod,
      items: lines.map((l) => ({
        productId: l.productId,
        quantity: l.quantity,
      })),
    };
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "No se pudo completar el pedido");
      clear();
      router.push(`/pedido/${data.orderNumber}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setPending(false);
    }
  }

  if (!ready) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center text-zinc-500">
        Cargando…
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-zinc-600">No hay productos en el carrito.</p>
        <Link href="/catalogo" className="mt-4 inline-block font-semibold text-orange-600">
          Ver catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="text-2xl font-bold text-zinc-900">Checkout</h1>
      <p className="mt-1 text-sm text-zinc-600">
        Pagos PSE, Mercado Pago y Addi en modo demostración: no se cobra en tarjeta; se
        registra el pedido y se simula confirmación. En producción integra cada SDK.
      </p>

      <ul className="mt-4 space-y-2 rounded-xl border border-zinc-200 bg-white p-4 text-sm">
        {lines.map((l) => (
          <li key={l.productId} className="flex justify-between gap-2">
            <span className="truncate">
              {l.name} × {l.quantity}
            </span>
            <span className="shrink-0 font-medium">
              {formatCOP(l.price * l.quantity)}
            </span>
          </li>
        ))}
        <li className="flex justify-between border-t border-zinc-200 pt-2 font-bold">
          <span>Total</span>
          <span>{formatCOP(total)}</span>
        </li>
      </ul>

      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <div>
          <label className="text-xs font-medium text-zinc-500">Nombre completo</label>
          <input
            name="customerName"
            required
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-500">Correo (comprobante)</label>
          <input
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-500">Teléfono</label>
          <input
            name="phone"
            required
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-500">Dirección de entrega</label>
          <textarea
            name="address"
            required
            rows={2}
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-500">Notas (opcional)</label>
          <textarea
            name="notes"
            rows={2}
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          />
        </div>
        <fieldset>
          <legend className="text-xs font-medium text-zinc-500">Método de pago</legend>
          <div className="mt-2 space-y-2">
            {PAYMENT_METHODS.map((m) => (
              <label
                key={m.id}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={m.id}
                  defaultChecked={m.id === "PSE"}
                  required
                />
                {m.label}
              </label>
            ))}
          </div>
        </fieldset>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-orange-600 py-3 text-sm font-semibold text-white hover:bg-orange-500 disabled:opacity-60"
        >
          {pending ? "Procesando…" : "Confirmar pedido (demo)"}
        </button>
      </form>
    </div>
  );
}
