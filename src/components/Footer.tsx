import Link from "next/link";
import { prisma } from "@/lib/prisma";

export async function Footer() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
  });
  const wa = settings?.whatsapp?.replace(/\D/g, "") ?? "";
  const waHref = wa ? `https://wa.me/${wa}` : "#";

  return (
    <footer className="mt-auto border-t border-zinc-200 bg-zinc-900 text-zinc-100">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <p className="font-semibold text-white">El Santuario del Celular</p>
          <p className="mt-2 text-sm text-zinc-400">
            Accesorios para celulares, sonido y computo. Visítanos en el centro de Cereté.
          </p>
        </div>
        <div>
          <p className="font-semibold text-white">Enlaces</p>
          <ul className="mt-2 space-y-1 text-sm">
            <li>
              <Link href="/catalogo" className="text-zinc-400 hover:text-white">
                Catálogo
              </Link>
            </li>
            <li>
              <Link href="/contacto" className="text-zinc-400 hover:text-white">
                Contacto
              </Link>
            </li>
            <li>
              <Link href="/politica-privacidad" className="text-zinc-400 hover:text-white">
                Privacidad
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-white">Contacto rápido</p>
          <p className="mt-2 text-sm text-zinc-400">{settings?.address}</p>
          {settings?.email && (
            <a
              href={`mailto:${settings.email}`}
              className="mt-1 block text-sm text-orange-400 hover:underline"
            >
              {settings.email}
            </a>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {wa && (
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-500"
              >
                WhatsApp
              </a>
            )}
            {settings?.facebook && (
              <a
                href={settings.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-zinc-600 px-3 py-1.5 text-xs hover:bg-zinc-800"
              >
                Facebook
              </a>
            )}
            {settings?.instagram && (
              <a
                href={settings.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-zinc-600 px-3 py-1.5 text-xs hover:bg-zinc-800"
              >
                Instagram
              </a>
            )}
          </div>
        </div>
      </div>
      <div className="border-t border-zinc-800 py-4 text-center text-xs text-zinc-500">
        © {new Date().getFullYear()} El Santuario del Celular · Proyecto académico
      </div>
    </footer>
  );
}
