"use client";

import { useState } from "react";

export function ContactForm() {
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setMsg(null);
    const fd = new FormData(e.currentTarget);
    const body = {
      name: String(fd.get("name") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      message: String(fd.get("message") ?? "").trim(),
    };
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "No se pudo enviar");
      setMsg("Mensaje recibido. Te contactaremos pronto.");
      e.currentTarget.reset();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Error");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-3">
      <div>
        <label className="text-xs font-medium text-zinc-500">Nombre</label>
        <input
          name="name"
          required
          className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-zinc-500">Correo</label>
        <input
          name="email"
          type="email"
          required
          className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-zinc-500">Mensaje</label>
        <textarea
          name="message"
          required
          rows={4}
          className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-orange-600 py-2.5 text-sm font-semibold text-white hover:bg-orange-500 disabled:opacity-60"
      >
        {pending ? "Enviando…" : "Enviar"}
      </button>
      {msg && (
        <p
          className={`text-sm ${msg.startsWith("Mensaje") ? "text-green-700" : "text-red-600"}`}
        >
          {msg}
        </p>
      )}
    </form>
  );
}
