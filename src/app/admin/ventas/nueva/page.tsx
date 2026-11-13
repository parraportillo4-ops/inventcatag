
"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

type Product = {
  id: string;
  name: string;
  price: string;
  stock: number;
};

type CartItem = {
  productId: string;
  quantity: number;
};

type Tax = {
  enabled: boolean;
  rate: string;
};

function money(value: number) {
  return value.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });
}

export default function NuevaVentaPage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);

  const [tax, setTax] = useState<Tax>({
    enabled: false,
    rate: "19",
  });

  const [cart, setCart] = useState<CartItem[]>([]);

  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState("");

  // Cargar productos y configuración del IVA
 
useEffect(() => {
  async function loadData() {
    try {
      setLoadingProducts(true);
      setError("");

      const response = await fetch("/api/admin/ventas", {
        cache: "no-store",
      });

      const contentType = response.headers.get("content-type") || "";
      const responseText = await response.text();

      // Detectar si el servidor devolvió HTML en lugar de JSON
      if (!contentType.includes("application/json")) {
        console.error("Respuesta inesperada del servidor:", {
          status: response.status,
          url: response.url,
          redirected: response.redirected,
          contentType,
          response: responseText.slice(0, 300),
        });

        if (response.redirected) {
          throw new Error(
            "La solicitud fue redirigida. Verifique su sesión de administrador."
          );
        }

        throw new Error(
          `La API devolvió HTML en lugar de JSON. Código HTTP: ${response.status}. Revise la ruta del backend.`
        );
      }

      const data = JSON.parse(responseText);

      if (!response.ok) {
        throw new Error(
          data.error || "No se pudieron cargar los datos"
        );
      }

      if (!Array.isArray(data.products)) {
        throw new Error(
          "La respuesta de la API no contiene una lista válida de productos."
        );
      }

      setProducts(data.products);

      if (data.tax) {
        setTax({
          enabled: Boolean(data.tax.enabled),
          rate: String(data.tax.rate ?? "19"),
        });
      }

    } catch (err) {
      console.error("Error cargando productos:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Error cargando información"
      );
    } finally {
      setLoadingProducts(false);
    }
  }

  loadData();
}, []);

  // Obtener producto seleccionado
  const selected = products.find(
    (product) => product.id === selectedProduct
  );

  // Agregar producto al carrito
  function addProduct() {
    setError("");

    if (!selected) {
      setError("Seleccione un producto");
      return;
    }

    if (selected.stock <= 0) {
      setError("Este producto no tiene existencias");
      return;
    }

    if (
      !Number.isSafeInteger(quantity) ||
      quantity <= 0
    ) {
      setError("La cantidad debe ser mayor que cero");
      return;
    }

    const existing = cart.find(
      (item) => item.productId === selected.id
    );

    const currentQuantity = existing
      ? existing.quantity
      : 0;

    if (currentQuantity + quantity > selected.stock) {
      setError(
        `Stock insuficiente. Disponible: ${selected.stock}`
      );
      return;
    }

    if (existing) {
      setCart((previous) =>
        previous.map((item) =>
          item.productId === selected.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
              }
            : item
        )
      );
    } else {
      setCart((previous) => [
        ...previous,
        {
          productId: selected.id,
          quantity,
        },
      ]);
    }

    setSelectedProduct("");
    setQuantity(1);
  }

  // Cambiar cantidad
  function updateQuantity(
    productId: string,
    newQuantity: number
  ) {
    const product = products.find(
      (p) => p.id === productId
    );

    if (
      !product ||
      !Number.isSafeInteger(newQuantity) ||
      newQuantity <= 0 ||
      newQuantity > product.stock
    ) {
      return;
    }

    setCart((previous) =>
      previous.map((item) =>
        item.productId === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  }

  // Eliminar producto
  function removeProduct(productId: string) {
    setCart((previous) =>
      previous.filter(
        (item) => item.productId !== productId
      )
    );
  }

  // Calcular subtotal
  const subtotal = cart.reduce((sum, item) => {
    const product = products.find(
      (p) => p.id === item.productId
    );

    if (!product) return sum;

    return (
      sum +
      Number(product.price) * item.quantity
    );
  }, 0);

  // Calcular IVA
  const taxAmount = tax.enabled
    ? subtotal * Number(tax.rate) / 100
    : 0;

  // Calcular total
  const total = subtotal + taxAmount;

  // Registrar venta
  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (cart.length === 0) {
      setError("Agregue productos a la venta");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/admin/ventas",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customerName,
            email,
            phone,
            address,
            notes,
            items: cart,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "No se pudo registrar la venta"
        );
      }

      alert(
        `Venta registrada correctamente.\nFactura: ${data.invoice.invoiceNumber}`
      );

      router.push("/admin/ventas");
      router.refresh();

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error registrando venta"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">

      <div>
        <h1 className="text-3xl font-bold">
          Registrar nueva venta
        </h1>

        <p className="text-gray-500">
          Registre una venta presencial pagada en efectivo.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >

        {/* DATOS DEL CLIENTE */}
        <section className="rounded-xl border p-5 space-y-4">
          <h2 className="text-xl font-semibold">
            Datos del cliente
          </h2>

          <input
            required
            placeholder="Nombre completo"
            value={customerName}
            onChange={(e) =>
              setCustomerName(e.target.value)
            }
            className="w-full rounded-lg border p-3"
          />

          <input
            required
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full rounded-lg border p-3"
          />

          <input
            required
            placeholder="Teléfono"
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value)
            }
            className="w-full rounded-lg border p-3"
          />

          <input
            required
            placeholder="Dirección"
            value={address}
            onChange={(e) =>
              setAddress(e.target.value)
            }
            className="w-full rounded-lg border p-3"
          />

          <textarea
            placeholder="Observaciones (opcional)"
            value={notes}
            onChange={(e) =>
              setNotes(e.target.value)
            }
            className="w-full rounded-lg border p-3"
          />
        </section>

        {/* SELECCIONAR PRODUCTOS */}
        <section className="rounded-xl border p-5 space-y-4">

          <h2 className="text-xl font-semibold">
            Productos
          </h2>

          {loadingProducts && (
            <p className="text-gray-500">
              Cargando productos...
            </p>
          )}

          <div className="grid gap-3 md:grid-cols-3">

            <select
              value={selectedProduct}
              onChange={(e) =>
                setSelectedProduct(e.target.value)
              }
              disabled={loadingProducts || products.length === 0}
              className="rounded-lg border p-3"
            >
              <option value="">
                Seleccionar producto
              </option>

              {products.map((product) => (
                <option
                  key={product.id}
                  value={product.id}
                  disabled={product.stock <= 0}
                >
                  {product.name} -{" "}
                  {money(Number(product.price))}
                  {" "} (Stock: {product.stock})
                  {product.stock <= 0
                    ? " - AGOTADO"
                    : ""}
                </option>
              ))}
            </select>

            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) =>
                setQuantity(Number(e.target.value))
              }
              className="rounded-lg border p-3"
              placeholder="Cantidad"
            />

            <button
              type="button"
              onClick={addProduct}
              disabled={!selected || selected.stock <= 0}
              className="rounded-lg bg-blue-600 p-3 text-white disabled:opacity-50"
            >
              Agregar producto
            </button>

          </div>

          {products.length === 0 && !loadingProducts && (
            <p className="text-sm text-red-600">
              No hay productos activos registrados.
              Revise el catálogo y la conexión con la base de datos.
            </p>
          )}

          {products.length > 0 &&
            products.every((product) => product.stock <= 0) && (
              <p className="text-sm text-orange-600">
                Hay productos registrados, pero ninguno tiene
                existencias. Registre stock desde el módulo
                de inventario.
              </p>
            )}

          {selected && (
            <p className="text-sm text-gray-500">
              Stock disponible: {selected.stock}
            </p>
          )}

          {/* CARRITO */}
          <div className="overflow-x-auto">

            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="p-3">Producto</th>
                  <th className="p-3">Precio</th>
                  <th className="p-3">Cantidad</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Acción</th>
                </tr>
              </thead>

              <tbody>
                {cart.map((item) => {
                  const product = products.find(
                    (p) => p.id === item.productId
                  );

                  if (!product) return null;

                  const lineTotal =
                    Number(product.price) * item.quantity;

                  return (
                    <tr
                      key={item.productId}
                      className="border-b"
                    >
                      <td className="p-3">
                        {product.name}
                      </td>

                      <td className="p-3">
                        {money(Number(product.price))}
                      </td>

                      <td className="p-3">
                        <input
                          type="number"
                          min="1"
                          max={product.stock}
                          value={item.quantity}
                          onChange={(e) =>
                            updateQuantity(
                              item.productId,
                              Number(e.target.value)
                            )
                          }
                          className="w-20 rounded border p-2"
                        />
                      </td>

                      <td className="p-3">
                        {money(lineTotal)}
                      </td>

                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() =>
                            removeProduct(item.productId)
                          }
                          className="text-red-600"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {cart.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-5 text-center text-gray-500"
                    >
                      No hay productos agregados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

          </div>
        </section>

        {/* RESUMEN */}
        <section className="rounded-xl border p-5 space-y-3">

          <h2 className="text-xl font-semibold">
            Resumen de venta
          </h2>

          <div className="flex justify-between">
            <span>Subtotal</span>
            <strong>{money(subtotal)}</strong>
          </div>

          <div className="flex justify-between">
            <span>
              IVA {tax.enabled
                ? `(${tax.rate}%)`
                : "(Desactivado)"}
            </span>

            <strong>{money(taxAmount)}</strong>
          </div>

          <div className="flex justify-between border-t pt-3 text-xl">
            <strong>Total</strong>
            <strong>{money(total)}</strong>
          </div>

          <div className="rounded-lg bg-gray-100 p-3">
            Forma de pago: <strong>Efectivo</strong>
          </div>

        </section>

        {error && (
          <p className="rounded-lg bg-red-100 p-3 text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || cart.length === 0}
          className="w-full rounded-lg bg-green-600 p-4 font-semibold text-white disabled:opacity-50"
        >
          {loading
            ? "Registrando venta..."
            : "Confirmar venta en efectivo"}
        </button>

      </form>
    </main>
  );
}
