"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Sale = {
  id: string;
  orderNumber: string;
  customerName: string;
  subtotal: string;
  taxAmount: string;
  total: string;
  status: string;
  paymentMethod: string;
  createdAt: string;
};

function money(value: string) {
  return Number(value).toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });
}

export default function VentasPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [totalUnitsSold, setTotalUnitsSold] = useState(0);

  async function loadSales() {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (from) params.set("from", from);
      if (to) params.set("to", to);

      const response = await fetch(
        `/api/admin/ventas?${params.toString()}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "No se pudieron consultar las ventas"
        );
      }

      setSales(data.orders);
      setTotalUnitsSold(data.totalUnitsSold);

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error consultando ventas"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSales();
  }, []);

  const paidSales = sales.filter(
    (sale) => sale.status === "PAGADO"
  );

  const totalSales = paidSales.reduce(
    (sum, sale) => sum + Number(sale.total),
    0
  );

  const totalCount = paidSales.length;

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-6">

      <div className="flex flex-wrap items-center justify-between gap-4">

        <div>
          <h1 className="text-3xl font-bold">
            Ventas
          </h1>

          <p className="text-gray-500">
            Administración y consulta de ventas.
          </p>
        </div>

        <Link
          href="/admin/ventas/nueva"
          className="rounded-lg bg-blue-600 px-5 py-3 text-white"
        >
          + Nueva venta
        </Link>

      </div>

      {/* FILTRO DE FECHAS */}
      <section className="rounded-xl border p-5 space-y-4">

        <h2 className="font-semibold">
          Consultar por periodo
        </h2>

        <div className="grid gap-3 md:grid-cols-3">

          <div>
            <label className="mb-1 block text-sm">
              Desde
            </label>

            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm">
              Hasta
            </label>

            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full rounded-lg border p-3"
            />
          </div>

          <button
            onClick={loadSales}
            className="self-end rounded-lg bg-gray-900 p-3 text-white"
          >
            Consultar ventas
          </button>

        </div>

      </section>

      {/* RESUMEN */}
      <section className="grid gap-4 md:grid-cols-3">

        <div className="rounded-xl border p-5">
          <p className="text-sm text-gray-500">
            Ventas pagadas
          </p>

          <p className="text-3xl font-bold">
            {totalCount}
          </p>
        </div>

        <div className="rounded-xl border p-5">
          <p className="text-sm text-gray-500">
            Total recaudado
          </p>

          <p className="text-3xl font-bold">
            {money(String(totalSales))}
          </p>
        </div>

        <div className="rounded-xl border p-5">
          <p className="text-sm text-gray-500">
            Unidades vendidas
          </p>

          <p className="text-3xl font-bold">
            {totalUnitsSold}
          </p>
        </div>

      </section>

      {/* TABLA */}
      <section className="overflow-x-auto rounded-xl border">

        <table className="w-full text-left">

          <thead className="bg-gray-100">
            <tr>
              <th className="p-4">Número</th>
              <th className="p-4">Cliente</th>
              <th className="p-4">Fecha</th>
              <th className="p-4">Subtotal</th>
              <th className="p-4">IVA</th>
              <th className="p-4">Total</th>
              <th className="p-4">Pago</th>
              <th className="p-4">Estado</th>
            </tr>
          </thead>

          <tbody>

            {loading ? (
              <tr>
                <td colSpan={8} className="p-6 text-center">
                  Cargando ventas...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td
                  colSpan={8}
                  className="p-6 text-center text-red-600"
                >
                  {error}
                </td>
              </tr>
            ) : sales.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-6 text-center">
                  No hay ventas en este periodo.
                </td>
              </tr>
            ) : (
              sales.map((sale) => (
                <tr
                  key={sale.id}
                  className="border-t"
                >
                  <td className="p-4">
                    {sale.orderNumber}
                  </td>

                  <td className="p-4">
                    {sale.customerName}
                  </td>

                  <td className="p-4">
                    {new Date(sale.createdAt).toLocaleDateString(
                      "es-CO"
                    )}
                  </td>

                  <td className="p-4">
                    {money(sale.subtotal)}
                  </td>

                  <td className="p-4">
                    {money(sale.taxAmount)}
                  </td>

                  <td className="p-4 font-semibold">
                    {money(sale.total)}
                  </td>

                  <td className="p-4">
                    {sale.paymentMethod}
                  </td>

                  <td className="p-4">
                    <span
                      className={
                        sale.status === "PAGADO"
                          ? "rounded bg-green-100 px-2 py-1 text-green-700"
                          : "rounded bg-yellow-100 px-2 py-1 text-yellow-700"
                      }
                    >
                      {sale.status}
                    </span>
                  </td>
                </tr>
              ))
            )}

          </tbody>
        </table>

      </section>

    </main>
  );
}