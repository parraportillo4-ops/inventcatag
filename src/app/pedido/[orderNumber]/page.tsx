import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCOP } from "@/lib/format";

type Props = { params: Promise<{ orderNumber: string }> };

export default async function PedidoPage({ params }: Props) {
  const { orderNumber } = await params;
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: { include: { product: true } } },
  });

  if (!order) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-bold text-zinc-900">Pedido confirmado</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Número de pedido:{" "}
        <strong className="font-mono text-zinc-900">{order.orderNumber}</strong>
      </p>
      <p className="mt-1 text-sm text-zinc-600">
        Estado: <strong>{order.status}</strong> · Pago: {order.paymentMethod} (demo)
      </p>
      <p className="mt-4 text-sm text-zinc-600">
        Se envió un resumen al correo <strong>{order.email}</strong> (en desarrollo se
        muestra también en consola del servidor).
      </p>

      <ul className="mt-6 space-y-2 rounded-xl border border-zinc-200 bg-white p-4 text-sm">
        {order.items.map((it) => (
          <li key={it.id} className="flex justify-between gap-2">
            <span>
              {it.product.name} × {it.quantity}
            </span>
            <span>{formatCOP(Number(it.priceSnapshot) * it.quantity)}</span>
          </li>
        ))}
        <li className="flex justify-between border-t border-zinc-200 pt-2 font-bold">
          <span>Total</span>
          <span>{formatCOP(Number(order.total))}</span>
        </li>
      </ul>

      <Link href="/catalogo" className="mt-8 inline-block font-semibold text-orange-600">
        Seguir comprando
      </Link>
    </div>
  );
}
