import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-100">
      <div className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-3">
          <Link href="/admin" className="font-semibold text-zinc-900">
            Panel · Santuario
          </Link>
          <nav className="flex flex-wrap gap-3 text-sm">
            <Link href="/admin/productos" className="text-zinc-600 hover:text-orange-600">
              Productos
            </Link>
            <Link href="/admin/promociones" className="text-zinc-600 hover:text-orange-600">
              Promociones
            </Link>
            <Link href="/admin/configuracion" className="text-zinc-600 hover:text-orange-600">
              Configuración
            </Link>
            <Link href="/" className="text-zinc-400 hover:text-orange-600">
              Ver tienda
            </Link>
          </nav>
        </div>
      </div>
      {children}
    </div>
  );
}
