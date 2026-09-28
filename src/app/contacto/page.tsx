import { prisma } from "@/lib/prisma";
import { ContactForm } from "@/components/ContactForm";

export const metadata = { title: "Contacto" };

export default async function ContactoPage() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
  });
  const wa = settings?.whatsapp?.replace(/\D/g, "") ?? "";

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold text-zinc-900">Contacto</h1>
      <p className="mt-2 text-zinc-600">
        Escríbenos por el formulario o por WhatsApp y redes. Referencia del documento de
        requisitos: contacto rápido y formulario interno.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-zinc-900">Datos</h2>
          <p className="mt-2 text-sm text-zinc-600">{settings?.address}</p>
          {settings?.email && (
            <a
              href={`mailto:${settings.email}`}
              className="mt-2 inline-block text-sm font-medium text-orange-600 hover:underline"
            >
              {settings.email}
            </a>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {wa && (
              <a
                href={`https://wa.me/${wa}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500"
              >
                Abrir WhatsApp
              </a>
            )}
            {settings?.facebook && (
              <a
                href={settings.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-zinc-200 px-4 py-2 text-sm hover:bg-zinc-50"
              >
                Facebook
              </a>
            )}
            {settings?.instagram && (
              <a
                href={settings.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-zinc-200 px-4 py-2 text-sm hover:bg-zinc-50"
              >
                Instagram
              </a>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-zinc-900">Formulario</h2>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
