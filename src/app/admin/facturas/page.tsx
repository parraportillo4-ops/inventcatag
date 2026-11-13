"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Invoice = {
  id: string;
  invoiceNumber: string;
  issuedAt: string;
  customerName: string;
  orderNumber: string;
  subtotal: string;
  taxAmount: string;
  total: string;
  paymentMethod: string;
};

const money = (value: string) => Number(value).toLocaleString("es-CO", {
  style: "currency", currency: "COP", maximumFractionDigits: 0,
});

export default function FacturasPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadInvoices() {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      const response = await fetch(`/api/admin/facturas?${params.toString()}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudieron cargar las facturas");
      setInvoices(data.invoices);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando facturas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadInvoices(); }, []);

  const total = invoices.reduce((sum, invoice) => sum + Number(invoice.total), 0);

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-6">
      <header>
        <h1 className="text-3xl font-bold text-zinc-900">Facturas</h1>
        <p className="mt-1 text-sm text-zinc-600">Facturas de ventas pagadas en efectivo.</p>
      </header>

      <section className="grid gap-4 rounded-xl border bg-white p-5 md:grid-cols-3">
        <label className="text-sm">Desde
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1 w-full rounded-lg border p-3" />
        </label>
        <label className="text-sm">Hasta
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1 w-full rounded-lg border p-3" />
        </label>
        <button onClick={loadInvoices} className="self-end rounded-lg bg-zinc-900 p-3 text-white">Consultar</button>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-white p-5"><p className="text-sm text-zinc-500">Facturas encontradas</p><p className="text-3xl font-bold">{invoices.length}</p></div>
        <div className="rounded-xl border bg-white p-5"><p className="text-sm text-zinc-500">Total facturado en el periodo</p><p className="text-3xl font-bold">{money(String(total))}</p></div>
      </section>

      <section className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-100"><tr>
            <th className="p-4">Factura</th><th className="p-4">Venta</th><th className="p-4">Cliente</th><th className="p-4">Fecha</th><th className="p-4">Subtotal</th><th className="p-4">IVA</th><th className="p-4">Total</th><th className="p-4">Acción</th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={8} className="p-6 text-center">Cargando facturas...</td></tr>
              : error ? <tr><td colSpan={8} className="p-6 text-center text-red-600">{error}</td></tr>
              : invoices.length === 0 ? <tr><td colSpan={8} className="p-6 text-center">No hay facturas en este periodo.</td></tr>
              : invoices.map((invoice) => <tr key={invoice.id} className="border-t">
                <td className="p-4 font-medium">{invoice.invoiceNumber}</td><td className="p-4">{invoice.orderNumber}</td><td className="p-4">{invoice.customerName}</td>
                <td className="p-4">{new Date(invoice.issuedAt).toLocaleString("es-CO")}</td><td className="p-4">{money(invoice.subtotal)}</td><td className="p-4">{money(invoice.taxAmount)}</td><td className="p-4 font-semibold">{money(invoice.total)}</td>
                <td className="p-4"><Link className="font-medium text-blue-700 hover:underline" href={`/admin/facturas/${invoice.id}`}>Ver / imprimir</Link></td>
              </tr>)}
          </tbody>
        </table>
      </section>
    </main>
  );
}
