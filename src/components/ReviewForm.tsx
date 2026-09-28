"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ReviewForm({ productId }: { productId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setMessage(null);
    const fd = new FormData(e.currentTarget);
    const payload = {
      productId,
      authorName: String(fd.get("authorName") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim() || undefined,
      rating: Number(fd.get("rating")),
      comment: String(fd.get("comment") ?? "").trim(),
    };
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Error al enviar");
      setMessage("Gracias, tu reseña fue publicada.");
      e.currentTarget.reset();
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Error");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-zinc-500">Nombre</label>
          <input
            name="authorName"
            required
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-500">Correo (opcional)</label>
          <input
            name="email"
            type="email"
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-zinc-500">Calificación</label>
        <select
          name="rating"
          required
          className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          defaultValue={5}
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} estrellas
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs font-medium text-zinc-500">Comentario</label>
        <textarea
          name="comment"
          required
          rows={3}
          className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60"
      >
        {pending ? "Enviando…" : "Publicar reseña"}
      </button>
      {message && <p className="text-sm text-green-700">{message}</p>}
    </form>
  );
}
