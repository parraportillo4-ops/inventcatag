"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Settings = {
  whatsapp: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  email: string;
  address: string;
  mapEmbedUrl: string | null;
  aboutHtml: string;
  servicesHtml: string;
};

export function ConfigForm({ settings }: { settings: Settings }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const body = {
      whatsapp: String(fd.get("whatsapp") ?? "").trim(),
      facebook: String(fd.get("facebook") ?? "").trim(),
      instagram: String(fd.get("instagram") ?? "").trim(),
      tiktok: String(fd.get("tiktok") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      address: String(fd.get("address") ?? "").trim(),
      mapEmbedUrl: String(fd.get("mapEmbedUrl") ?? "").trim() || null,
      aboutHtml: String(fd.get("aboutHtml") ?? ""),
      servicesHtml: String(fd.get("servicesHtml") ?? ""),
    };
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Error");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div>
        <label className="text-xs font-medium text-zinc-500">WhatsApp (solo números o +57…)</label>
        <input
          name="whatsapp"
          defaultValue={settings.whatsapp}
          className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-zinc-500">Facebook URL</label>
          <input
            name="facebook"
            defaultValue={settings.facebook}
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-500">Instagram URL</label>
          <input
            name="instagram"
            defaultValue={settings.instagram}
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-zinc-500">TikTok URL</label>
          <input
            name="tiktok"
            defaultValue={settings.tiktok}
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-zinc-500">Correo de contacto</label>
        <input
          name="email"
          type="email"
          defaultValue={settings.email}
          className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-zinc-500">Dirección</label>
        <textarea
          name="address"
          rows={2}
          defaultValue={settings.address}
          className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-zinc-500">Mapa embebido (URL opcional)</label>
        <input
          name="mapEmbedUrl"
          defaultValue={settings.mapEmbedUrl ?? ""}
          className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-zinc-500">Quiénes somos (HTML simple)</label>
        <textarea
          name="aboutHtml"
          rows={5}
          defaultValue={settings.aboutHtml}
          className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 font-mono text-xs"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-zinc-500">Servicios (HTML simple)</label>
        <textarea
          name="servicesHtml"
          rows={5}
          defaultValue={settings.servicesHtml}
          className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 font-mono text-xs"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-500 disabled:opacity-60"
      >
        {pending ? "Guardando…" : "Guardar"}
      </button>
    </form>
  );
}
