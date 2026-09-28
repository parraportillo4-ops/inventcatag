import Link from "next/link";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";

export default function AdminHomePage() {
  const links = [
    { href: "/admin/productos", label: "Productos e inventario", desc: "CRUD, stock y fotos (URL)" },
    { href: "/admin/promociones", label: "Promociones", desc: "Ofertas con fechas en inicio" },
    { href: "/admin/configuracion", label: "Contacto y redes", desc: "WhatsApp, correo, textos informativos" },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-zinc-900">Panel</h1>
      <p className="mt-1 text-sm text-zinc-600">
        Gestión del catálogo alineada al documento de requisitos (RF05, H14–H16).
      </p>
      <ul className="mt-8 space-y-3">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="block rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-orange-200 hover:bg-orange-50/50"
            >
              <span className="font-semibold text-zinc-900">{l.label}</span>
              <p className="mt-1 text-sm text-zinc-600">{l.desc}</p>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-10">
        <AdminLogoutButton />
      </div>
    </div>
  );
}
