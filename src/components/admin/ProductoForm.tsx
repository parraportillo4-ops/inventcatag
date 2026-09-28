"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Cat = { id: string; name: string };

type ProductEdit = {
  id: string;
  name: string;
  slug: string;
  brand: string;
  description: string;
  characteristics: string;
  price: number;
  stock: number;
  categoryId: string;
  active: boolean;
  imageUrls: string[];
};

type Props = {
  categories: Cat[];
  product?: ProductEdit;
};

export function ProductoForm({ categories, product }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const isEdit = Boolean(product);

  const imagesDefault = product?.imageUrls?.length
    ? product.imageUrls.join("\n")
    : "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const imageUrls = String(fd.get("imageUrls") ?? "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const body = {
      name: String(fd.get("name")).trim(),
      slug: String(fd.get("slug")).trim(),
      brand: String(fd.get("brand")).trim(),
      description: String(fd.get("description")).trim(),
      characteristics: String(fd.get("characteristics")).trim(),
      price: Number(fd.get("price")),
      stock: Number(fd.get("stock")),
      categoryId: String(fd.get("categoryId")),
      imageUrls,
      ...(isEdit && {
        active: fd.get("active") === "on",
      }),
    };

    try {
      const url = isEdit ? `/api/admin/products/${product!.id}` : "/api/admin/products";
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Error al guardar");
      router.push("/admin/productos");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setPending(false);
    }
  }

  async function onDelete() {
    if (!product || !confirm("¿Eliminar producto del catálogo (lógico)?")) return;
    setPending(true);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("No se pudo eliminar");
      router.push("/admin/productos");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-zinc-500">Nombre</label>
          <input
            name="name"
            required
            defaultValue={product?.name}
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-500">Slug (URL)</label>
          <input
            name="slug"
            required
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            defaultValue={product?.slug}
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-500">Marca</label>
          <input
            name="brand"
            required
            defaultValue={product?.brand}
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-500">Categoría</label>
          <select
            name="categoryId"
            required
            defaultValue={product?.categoryId}
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-500">Precio (COP)</label>
          <input
            name="price"
            type="number"
            min={1}
            step={1}
            required
            defaultValue={product?.price ?? 1000}
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-500">Stock</label>
          <input
            name="stock"
            type="number"
            min={0}
            step={1}
            required
            defaultValue={product?.stock ?? 0}
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-zinc-500">Descripción</label>
          <textarea
            name="description"
            required
            rows={3}
            defaultValue={product?.description}
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-zinc-500">Características</label>
          <textarea
            name="characteristics"
            required
            rows={3}
            defaultValue={product?.characteristics}
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-zinc-500">
            URLs de imágenes (una por línea, https)
          </label>
          <textarea
            name="imageUrls"
            rows={4}
            defaultValue={imagesDefault}
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 font-mono text-xs"
          />
        </div>
        {isEdit && (
          <div className="flex items-center gap-2 sm:col-span-2">
            <input
              type="checkbox"
              name="active"
              id="active"
              defaultChecked={product?.active ?? true}
              className="h-4 w-4 rounded border-zinc-300"
            />
            <label htmlFor="active" className="text-sm text-zinc-700">
              Producto activo en tienda
            </label>
          </div>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-500 disabled:opacity-60"
        >
          {pending ? "Guardando…" : "Guardar"}
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={onDelete}
            disabled={pending}
            className="rounded-xl border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
          >
            Eliminar
          </button>
        )}
      </div>
    </form>
  );
}
