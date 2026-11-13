
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ReviewForm({
  productId,
}: {
  productId: string;
}) {
  const router = useRouter();

  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setPending(true);
    setMessage(null);
    setSuccess(false);

    const form = e.currentTarget;
    const fd = new FormData(form);

    const payload = {
      productId,
      orderNumber: String(
        fd.get("orderNumber") ?? ""
      ).trim(),

      authorName: String(
        fd.get("authorName") ?? ""
      ).trim(),

      email: String(
        fd.get("email") ?? ""
      ).trim(),

      rating: Number(fd.get("rating")),

      comment: String(
        fd.get("comment") ?? ""
      ).trim(),
    };

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ?? "No fue posible enviar la reseña."
        );
      }

      setSuccess(true);
      setMessage(
        "¡Gracias! Tu reseña fue registrada correctamente."
      );

      form.reset();

      router.refresh();

    } catch (err) {
      setMessage(
        err instanceof Error
          ? err.message
          : "Error al enviar la reseña."
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-4 space-y-4"
    >
      <div>
        <label className="text-sm font-medium text-zinc-700">
          Número de pedido
        </label>

        <input
          name="orderNumber"
          required
          placeholder="Ejemplo: ORD-ABC123-XXXXX"
          className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-zinc-700">
          Correo utilizado en la compra
        </label>

        <input
          name="email"
          type="email"
          required
          placeholder="correo@ejemplo.com"
          className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-zinc-700">
          Tu nombre
        </label>

        <input
          name="authorName"
          required
          minLength={2}
          maxLength={80}
          className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-zinc-700">
          Calificación
        </label>

        <select
          name="rating"
          required
          defaultValue="5"
          className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} estrellas
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-zinc-700">
          Tu comentario
        </label>

        <textarea
          name="comment"
          required
          minLength={5}
          maxLength={1000}
          rows={4}
          placeholder="Cuéntanos tu experiencia con el producto..."
          className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60"
      >
        {pending
          ? "Verificando compra..."
          : "Verificar compra y publicar reseña"}
      </button>

      {message && (
        <p
          className={`text-sm ${
            success
              ? "text-green-700"
              : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
}
