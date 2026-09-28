import { prisma } from "@/lib/prisma";
import { ConfigForm } from "@/components/admin/ConfigForm";

export default async function AdminConfigPage() {
  const settings =
    (await prisma.siteSettings.findUnique({ where: { id: "singleton" } })) ??
    (await prisma.siteSettings.create({ data: { id: "singleton" } }));

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-zinc-900">Configuración del sitio</h1>
      <p className="mt-1 text-sm text-zinc-600">
        WhatsApp, redes, correo y textos de «Quiénes somos» y «Servicios» (H16).
      </p>
      <ConfigForm settings={settings} />
    </div>
  );
}
