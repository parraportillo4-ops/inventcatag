"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type InvoiceData = {
  invoiceNumber: string; issuedAt: string; subtotal: string; taxEnabled: boolean;
  taxRate: string; taxAmount: string; total: string; paymentMethod: string;
  orderNumber: string;
  customer: { name: string; email: string; phone: string; address: string };
  items: { id: string; name: string; quantity: number; unitPrice: string; lineTotal: string }[];
};
const money = (value: string) => Number(value).toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

export default function FacturaDetallePage() {
  const params = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(`/api/admin/facturas/${params.id}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "No se pudo cargar la factura");
        setInvoice(data.invoice);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error cargando factura");
      }
    }
    if (params.id) void load();
  }, [params.id]);

  if (error) return <main className="p-8 text-red-600">{error}</main>;
  if (!invoice) return <main className="p-8">Cargando factura...</main>;

  return (
    <main className="mx-auto max-w-4xl p-4 sm:p-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href="/admin/facturas" className="text-sm text-blue-700 hover:underline">← Volver a facturas</Link>
        <button onClick={() => window.print()} className="rounded-lg bg-zinc-900 px-5 py-3 text-white">Imprimir / Guardar PDF</button>
      </div>

      <article className="rounded-xl border bg-white p-6 shadow-sm sm:p-10 print:border-0 print:shadow-none">
        <div className="flex flex-wrap justify-between gap-6 border-b pb-6">
          <div><p className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Comprobante de venta</p><h1 className="mt-2 text-3xl font-bold">Santuario</h1><p className="mt-1 text-sm text-zinc-500">Pago recibido en efectivo</p></div>
          <div className="text-left sm:text-right"><h2 className="text-xl font-bold">{invoice.invoiceNumber}</h2><p className="mt-2 text-sm text-zinc-600">Fecha: {new Date(invoice.issuedAt).toLocaleString("es-CO")}</p><p className="text-sm text-zinc-600">Venta: {invoice.orderNumber}</p></div>
        </div>

        <section className="grid gap-4 border-b py-6 sm:grid-cols-2">
          <div><h3 className="mb-2 font-semibold">Cliente</h3><p>{invoice.customer.name}</p><p className="text-sm text-zinc-600">{invoice.customer.email}</p><p className="text-sm text-zinc-600">{invoice.customer.phone}</p><p className="text-sm text-zinc-600">{invoice.customer.address}</p></div>
          <div className="sm:text-right"><h3 className="mb-2 font-semibold">Información de pago</h3><p>Forma de pago: EFECTIVO</p><p className="text-sm text-zinc-600">Estado: PAGADO</p></div>
        </section>

        <div className="overflow-x-auto py-6">
          <table className="w-full text-left text-sm"><thead className="border-b bg-zinc-50"><tr><th className="p-3">Producto</th><th className="p-3 text-right">Cantidad</th><th className="p-3 text-right">Precio unitario</th><th className="p-3 text-right">Total</th></tr></thead>
            <tbody>{invoice.items.map((item) => <tr key={item.id} className="border-b"><td className="p-3">{item.name}</td><td className="p-3 text-right">{item.quantity}</td><td className="p-3 text-right">{money(item.unitPrice)}</td><td className="p-3 text-right">{money(item.lineTotal)}</td></tr>)}</tbody>
          </table>
        </div>

        <section className="ml-auto max-w-sm space-y-2 border-t pt-5 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>{money(invoice.subtotal)}</span></div>
          <div className="flex justify-between"><span>IVA {invoice.taxEnabled ? `(${invoice.taxRate}%)` : "(No aplicado)"}</span><span>{money(invoice.taxAmount)}</span></div>
          <div className="flex justify-between border-t pt-3 text-lg font-bold"><span>TOTAL PAGADO</span><span>{money(invoice.total)}</span></div>
        </section>
        <p className="mt-10 border-t pt-5 text-center text-xs text-zinc-500">Gracias por su compra.</p>
      </article>
      <style jsx global>{`@media print { @page { size: A4; margin: 14mm; } body { background: white !important; } }`}</style>
    </main>
  );
}
