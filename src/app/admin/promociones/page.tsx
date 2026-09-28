import { prisma } from "@/lib/prisma";
import { PromotionAdminForm } from "@/components/admin/PromotionAdminForm";
import { PromotionsTable } from "@/components/admin/PromotionsTable";

export default async function AdminPromocionesPage() {
  const [promotions, products] = await Promise.all([
    prisma.promotion.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.product.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold text-zinc-900">Promociones</h1>
      <p className="mt-1 text-sm text-zinc-600">
        Solo se muestran en inicio las que están activas y dentro del rango de fechas.
      </p>
      <PromotionAdminForm products={products} />
      <PromotionsTable initial={promotions} />
    </div>
  );
}
