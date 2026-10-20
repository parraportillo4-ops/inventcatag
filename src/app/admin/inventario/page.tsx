
"use client";

import { useCallback, useEffect, useState } from "react";

type Supplier = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  active: boolean;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  brand: string;
  price: number;
  costPrice: number;
  stock: number;
  minStock: number;
  active: boolean;
  deletedAt: string | null;
  supplierId: string | null;
  supplier: Supplier | null;
  category: { name: string };
  brandRef: { name: string } | null;
};

type Movement = {
  id: string;
  type: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string | null;
  referenceId: string | null;
  createdAt: string;
  product: { name: string; slug: string };
};

type InventoryData = {
  products: Product[];
  suppliers: Supplier[];
  movements: Movement[];
};

const money = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);

export default function InventarioPage() {
  const [data, setData] = useState<InventoryData>({
    products: [],
    suppliers: [],
    movements: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  const [selectedId, setSelectedId] = useState("");
  const [movementType, setMovementType] =
    useState<"ENTRADA" | "SALIDA">("ENTRADA");
  const [quantity, setQuantity] = useState("1");
  const [reason, setReason] = useState("");
  const [movementOpen, setMovementOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [costPrice, setCostPrice] = useState("");
  const [price, setPrice] = useState("");
  const [minStock, setMinStock] = useState("0");
  const [supplierId, setSupplierId] = useState("");

  const [supplierOpen, setSupplierOpen] = useState(false);
  const [supplierName, setSupplierName] = useState("");
  const [supplierPhone, setSupplierPhone] = useState("");
  const [supplierEmail, setSupplierEmail] = useState("");
  const [supplierAddress, setSupplierAddress] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/inventario", {
        cache: "no-store",
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error ?? "No se pudo cargar el inventario");
      }

      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de conexión");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const products = data.products.filter((p) => {
    const text = [
      p.name,
      p.brand,
      p.brandRef?.name ?? "",
      p.supplier?.name ?? "",
    ]
      .join(" ")
      .toLowerCase();

    return text.includes(search.toLowerCase());
  });

  const lowStock = data.products.filter(
    (p) => p.active && p.stock <= p.minStock
  ).length;

  function openMovement(product: Product, type: "ENTRADA" | "SALIDA") {
    setSelectedId(product.id);
    setMovementType(type);
    setQuantity("1");
    setReason(type === "ENTRADA" ? "Reposición de mercancía" : "");
    setMessage("");
    setError("");
    setMovementOpen(true);
  }

  function openEdit(product: Product) {
    setSelectedId(product.id);
    setCostPrice(String(product.costPrice));
    setPrice(String(product.price));
    setMinStock(String(product.minStock));
    setSupplierId(product.supplierId ?? "");
    setMessage("");
    setError("");
    setEditOpen(true);
  }

  async function saveMovement(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/admin/inventario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedId,
          type: movementType,
          quantity: Number(quantity),
          reason,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error ?? "No se pudo registrar el movimiento");
      }

      setMovementOpen(false);
      setMessage("Movimiento registrado correctamente.");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  async function saveEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(
        `/api/admin/inventario/${selectedId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            costPrice: Number(costPrice),
            price: Number(price),
            minStock: Number(minStock),
            supplierId: supplierId || null,
          }),
        }
      );

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error ?? "No se pudo actualizar el producto");
      }

      setEditOpen(false);
      setMessage("Datos del inventario actualizados.");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  async function saveSupplier(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/admin/proveedores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: supplierName,
          phone: supplierPhone,
          email: supplierEmail,
          address: supplierAddress,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error ?? "No se pudo crear el proveedor");
      }

      setSupplierOpen(false);
      setSupplierName("");
      setSupplierPhone("");
      setSupplierEmail("");
      setSupplierAddress("");
      setSupplierId(json.id);
      setMessage("Proveedor creado correctamente.");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  const selectedProduct = data.products.find(
    (p) => p.id === selectedId
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">
            Inventario
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            Control de existencias, costos y proveedores.
          </p>
        </div>

        <button
          onClick={() => setSupplierOpen(true)}
          className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold"
        >
          + Nuevo proveedor
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {message && (
        <p role="status" className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {message}
        </p>
      )}

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border bg-white p-5">
          <p className="text-sm text-zinc-500">Referencias registradas</p>
          <p className="mt-2 text-3xl font-bold">
            {data.products.length}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <p className="text-sm text-zinc-500">Productos con stock bajo</p>
          <p className="mt-2 text-3xl font-bold text-orange-600">
            {lowStock}
          </p>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border bg-white p-4">
        <label htmlFor="inventory-search" className="text-sm font-medium">
          Buscar por producto, marca o proveedor
        </label>
        <input
          id="inventory-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ej. Samsung, cargador, proveedor..."
          className="mt-2 w-full rounded-lg border px-3 py-2"
        />

        {loading ? (
          <p className="py-8 text-center text-zinc-500">
            Cargando inventario...
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-zinc-50 text-zinc-600">
                <tr>
                  <th className="p-3">Producto</th>
                  <th className="p-3">Proveedor</th>
                  <th className="p-3">Costo</th>
                  <th className="p-3">Venta</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3">Mínimo</th>
                  <th className="p-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="p-3">
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-zinc-500">
                        {p.brandRef?.name ?? p.brand}
                        {!p.active && " · Inactivo"}
                      </p>
                    </td>
                    <td className="p-3">
                      {p.supplier?.name ?? "Sin proveedor"}
                    </td>
                    <td className="p-3">{money(p.costPrice)}</td>
                    <td className="p-3">{money(p.price)}</td>
                    <td className="p-3">
                      <span
                        className={
                          p.active && p.stock <= p.minStock
                            ? "font-semibold text-red-600"
                            : ""
                        }
                      >
                        {p.stock}
                      </span>
                    </td>
                    <td className="p-3">{p.minStock}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => openMovement(p, "ENTRADA")}
                          className="rounded border px-2 py-1"
                        >
                          Entrada
                        </button>
                        <button
                          onClick={() => openMovement(p, "SALIDA")}
                          className="rounded border px-2 py-1"
                        >
                          Salida
                        </button>
                        <button
                          onClick={() => openEdit(p)}
                          className="rounded border border-orange-200 px-2 py-1 text-orange-700"
                        >
                          Editar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {products.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-zinc-500">
                      No se encontraron productos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-8 rounded-2xl border bg-white p-4">
        <h2 className="text-xl font-bold">Últimos movimientos</h2>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-zinc-50">
              <tr>
                <th className="p-3">Fecha</th>
                <th className="p-3">Producto</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Cantidad</th>
                <th className="p-3">Antes</th>
                <th className="p-3">Después</th>
                <th className="p-3">Motivo</th>
              </tr>
            </thead>
            <tbody>
              {data.movements.map((m) => (
                <tr key={m.id} className="border-t">
                  <td className="p-3">
                    {new Date(m.createdAt).toLocaleString("es-CO")}
                  </td>
                  <td className="p-3">{m.product.name}</td>
                  <td className="p-3">{m.type}</td>
                  <td className="p-3">{m.quantity}</td>
                  <td className="p-3">{m.previousStock}</td>
                  <td className="p-3">{m.newStock}</td>
                  <td className="p-3">{m.reason ?? "—"}</td>
                </tr>
              ))}
              {data.movements.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-5 text-center text-zinc-500">
                    Todavía no hay movimientos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {movementOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <form
            onSubmit={saveMovement}
            className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6"
          >
            <h2 className="text-xl font-bold">
              Registrar {movementType.toLowerCase()}
            </h2>
            <p className="text-sm text-zinc-600">
              {selectedProduct?.name}
            </p>

            <label className="block text-sm">
              Tipo
              <select
                value={movementType}
                onChange={(e) =>
                  setMovementType(e.target.value as "ENTRADA" | "SALIDA")
                }
                className="mt-1 w-full rounded-lg border p-2"
              >
                <option value="ENTRADA">Entrada</option>
                <option value="SALIDA">Salida</option>
              </select>
            </label>

            <label className="block text-sm">
              Cantidad
              <input
                type="number"
                min="1"
                step="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="mt-1 w-full rounded-lg border p-2"
              />
            </label>

            <label className="block text-sm">
              Motivo
              <input
                required
                minLength={3}
                maxLength={200}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1 w-full rounded-lg border p-2"
                placeholder="Reposición, ajuste autorizado..."
              />
            </label>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setMovementOpen(false)}
                className="rounded-lg border px-4 py-2"
              >
                Cancelar
              </button>
              <button
                disabled={saving}
                className="rounded-lg bg-orange-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Guardar movimiento"}
              </button>
            </div>
          </form>
        </div>
      )}

      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <form
            onSubmit={saveEdit}
            className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6"
          >
            <h2 className="text-xl font-bold">Editar inventario</h2>
            <p className="text-sm text-zinc-600">
              {selectedProduct?.name}
            </p>

            <label className="block text-sm">
              Precio de costo (COP)
              <input
                type="number"
                min="0"
                step="1"
                required
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                className="mt-1 w-full rounded-lg border p-2"
              />
            </label>

            <label className="block text-sm">
              Precio de venta (COP)
              <input
                type="number"
                min="1"
                step="1"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="mt-1 w-full rounded-lg border p-2"
              />
            </label>

            <label className="block text-sm">
              Stock mínimo
              <input
                type="number"
                min="0"
                step="1"
                required
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                className="mt-1 w-full rounded-lg border p-2"
              />
            </label>

            <label className="block text-sm">
              Proveedor
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="mt-1 w-full rounded-lg border p-2"
              >
                <option value="">Sin proveedor</option>
                {data.suppliers
                  .filter((s) => s.active)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
              </select>
            </label>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="rounded-lg border px-4 py-2"
              >
                Cancelar
              </button>
              <button
                disabled={saving}
                className="rounded-lg bg-orange-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>
        </div>
      )}

      {supplierOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <form
            onSubmit={saveSupplier}
            className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6"
          >
            <h2 className="text-xl font-bold">Nuevo proveedor</h2>

            <label className="block text-sm">
              Nombre
              <input
                required
                minLength={2}
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                className="mt-1 w-full rounded-lg border p-2"
              />
            </label>

            <label className="block text-sm">
              Teléfono
              <input
                value={supplierPhone}
                onChange={(e) => setSupplierPhone(e.target.value)}
                className="mt-1 w-full rounded-lg border p-2"
              />
            </label>

            <label className="block text-sm">
              Correo electrónico
              <input
                type="email"
                value={supplierEmail}
                onChange={(e) => setSupplierEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border p-2"
              />
            </label>

            <label className="block text-sm">
              Dirección
              <input
                value={supplierAddress}
                onChange={(e) => setSupplierAddress(e.target.value)}
                className="mt-1 w-full rounded-lg border p-2"
              />
            </label>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSupplierOpen(false)}
                className="rounded-lg border px-4 py-2"
              >
                Cancelar
              </button>
              <button
                disabled={saving}
                className="rounded-lg bg-orange-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Crear proveedor"}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
