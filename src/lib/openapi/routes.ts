

import { z } from "zod";
import { registry } from "./registry";

// Esquemas de pedidos que ya tenemos definidos.
import {
  orderItemSchema,
  createOrderSchema,
  createOrderResponseSchema,
  orderValidationErrorSchema,
  orderBusinessErrorSchema,
  orderStockErrorSchema,
  orderServerErrorSchema,
} from "./schemas";

/**
 * =====================================================
 * 1. ESQUEMAS GENERALES Y RESPUESTAS
 * =====================================================
 */

const errorSchema = z.object({
  error: z.string(),
});

const successSchema = z.object({
  ok: z.boolean().optional(),
  message: z.string().optional(),
}).passthrough();

const genericObjectSchema = z.object({}).passthrough();

const genericArraySchema = z.array(genericObjectSchema);

const idParamsSchema = z.object({
  id: z.string().min(1),
});

const jsonBody = (schema: z.ZodTypeAny) => ({
  required: true,
  content: {
    "application/json": {
      schema,
    },
  },
});

const jsonResponse = (
  schema: z.ZodTypeAny,
  description: string
) => ({
  description,
  content: {
    "application/json": {
      schema,
    },
  },
});

/**
 * =====================================================
 * 2. ESQUEMAS DE PRODUCTOS
 * =====================================================
 */

const createProductSchema = z.object({
  name: z.string().min(2),
  slug: z.string()
    .min(2)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  brand: z.string().min(1),
  description: z.string().min(5),
  characteristics: z.string().min(3),
  price: z.number().positive(),
  costPrice: z.number().min(0).default(0),
  stock: z.number().int().min(0),
  minStock: z.number().int().min(0).default(0),
  categoryId: z.string(),
  imageUrls: z.array(z.string().url()).default([]),
});

const updateProductSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string()
    .min(2)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  brand: z.string().min(1).optional(),
  description: z.string().min(5).optional(),
  characteristics: z.string().min(3).optional(),
  price: z.number().positive().optional(),
  costPrice: z.number().min(0).optional(),
  stock: z.number().int().min(0).optional(),
  minStock: z.number().int().min(0).optional(),
  categoryId: z.string().optional(),
  active: z.boolean().optional(),
  imageUrls: z.array(z.string().url()).optional(),
});

/**
 * =====================================================
 * 3. ESQUEMAS DE INVENTARIO
 * =====================================================
 */

const createInventoryMovementSchema = z.object({
  productId: z.string().min(1),
  type: z.enum(["ENTRADA", "SALIDA"]),
  quantity: z.number().int().positive(),
  reason: z.string().trim().min(3).max(200),
});

const updateInventorySchema = z.object({
  costPrice: z.number().min(0).optional(),
  price: z.number().positive().optional(),
  minStock: z.number().int().min(0).optional(),
  supplierId: z.string().nullable().optional(),
});

/**
 * =====================================================
 * 4. ESQUEMAS DE PROMOCIONES
 * =====================================================
 */

const createPromotionSchema = z.object({
  title: z.string().min(2),
  subtitle: z.string().optional(),
  imageUrl: z.union([
    z.string().url(),
    z.literal(""),
  ]).optional(),
  linkUrl: z.string().optional(),
  discountPercent: z.number().int().min(0).max(100).optional(),
  startsAt: z.string().min(1),
  endsAt: z.string().min(1),
  productId: z.string().optional().nullable(),
});

/**
 * =====================================================
 * 5. ESQUEMAS DE PROVEEDORES
 * =====================================================
 */

const createSupplierSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().max(30).optional(),
  email: z.string().trim().email().optional().or(z.literal("")),
  address: z.string().trim().max(200).optional(),
});

/**
 * =====================================================
 * 6. ESQUEMAS DE CONFIGURACIÓN
 * =====================================================
 */

const updateSettingsSchema = z.object({
  whatsapp: z.string().optional(),
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  tiktok: z.string().optional(),
  email: z.union([
    z.string().email(),
    z.literal(""),
  ]).optional(),
  address: z.string().optional(),
  mapEmbedUrl: z.string().optional().nullable(),
  aboutHtml: z.string().optional(),
  servicesHtml: z.string().optional(),
});

/**
 * =====================================================
 * 7. ESQUEMAS DE VENTAS
 * =====================================================
 */

const saleItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
});

const createSaleSchema = z.object({
  customerName: z.string().min(1),
  email: z.string().min(1),
  phone: z.string().min(1),
  address: z.string().min(1),
  notes: z.string().optional(),
  items: z.array(saleItemSchema).min(1),
});

const salesQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
});

