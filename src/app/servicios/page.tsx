import { prisma } from "@/lib/prisma";

export const metadata = { title: "Servicios" };

export default async function ServiciosPage() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-zinc-900">Servicios</h1>
      <div
        className="mt-6 text-sm leading-relaxed text-zinc-600 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1"
        dangerouslySetInnerHTML={{
          __html:
            settings?.servicesHtml ||
            "<ul><li>Venta de accesorios y equipos</li><li>Asesoría</li><li>Atención por WhatsApp</li></ul>",
        }}
      />
    </div>
  );
}
