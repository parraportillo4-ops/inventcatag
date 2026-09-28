import { prisma } from "@/lib/prisma";

export const metadata = { title: "Quiénes somos" };

export default async function NosotrosPage() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-zinc-900">Quiénes somos</h1>
      <div
        className="mt-6 space-y-3 text-sm leading-relaxed text-zinc-600 [&_p]:mb-2"
        dangerouslySetInnerHTML={{
          __html:
            settings?.aboutHtml ||
            "<p>El Santuario del Celular es un comercio en el centro de Cereté dedicado a accesorios y tecnología.</p>",
        }}
      />
    </div>
  );
}