const salesResponseSchema = z.object({
  products: genericArraySchema,
  orders: genericArraySchema,
  tax: z.object({
    enabled: z.boolean(),
    rate: z.string(),
  }),
  totalUnitsSold: z.number(),
});

/**
 * =====================================================
 * 8. ESQUEMAS DE AUTENTICACIÓN
 * =====================================================
 */

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
});

const loginResponseSchema = z.object({
  ok: z.boolean(),
});

/**
 * =====================================================
 * 9. ESQUEMAS DE RESEÑAS VERIFICADAS
 * =====================================================
 */

const createReviewSchema = z.object({
  productId: z.string().min(1),
  orderNumber: z.string().trim().min(1),
  authorName: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(150),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(5).max(1000),
});

const reviewResponseSchema = z.object({
  ok: z.boolean(),
  message: z.string(),
  reviewId: z.string(),
});

/**
 * =====================================================
 * 10. ESQUEMAS DE CONTACTO
 * =====================================================
 */

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
});

/**
 * =====================================================
 * 11. REGISTRO DE ESQUEMAS EN OPENAPI
 * =====================================================
 */

registry.register("OrderItem", orderItemSchema);
registry.register("CreateOrderRequest", createOrderSchema);
registry.register("CreateOrderResponse", createOrderResponseSchema);

registry.register("CreateProductRequest", createProductSchema);
registry.register("UpdateProductRequest", updateProductSchema);

registry.register("CreateInventoryMovementRequest", createInventoryMovementSchema);
registry.register("UpdateInventoryRequest", updateInventorySchema);

registry.register("CreatePromotionRequest", createPromotionSchema);
registry.register("CreateSupplierRequest", createSupplierSchema);

registry.register("UpdateSettingsRequest", updateSettingsSchema);

registry.register("CreateSaleRequest", createSaleSchema);
registry.register("SalesResponse", salesResponseSchema);

registry.register("LoginRequest", loginSchema);
registry.register("LoginResponse", loginResponseSchema);

registry.register("CreateReviewRequest", createReviewSchema);
registry.register("ReviewResponse", reviewResponseSchema);

registry.register("ContactRequest", contactSchema);

/**
 * =====================================================
 * 12. PRODUCTOS ADMINISTRATIVOS
 * =====================================================
 */

// GET /api/admin/products
registry.registerPath({
  method: "get",
  path: "/api/admin/products",
  tags: ["Productos administrativos"],
  summary: "Consultar productos administrativos",
  description: "Obtiene todos los productos con sus categorías e imágenes. Requiere autenticación administrativa.",
  responses: {
    200: jsonResponse(genericArraySchema, "Lista de productos."),
    401: jsonResponse(errorSchema, "No autorizado."),
  },
});

// POST /api/admin/products
registry.registerPath({
  method: "post",
  path: "/api/admin/products",
  tags: ["Productos administrativos"],
  summary: "Registrar un producto",
  description: "Crea un producto con sus características, precios, existencias, categoría e imágenes.",
  request: {
    body: jsonBody(createProductSchema),
  },
  responses: {
    200: jsonResponse(genericObjectSchema, "Producto creado correctamente."),
    400: jsonResponse(errorSchema, "Datos inválidos o slug duplicado."),
    401: jsonResponse(errorSchema, "No autorizado."),
  },
});

// PATCH /api/admin/products/{id}
registry.registerPath({
  method: "patch",
  path: "/api/admin/products/{id}",
  tags: ["Productos administrativos"],
  summary: "Actualizar un producto",
  description: "Actualiza los datos del producto y permite reemplazar sus imágenes.",
  request: {
    params: idParamsSchema,
    body: jsonBody(updateProductSchema),
  },
  responses: {
    200: jsonResponse(genericObjectSchema, "Producto actualizado."),
    400: jsonResponse(errorSchema, "Datos inválidos o no se pudo actualizar."),
    401: jsonResponse(errorSchema, "No autorizado."),
  },
});

// DELETE /api/admin/products/{id}
registry.registerPath({
  method: "delete",
  path: "/api/admin/products/{id}",
  tags: ["Productos administrativos"],
  summary: "Desactivar un producto",
  description: "Realiza una eliminación lógica del producto, asignando deletedAt y active=false.",
  request: {
    params: idParamsSchema,
  },
  responses: {
    200: jsonResponse(successSchema, "Producto desactivado."),
    401: jsonResponse(errorSchema, "No autorizado."),
  },
});

/**
 * =====================================================
 * 13. INVENTARIO
 * =====================================================
 */

