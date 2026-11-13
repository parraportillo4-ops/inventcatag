
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatCOP } from "@/lib/format";

export default function CheckoutPage() {
  const router = useRouter();

  const { lines, ready, total, clear } = useCart();

  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (lines.length === 0 || pending) return;

    setPending(true);
    setError("");

    const fd = new FormData(e.currentTarget);

    const body = {
      customerName: String(
        fd.get("customerName") ?? ""
      ).trim(),

      email: String(
        fd.get("email") ?? ""
      ).trim(),

      phone: String(
        fd.get("phone") ?? ""
      ).trim(),

      address: String(
        fd.get("address") ?? ""
      ).trim(),

      notes: String(
        fd.get("notes") ?? ""
      ).trim(),

      // Único método de pago permitido.
      paymentMethod: "EFECTIVO",

      // Nunca enviar precios ni stock como datos confiables.
      items: lines.map((line) => ({
        productId: line.productId,
        quantity: line.quantity,
      })),
    };

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "No se pudo registrar el pedido"
        );
      }

      clear();

      router.push(`/pedido/${data.orderNumber}`);

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error procesando el pedido"
      );
    } finally {
      setPending(false);
    }
  }

  if (!ready) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        Cargando carrito...
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-zinc-600">
          No hay productos en el carrito.
        </p>

        <Link
          href="/catalogo"
          className="mt-4 inline-block font-semibold text-orange-600"
        >
          Volver al catálogo
        </Link>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">

      <h1 className="text-3xl font-bold">
        Finalizar compra
      </h1>

      <p className="mt-2 text-sm text-zinc-600">
        Completa tus datos para registrar tu pedido.
        El pago se realizará en efectivo.
      </p>

      {/* PRODUCTOS */}
      <section className="mt-6 rounded-xl border p-5">

        <h2 className="mb-4 text-lg font-semibold">
          Tu pedido
        </h2>

        <div className="space-y-3">

          {lines.map((line) => (
            <div
              key={line.productId}
              className="flex justify-between gap-3"
            >
              <span>
                {line.name} × {line.quantity}
              </span>

              <strong>
                {formatCOP(line.price * line.quantity)}
              </strong>
            </div>
          ))}

        </div>

        <div className="mt-4 border-t pt-4 flex justify-between text-xl">
          <strong>Total estimado</strong>
          <strong>{formatCOP(total)}</strong>
        </div>

        <p className="mt-2 text-xs text-zinc-500">
          El valor definitivo será calculado y validado
          por el servidor, incluyendo el IVA configurado.
        </p>

      </section>

      {/* DATOS */}
      <form
        onSubmit={onSubmit}
        className="mt-6 space-y-4"
      >

        <section className="space-y-4 rounded-xl border p-5">

          <h2 className="text-lg font-semibold">
            Datos del cliente
          </h2>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Nombre completo
            </label>

            <input
              name="customerName"
              required
              minLength={2}
              autoComplete="name"
              className="w-full rounded-lg border p-3"
              placeholder="Tu nombre completo"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Correo electrónico
            </label>

            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-lg border p-3"
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Teléfono
            </label>

            <input
              name="phone"
              type="tel"
              required
              minLength={7}
              autoComplete="tel"
              className="w-full rounded-lg border p-3"
              placeholder="Número de contacto"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Dirección de entrega
            </label>

            <textarea
              name="address"
              required
              minLength={5}
              autoComplete="street-address"
              rows={3}
              className="w-full rounded-lg border p-3"
              placeholder="Dirección completa"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Observaciones (opcional)
            </label>

            <textarea
              name="notes"
              rows={2}
              className="w-full rounded-lg border p-3"
              placeholder="Información adicional"
            />
          </div>

        </section>

        {/* PAGO */}
        <section className="rounded-xl border p-5">

          <h2 className="font-semibold">
            Forma de pago
          </h2>

          <div className="mt-3 rounded-lg bg-green-50 p-4">
            <p className="font-semibold text-green-800">
              Pago en efectivo
            </p>

            <p className="mt-1 text-sm text-green-700">
              El pago se realizará en efectivo al recibir
              o recoger el pedido.
            </p>
          </div>

        </section>

        {error && (
          <div className="rounded-lg bg-red-100 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={pending || lines.length === 0}
          className="w-full rounded-xl bg-orange-600 py-4 font-semibold text-white hover:bg-orange-500 disabled:opacity-50"
        >
          {pending
            ? "Registrando pedido..."
            : "Confirmar pedido en efectivo"}
        </button>

      </form>

    </main>
  );
}
