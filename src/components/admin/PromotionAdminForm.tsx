"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type P = { id: string; name: string; slug: string };

export function PromotionAdminForm({ products }: { products: P[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const productId = String(fd.get("productId") || "");
    const body = {
      title: String(fd.get("title")).trim(),
      subtitle: String(fd.get("subtitle") || "").trim() || undefined,
      imageUrl: String(fd.get("imageUrl") || "").trim() || undefined,
      linkUrl: String(fd.get("linkUrl") || "").trim() || undefined,
      discountPercent: fd.get("discountPercent")
        ? Number(fd.get("discountPercent"))
        : undefined,
      startsAt: new Date(String(fd.get("startsAt"))).toISOString(),
      endsAt: new Date(String(fd.get("endsAt"))).toISOString(),
      productId: productId || null,
    };
    try {
      const res = await fetch("/api/admin/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Error");
      e.currentTarget.reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setPending(false);
    }
  }

  const now = new Date();
  const defStart = new Date(now.getTime() - 3600000).toISOString().slice(0, 16);
  const defEnd = new Date(now.getTime() + 86400000 * 30).toISOString().slice(0, 16);

  return (
    <form
      onSubmit={onSubmit}
      className="mt-6 space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
    >
      <h2 className="font-semibold text-zinc-900">Nueva promoción</h2>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="text-xs text-zinc-500">Título</label>
          <input
            name="title"
            required
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs text-zinc-500">Subtítulo</label>
          <input
            name="subtitle"
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-zinc-500">Desde</label>
          <input
            name="startsAt"
            type="datetime-local"
            required
            defaultValue={defStart}
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-zinc-500">Hasta</label>
          <input
            name="endsAt"
            type="datetime-local"
            required
            defaultValue={defEnd}
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-zinc-500">Imagen (URL https)</label>
          <input
            name="imageUrl"
            type="url"
            placeholder="https://..."
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-zinc-500">Enlace interno (opcional)</label>
          <input
            name="linkUrl"
            placeholder="/producto/..."
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-zinc-500">% descuento (referencia)</label>
          <input
            name="discountPercent"
            type="number"
            min={0}
            max={100}
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-zinc-500">Producto relacionado (opcional)</label>
          <select
            name="productId"
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            defaultValue=""
          >
            <option value="">— Ninguno —</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-500 disabled:opacity-60"
      >
        {pending ? "Creando…" : "Crear promoción"}
      </button>
    </form>
  );
}