// GET /api/admin/inventario
registry.registerPath({
  method: "get",
  path: "/api/admin/inventario",
  tags: ["Inventario"],
  summary: "Consultar inventario",
  description: "Obtiene productos, proveedores y los últimos 100 movimientos de inventario.",
  responses: {
    200: jsonResponse(
      z.object({
        products: genericArraySchema,
        suppliers: genericArraySchema,
        movements: genericArraySchema,
      }),
      "Información del inventario."
    ),
    401: jsonResponse(errorSchema, "No autorizado."),
  },
});

// POST /api/admin/inventario
registry.registerPath({
  method: "post",
  path: "/api/admin/inventario",
  tags: ["Inventario"],
  summary: "Registrar movimiento de inventario",
  description: "Registra una entrada o salida de unidades y actualiza el stock del producto dentro de una transacción.",
  request: {
    body: jsonBody(createInventoryMovementSchema),
  },
  responses: {
    201: jsonResponse(genericObjectSchema, "Movimiento registrado."),
    400: jsonResponse(errorSchema, "Datos inválidos."),
    401: jsonResponse(errorSchema, "No autorizado."),
    404: jsonResponse(errorSchema, "Producto no disponible."),
    409: jsonResponse(errorSchema, "Stock insuficiente."),
    500: jsonResponse(errorSchema, "No se pudo registrar el movimiento."),
  },
});

// PATCH /api/admin/inventario/{id}
registry.registerPath({
  method: "patch",
  path: "/api/admin/inventario/{id}",
  tags: ["Inventario"],
  summary: "Actualizar información del inventario",
  description: "Actualiza el precio de compra, precio de venta, stock mínimo o proveedor de un producto.",
  request: {
    params: idParamsSchema,
    body: jsonBody(updateInventorySchema),
  },
  responses: {
    200: jsonResponse(genericObjectSchema, "Inventario actualizado."),
    400: jsonResponse(errorSchema, "Valores inválidos o proveedor no válido."),
    401: jsonResponse(errorSchema, "No autorizado."),
    404: jsonResponse(errorSchema, "Producto no encontrado."),
    500: jsonResponse(errorSchema, "No se pudo actualizar el inventario."),
  },
});

/**
 * =====================================================
 * 14. PROMOCIONES
 * =====================================================
 */

// GET /api/admin/promotions
registry.registerPath({
  method: "get",
  path: "/api/admin/promotions",
  tags: ["Promociones"],
  summary: "Consultar promociones",
  description: "Obtiene las promociones registradas ordenadas por fecha de creación.",
  responses: {
    200: jsonResponse(genericArraySchema, "Lista de promociones."),
    401: jsonResponse(errorSchema, "No autorizado."),
  },
});

// POST /api/admin/promotions
registry.registerPath({
  method: "post",
  path: "/api/admin/promotions",
  tags: ["Promociones"],
  summary: "Crear una promoción",
  description: "Crea una promoción con fechas de vigencia, descuento opcional y producto relacionado.",
  request: {
    body: jsonBody(createPromotionSchema),
  },
  responses: {
    200: jsonResponse(genericObjectSchema, "Promoción creada."),
    400: jsonResponse(errorSchema, "Datos inválidos o error al crear."),
    401: jsonResponse(errorSchema, "No autorizado."),
  },
});

// DELETE /api/admin/promotions/{id}
registry.registerPath({
  method: "delete",
  path: "/api/admin/promotions/{id}",
  tags: ["Promociones"],
  summary: "Eliminar una promoción",
  description: "Elimina una promoción mediante su identificador.",
  request: {
    params: idParamsSchema,
  },
  responses: {
    200: jsonResponse(successSchema, "Promoción eliminada."),
    401: jsonResponse(errorSchema, "No autorizado."),
  },
});

/**
 * =====================================================
 * 15. VENTAS ADMINISTRATIVAS
 * =====================================================
 */

// GET /api/admin/ventas
registry.registerPath({
  method: "get",
  path: "/api/admin/ventas",
  tags: ["Ventas"],
  summary: "Consultar ventas y estadísticas",
  description: "Obtiene productos activos, pedidos, configuración del IVA y unidades vendidas. Permite filtrar por fechas.",
  request: {
    query: salesQuerySchema,
  },
  responses: {
    200: jsonResponse(salesResponseSchema, "Información de ventas y estadísticas."),
    400: jsonResponse(errorSchema, "Fecha inválida o periodo incorrecto."),
    401: jsonResponse(errorSchema, "No autorizado."),
    500: jsonResponse(errorSchema, "No fue posible consultar las ventas."),
  },
});

