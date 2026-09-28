"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Row = {
  id: string;
  title: string;
  startsAt: Date;
  endsAt: Date;
  active: boolean;
};

export function PromotionsTable({ initial }: { initial: Row[] }) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);

  async function remove(id: string) {
    if (!confirm("¿Eliminar esta promoción?")) return;
    setPending(id);
    await fetch(`/api/admin/promotions/${id}`, { method: "DELETE" });
    router.refresh();
    setPending(null);
  }

  return (
    <div className="mt-8 overflow-x-auto rounded-xl border border-zinc-200 bg-white">
      <table className="w-full min-w-[600px] text-left text-sm">
        <thead className="border-b border-zinc-200 bg-zinc-50">
          <tr>
            <th className="px-4 py-3 font-semibold">Título</th>
            <th className="px-4 py-3 font-semibold">Vigencia</th>
            <th className="px-4 py-3 font-semibold">Activa</th>
            <th className="px-4 py-3 font-semibold" />
          </tr>
        </thead>
        <tbody>
          {initial.map((p) => (
            <tr key={p.id} className="border-b border-zinc-100">
              <td className="px-4 py-3 font-medium">{p.title}</td>
              <td className="px-4 py-3 text-xs text-zinc-600">
                {new Date(p.startsAt).toLocaleString("es-CO")} —{" "}
                {new Date(p.endsAt).toLocaleString("es-CO")}
              </td>
              <td className="px-4 py-3">{p.active ? "Sí" : "No"}</td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  disabled={pending === p.id}
                  onClick={() => remove(p.id)}
                  className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
