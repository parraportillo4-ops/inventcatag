
import { z } from "zod";

/**
 * ==========================================
 * PEDIDOS - POST /api/orders
 * ==========================================
 *
 * Estos esquemas reproducen las validaciones
 * que actualmente existen en:
 * src/app/api/orders/route.ts
 */

// Producto incluido en el pedido
export const orderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1),
});

// Datos que recibe la API para registrar un pedido
export const createOrderSchema = z.object({
  customerName: z.string().trim().min(2, "Nombre inválido"),
  email: z.string().trim().email("Correo inválido"),
  phone: z.string().trim().min(7, "Teléfono inválido"),
  address: z.string().trim().min(5, "Dirección inválida"),
  notes: z.string().optional(),
  paymentMethod: z.literal("EFECTIVO"),
  items: z.array(orderItemSchema).min(1),
});

// Respuesta exitosa: HTTP 201
export const createOrderResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  orderNumber: z.string(),
  status: z.string(),
  paymentMethod: z.literal("EFECTIVO"),
  total: z.string(),
});

// Error de validación: HTTP 400
export const orderValidationErrorSchema = z.object({
  error: z.literal("Datos inválidos"),
  details: z.array(
    z.object({
      field: z.string(),
      message: z.string(),
    })
  ),
});

// Errores HTTP 400 adicionales
export const orderBusinessErrorSchema = z.object({
  error: z.enum([
    "Uno de los productos ya no está disponible",
    "La configuración del IVA no es válida",
  ]),
});

// Error HTTP 409: stock insuficiente
export const orderStockErrorSchema = z.object({
  error: z.string(),
});

// Error HTTP 500
export const orderServerErrorSchema = z.object({
  error: z.literal("No fue posible registrar el pedido"),
});