// POST /api/admin/ventas
registry.registerPath({
  method: "post",
  path: "/api/admin/ventas",
  tags: ["Ventas"],
  summary: "Registrar venta administrativa",
  description: "Registra una venta presencial en efectivo, descuenta inventario, crea los detalles de venta y genera una factura.",
  request: {
    body: jsonBody(createSaleSchema),
  },
  responses: {
    201: jsonResponse(
      z.object({
        message: z.string(),
        order: genericObjectSchema,
        invoice: genericObjectSchema,
      }),
      "Venta y factura registradas."
    ),
    400: jsonResponse(errorSchema, "Datos de cliente o productos inválidos."),
    401: jsonResponse(errorSchema, "No autorizado."),
    409: jsonResponse(errorSchema, "Stock insuficiente."),
    500: jsonResponse(errorSchema, "No fue posible registrar la venta."),
  },
});

// POST /api/admin/ventas/{id}/confirmar
registry.registerPath({
  method: "post",
  path: "/api/admin/ventas/{id}/confirmar",
  tags: ["Ventas"],
  summary: "Confirmar pedido y generar factura",
  description: "Confirma un pedido pendiente, descuenta el inventario, registra movimientos y genera la factura correspondiente.",
  request: {
    params: idParamsSchema,
  },
  responses: {
    200: jsonResponse(
      z.object({
        message: z.string(),
        orderNumber: z.string(),
        invoiceNumber: z.string(),
      }),
      "Pago confirmado y factura generada."
    ),
    401: jsonResponse(errorSchema, "No autorizado."),
    409: jsonResponse(errorSchema, "El pedido no puede procesarse o no existe stock suficiente."),
    500: jsonResponse(errorSchema, "No fue posible confirmar el pago."),
  },
});

/**
 * =====================================================
 * 16. FACTURAS
 * =====================================================
 */

// GET /api/admin/facturas
registry.registerPath({
  method: "get",
  path: "/api/admin/facturas",
  tags: ["Facturación"],
  summary: "Consultar facturas",
  description: "Obtiene las facturas pagadas en efectivo. Permite filtrar por fecha de emisión.",
  request: {
    query: salesQuerySchema,
  },
  responses: {
    200: jsonResponse(
      z.object({
        invoices: genericArraySchema,
      }),
      "Lista de facturas."
    ),
    400: jsonResponse(errorSchema, "Fecha inválida o periodo incorrecto."),
    401: jsonResponse(errorSchema, "No autorizado."),
  },
});

// GET /api/admin/facturas/{id}
registry.registerPath({
  method: "get",
  path: "/api/admin/facturas/{id}",
  tags: ["Facturación"],
  summary: "Consultar factura específica",
  description: "Obtiene una factura con los datos del cliente, pedido y productos incluidos.",
  request: {
    params: idParamsSchema,
  },
  responses: {
    200: jsonResponse(
      z.object({
        invoice: genericObjectSchema,
      }),
      "Detalle de la factura."
    ),
    401: jsonResponse(errorSchema, "No autorizado."),
    404: jsonResponse(errorSchema, "Factura no encontrada."),
  },
});

/**
 * =====================================================
 * 17. PROVEEDORES
 * =====================================================
 */

// GET /api/admin/proveedores
registry.registerPath({
  method: "get",
  path: "/api/admin/proveedores",
  tags: ["Proveedores"],
  summary: "Consultar proveedores",
  description: "Obtiene los proveedores registrados ordenados por nombre.",
  responses: {
    200: jsonResponse(genericArraySchema, "Lista de proveedores."),
    401: jsonResponse(errorSchema, "No autorizado."),
  },
});

// POST /api/admin/proveedores
registry.registerPath({
  method: "post",
  path: "/api/admin/proveedores",
  tags: ["Proveedores"],
  summary: "Registrar proveedor",
  description: "Registra un proveedor con nombre y datos de contacto opcionales.",
  request: {
    body: jsonBody(createSupplierSchema),
  },
  responses: {
    201: jsonResponse(genericObjectSchema, "Proveedor registrado."),
    400: jsonResponse(errorSchema, "Datos del proveedor inválidos."),
    401: jsonResponse(errorSchema, "No autorizado."),
    500: jsonResponse(errorSchema, "No se pudo registrar el proveedor."),
  },
});

/**
 * =====================================================
 * 18. CONFIGURACIÓN DEL SITIO
 * =====================================================
 */

// GET /api/admin/settings
registry.registerPath({
  method: "get",
  path: "/api/admin/settings",
  tags: ["Configuración"],
  summary: "Consultar configuración",
  description: "Obtiene la configuración general del sitio. Si no existe, crea la configuración inicial.",
  responses: {
    200: jsonResponse(genericObjectSchema, "Configuración del sitio."),
    401: jsonResponse(errorSchema, "No autorizado."),
  },
});

