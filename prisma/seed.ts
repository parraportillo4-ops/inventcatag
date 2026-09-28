import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 12);

  await prisma.adminUser.upsert({
    where: { email: "admin@santuariodelcelular.local" },
    update: { passwordHash },
    create: {
      email: "admin@santuariodelcelular.local",
      passwordHash,
      name: "Administrador",
    },
  });

  const cats = await Promise.all([
    prisma.category.upsert({
      where: { slug: "celulares" },
      update: {},
      create: {
        name: "Celulares",
        slug: "celulares",
        description: "Smartphones y teléfonos móviles",
      },
    }),
    prisma.category.upsert({
      where: { slug: "cargadores" },
      update: {},
      create: {
        name: "Cargadores",
        slug: "cargadores",
        description: "Cables, cabezas y bases de carga",
      },
    }),
    prisma.category.upsert({
      where: { slug: "auriculares" },
      update: {},
      create: {
        name: "Auriculares",
        slug: "auriculares",
        description: "Audio in-ear, over-ear y gaming",
      },
    }),
    prisma.category.upsert({
      where: { slug: "cables" },
      update: {},
      create: {
        name: "Cables",
        slug: "cables",
        description: "USB, lightning, tipo C y auxiliares",
      },
    }),
    prisma.category.upsert({
      where: { slug: "vidrios-templados" },
      update: {},
      create: {
        name: "Vidrios templados",
        slug: "vidrios-templados",
        description: "Protectores de pantalla",
      },
    }),
    prisma.category.upsert({
      where: { slug: "otros" },
      update: {},
      create: {
        name: "Otros accesorios",
        slug: "otros",
        description: "Forros, soportes y más",
      },
    }),
  ]);

  const bySlug = Object.fromEntries(cats.map((c) => [c.slug, c]));

  const products = [
    {
      slug: "samsung-galaxy-a15",
      name: "Samsung Galaxy A15",
      brand: "Samsung",
      categoryId: bySlug["celulares"].id,
      description:
        "Smartphone con pantalla Super AMOLED de 6.5 pulgadas, batería de larga duración y cámara triple.",
      characteristics:
        "Pantalla 6.5\", 128 GB almacenamiento, 4 GB RAM, Android 14, 4G.",
      price: 699000,
      stock: 4,
      images: [
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80",
      ],
    },
    {
      slug: "cargador-tipo-c-25w",
      name: "Cargador rápido USB-C 25W",
      brand: "Genérico premium",
      categoryId: bySlug["cargadores"].id,
      description: "Cargador de pared con salida USB-C Power Delivery 25W.",
      characteristics: "Entrada 100-240V, salida 5V/3A, 9V/2.77A, cable no incluido.",
      price: 45000,
      stock: 25,
      images: [
        "https://images.unsplash.com/photo-1583863788431-54a741f5bb0a?w=800&q=80",
      ],
    },
    {
      slug: "auriculares-bluetooth-deportivos",
      name: "Auriculares Bluetooth deportivos",
      brand: "SoundMax",
      categoryId: bySlug["auriculares"].id,
      description: "Auriculares in-ear con gancho y resistencia al sudor IPX5.",
      characteristics: "Bluetooth 5.3, hasta 8h de batería, estuche de carga.",
      price: 89000,
      stock: 15,
      images: [
        "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80",
      ],
    },
    {
      slug: "cable-usb-c-lightning-2m",
      name: "Cable USB-C a Lightning 2m",
      brand: "CablePro",
      categoryId: bySlug["cables"].id,
      description: "Cable reforzado para carga y sincronización compatible con iPhone.",
      characteristics: "Longitud 2m, nailon trenzado, certificación MFi (referencia).",
      price: 35000,
      stock: 40,
      images: [
        "https://images.unsplash.com/photo-1622434641406-af15804948f0?w=800&q=80",
      ],
    },
    {
      slug: "vidrio-templado-universal-65",
      name: "Vidrio templado universal 6.5\"",
      brand: "ProtectGlass",
      categoryId: bySlug["vidrios-templados"].id,
      description: "Protector de pantalla de vidrio templado 9H con kit de instalación.",
      characteristics: "Compatible con la mayoría de equipos 6.3\"-6.7\", borde 2.5D.",
      price: 18000,
      stock: 60,
      images: [
        "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&q=80",
      ],
    },
    {
      slug: "forro-silicona-transparente",
      name: "Forro silicona transparente",
      brand: "CaseFlex",
      categoryId: bySlug["otros"].id,
      description: "Forro flexible transparente anti amarilleo.",
      characteristics: "Material TPU, esquinas reforzadas, compatible varios modelos.",
      price: 22000,
      stock: 30,
      images: [
        "https://images.unsplash.com/photo-1603313052392-394a160f0d7a?w=800&q=80",
      ],
    },
  ];

  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        brand: p.brand,
        description: p.description,
        characteristics: p.characteristics,
        price: p.price,
        stock: p.stock,
        categoryId: p.categoryId,
      },
      create: {
        slug: p.slug,
        name: p.name,
        brand: p.brand,
        description: p.description,
        characteristics: p.characteristics,
        price: p.price,
        stock: p.stock,
        categoryId: p.categoryId,
      },
    });

    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    for (let i = 0; i < p.images.length; i++) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: p.images[i],
          alt: p.name,
          sortOrder: i,
        },
      });
    }

    await prisma.review.deleteMany({ where: { productId: product.id } });
  }

  const p1 = await prisma.product.findUnique({ where: { slug: "samsung-galaxy-a15" } });
  if (p1) {
    await prisma.review.create({
      data: {
        productId: p1.id,
        authorName: "Cliente frecuente",
        email: "cliente@ejemplo.com",
        rating: 5,
        comment: "Buen equipo y entrega rápida en Cereté.",
      },
    });
  }

  const now = new Date();
  const nextMonth = new Date(now);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  await prisma.promotion.deleteMany({});
  const promoProduct = await prisma.product.findUnique({
    where: { slug: "auriculares-bluetooth-deportivos" },
  });
  await prisma.promotion.create({
    data: {
      title: "Hot Sale accesorios",
      subtitle: "Hasta 15% en auriculares seleccionados",
      imageUrl:
        "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1200&q=80",
      linkUrl: promoProduct ? `/producto/${promoProduct.slug}` : "/catalogo",
      discountPercent: 15,
      startsAt: now,
      endsAt: nextMonth,
      active: true,
      productId: promoProduct?.id,
    },
  });

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      whatsapp: "573001234567",
      facebook: "https://facebook.com",
      instagram: "https://instagram.com",
      email: "contacto@santuariodelcelular.local",
      address: "Centro de Cereté, Córdoba, Colombia",
      aboutHtml:
        "<p><strong>El Santuario del Celular</strong> es un comercio emergente dedicado a accesorios para celulares, sonido y productos básicos para PC.</p>",
      servicesHtml:
        "<ul><li>Venta de accesorios y equipos</li><li>Asesoría en compra</li><li>Contacto por WhatsApp</li></ul>",
    },
  });

  console.log("Seed OK. Admin: admin@santuariodelcelular.local / admin123");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