// PATCH /api/admin/settings
registry.registerPath({
  method: "patch",
  path: "/api/admin/settings",
  tags: ["Configuración"],
  summary: "Actualizar configuración",
  description: "Actualiza la información de contacto, redes sociales, dirección, mapa y contenido institucional.",
  request: {
    body: jsonBody(updateSettingsSchema),
  },
  responses: {
    200: jsonResponse(genericObjectSchema, "Configuración actualizada."),
    400: jsonResponse(errorSchema, "No se pudo guardar la configuración."),
    401: jsonResponse(errorSchema, "No autorizado."),
  },
});

/**
 * =====================================================
 * 19. AUTENTICACIÓN ADMINISTRATIVA
 * =====================================================
 */

// POST /api/auth/login
registry.registerPath({
  method: "post",
  path: "/api/auth/login",
  tags: ["Autenticación"],
  summary: "Iniciar sesión administrativa",
  description: "Valida el correo y la contraseña del administrador y establece una cookie de sesión HTTP-only.",
  request: {
    body: jsonBody(loginSchema),
  },
  responses: {
    200: jsonResponse(loginResponseSchema, "Sesión iniciada correctamente."),
    400: jsonResponse(errorSchema, "Datos inválidos."),
    401: jsonResponse(errorSchema, "Credenciales incorrectas."),
    500: jsonResponse(errorSchema, "Error del servidor."),
  },
});

// POST /api/auth/logout
registry.registerPath({
  method: "post",
  path: "/api/auth/logout",
  tags: ["Autenticación"],
  summary: "Cerrar sesión administrativa",
  description: "Elimina la cookie de autenticación administrativa.",
  responses: {
    200: jsonResponse(loginResponseSchema, "Sesión cerrada correctamente."),
  },
});

/**
 * =====================================================
 * 20. PEDIDOS DE CLIENTES
 * =====================================================
 */

// POST /api/orders
registry.registerPath({
  method: "post",
  path: "/api/orders",
  tags: ["Pedidos"],
  summary: "Registrar pedido de cliente",
  description: "Registra un pedido, valida los productos, comprueba el stock y calcula subtotal, IVA y total. El pedido queda inicialmente PENDIENTE y el pago es en efectivo.",
  request: {
    body: jsonBody(createOrderSchema),
  },
  responses: {
    201: jsonResponse(createOrderResponseSchema, "Pedido registrado correctamente."),
    400: jsonResponse(
      z.union([
        orderValidationErrorSchema,
        orderBusinessErrorSchema,
      ]),
      "Datos inválidos, producto no disponible o IVA incorrecto."
    ),
    409: jsonResponse(orderStockErrorSchema, "Stock insuficiente."),
    500: jsonResponse(orderServerErrorSchema, "No fue posible registrar el pedido."),
  },
});

/**
 * =====================================================
 * 21. RESEÑAS VERIFICADAS
 * =====================================================
 */

// POST /api/reviews
registry.registerPath({
  method: "post",
  path: "/api/reviews",
  tags: ["Reseñas"],
  summary: "Registrar reseña verificada",
  description: "Registra una reseña vinculada a una compra real. Comprueba el número de pedido, correo del comprador, pago y pertenencia del producto al pedido. Evita reseñas duplicadas.",
  request: {
    body: jsonBody(createReviewSchema),
  },
  responses: {
    201: jsonResponse(reviewResponseSchema, "Reseña registrada correctamente."),
    400: jsonResponse(errorSchema, "Revisa los datos ingresados."),
    403: jsonResponse(errorSchema, "El comprador no cumple las condiciones para opinar."),
    404: jsonResponse(errorSchema, "Pedido o producto no encontrado."),
    409: jsonResponse(errorSchema, "Ya existe una reseña para esta compra y producto."),
    500: jsonResponse(errorSchema, "Error interno al registrar la reseña."),
  },
});

/**
 * =====================================================
 * 22. MENSAJES DE CONTACTO
 * =====================================================
 */

// POST /api/contact
registry.registerPath({
  method: "post",
  path: "/api/contact",
  tags: ["Contacto"],
  summary: "Registrar mensaje de contacto",
  description: "Valida y guarda un mensaje enviado desde el formulario de contacto del sitio.",
  request: {
    body: jsonBody(contactSchema),
  },
  responses: {
    200: jsonResponse(
      z.object({
        ok: z.boolean(),
      }),
      "Mensaje registrado correctamente."
    ),
    400: jsonResponse(errorSchema, "Datos inválidos."),
    500: jsonResponse(errorSchema, "Error del servidor."),
  },
});
