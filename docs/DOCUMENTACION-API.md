# InventCatag API

**Versión:** 1.0.0  
**Descripción:** Documentación técnica de los servicios API de InventCatag.  
**Servidor base:** `http://localhost:3000`  
**Entorno:** Servidor local de desarrollo

## 1. Introducción

Este documento describe los servicios HTTP expuestos por la API según la especificación OpenAPI suministrada. Incluye rutas, métodos, parámetros, cuerpos de solicitud, respuestas y restricciones de los esquemas.

> La documentación refleja lo declarado en el archivo OpenAPI. Cuando una respuesta presenta un objeto sin propiedades detalladas (`properties: {}`), la estructura interna no está especificada en la fuente y no se completa por inferencia.

## 2. Resumen de endpoints

| Método | Ruta | Operación | Grupo |
|---|---|---|---|
| **GET** | `/api/admin/products` | Consultar productos administrativos | Productos administrativos |
| **POST** | `/api/admin/products` | Registrar un producto | Productos administrativos |
| **PATCH** | `/api/admin/products/{id}` | Actualizar un producto | Productos administrativos |
| **DELETE** | `/api/admin/products/{id}` | Desactivar un producto | Productos administrativos |
| **GET** | `/api/admin/inventario` | Consultar inventario | Inventario |
| **POST** | `/api/admin/inventario` | Registrar movimiento de inventario | Inventario |
| **PATCH** | `/api/admin/inventario/{id}` | Actualizar información del inventario | Inventario |
| **GET** | `/api/admin/promotions` | Consultar promociones | Promociones |
| **POST** | `/api/admin/promotions` | Crear una promoción | Promociones |
| **DELETE** | `/api/admin/promotions/{id}` | Eliminar una promoción | Promociones |
| **GET** | `/api/admin/ventas` | Consultar ventas y estadísticas | Ventas |
| **POST** | `/api/admin/ventas` | Registrar venta administrativa | Ventas |
| **POST** | `/api/admin/ventas/{id}/confirmar` | Confirmar pedido y generar factura | Ventas |
| **GET** | `/api/admin/facturas` | Consultar facturas | Facturación |
| **GET** | `/api/admin/facturas/{id}` | Consultar factura específica | Facturación |
| **GET** | `/api/admin/proveedores` | Consultar proveedores | Proveedores |
| **POST** | `/api/admin/proveedores` | Registrar proveedor | Proveedores |
| **GET** | `/api/admin/settings` | Consultar configuración | Configuración |
| **PATCH** | `/api/admin/settings` | Actualizar configuración | Configuración |
| **POST** | `/api/auth/login` | Iniciar sesión administrativa | Autenticación |
| **POST** | `/api/auth/logout` | Cerrar sesión administrativa | Autenticación |
| **POST** | `/api/orders` | Registrar pedido de cliente | Pedidos |
| **POST** | `/api/reviews` | Registrar reseña verificada | Reseñas |
| **POST** | `/api/contact` | Registrar mensaje de contacto | Contacto |

## 3. Detalle de los endpoints

### 3.1. Consultar productos administrativos

**Método:** `GET`  
**Ruta:** `/api/admin/products`  
**Grupo:** Productos administrativos  
**Descripción:** Obtiene todos los productos con sus categorías e imágenes. Requiere autenticación administrativa.

**Respuestas**

| Código | Descripción |
|:---:|---|
| `200` | Lista de productos. |
| `401` | No autorizado. |

**Esquema de respuesta `200` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `elementos` | array<objeto> | No | — |
| `[]` | objeto | — | — |

**Esquema de respuesta `401` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `error` | cadena | Sí | — |

---

### 3.2. Registrar un producto

**Método:** `POST`  
**Ruta:** `/api/admin/products`  
**Grupo:** Productos administrativos  
**Descripción:** Crea un producto con sus características, precios, existencias, categoría e imágenes.

**Cuerpo de la solicitud**

- Obligatorio: **Sí**

Tipo de contenido: `application/json`

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `name` | cadena | Sí | mín. 2 caracteres |
| `slug` | cadena | Sí | mín. 2 caracteres; patrón: `^[a-z0-9]+(?:-[a-z0-9]+)*$` |
| `brand` | cadena | Sí | mín. 1 caracteres |
| `description` | cadena | Sí | mín. 5 caracteres |
| `characteristics` | cadena | Sí | mín. 3 caracteres |
| `price` | número | Sí | mínimo 0 (exclusivo) |
| `costPrice` | número | No | mínimo 0; predeterminado: `0` |
| `stock` | entero | Sí | mínimo 0 |
| `minStock` | entero | No | mínimo 0; predeterminado: `0` |
| `categoryId` | cadena | Sí | — |
| `imageUrls` | array<cadena> | No | predeterminado: `[]` |
| `imageUrls[]` | cadena | — | formato: `uri` |

**Respuestas**

| Código | Descripción |
|:---:|---|
| `200` | Producto creado correctamente. |
| `400` | Datos inválidos o slug duplicado. |
| `401` | No autorizado. |

**Esquema de respuesta `200` (application/json)**

_El esquema no especifica propiedades detalladas._

**Esquema de respuesta `400` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `error` | cadena | Sí | — |

**Esquema de respuesta `401` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `error` | cadena | Sí | — |

---

### 3.3. Actualizar un producto

**Método:** `PATCH`  
**Ruta:** `/api/admin/products/{id}`  
**Grupo:** Productos administrativos  
**Descripción:** Actualiza los datos del producto y permite reemplazar sus imágenes.

**Parámetros**

| Nombre | Ubicación | Tipo | Obligatorio | Restricciones |
|---|---|---|:---:|---|
| `id` | `path` | cadena | Sí | mín. 1 caracteres |

**Cuerpo de la solicitud**

- Obligatorio: **Sí**

Tipo de contenido: `application/json`

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `name` | cadena | No | mín. 2 caracteres |
| `slug` | cadena | No | mín. 2 caracteres; patrón: `^[a-z0-9]+(?:-[a-z0-9]+)*$` |
| `brand` | cadena | No | mín. 1 caracteres |
| `description` | cadena | No | mín. 5 caracteres |
| `characteristics` | cadena | No | mín. 3 caracteres |
| `price` | número | No | mínimo 0 (exclusivo) |
| `costPrice` | número | No | mínimo 0 |
| `stock` | entero | No | mínimo 0 |
| `minStock` | entero | No | mínimo 0 |
| `categoryId` | cadena | No | — |
| `active` | booleano | No | — |
| `imageUrls` | array<cadena> | No | — |
| `imageUrls[]` | cadena | — | formato: `uri` |

**Respuestas**

| Código | Descripción |
|:---:|---|
| `200` | Producto actualizado. |
| `400` | Datos inválidos o no se pudo actualizar. |
| `401` | No autorizado. |

**Esquema de respuesta `200` (application/json)**

_El esquema no especifica propiedades detalladas._

**Esquema de respuesta `400` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `error` | cadena | Sí | — |

**Esquema de respuesta `401` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `error` | cadena | Sí | — |

---

### 3.4. Desactivar un producto

**Método:** `DELETE`  
**Ruta:** `/api/admin/products/{id}`  
**Grupo:** Productos administrativos  
**Descripción:** Realiza una eliminación lógica del producto, asignando deletedAt y active=false.

**Parámetros**

| Nombre | Ubicación | Tipo | Obligatorio | Restricciones |
|---|---|---|:---:|---|
| `id` | `path` | cadena | Sí | mín. 1 caracteres |

**Respuestas**

| Código | Descripción |
|:---:|---|
| `200` | Producto desactivado. |
| `401` | No autorizado. |

**Esquema de respuesta `200` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `ok` | booleano | No | — |
| `message` | cadena | No | — |

**Esquema de respuesta `401` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `error` | cadena | Sí | — |

---

### 3.5. Consultar inventario

**Método:** `GET`  
**Ruta:** `/api/admin/inventario`  
**Grupo:** Inventario  
**Descripción:** Obtiene productos, proveedores y los últimos 100 movimientos de inventario.

**Respuestas**

| Código | Descripción |
|:---:|---|
| `200` | Información del inventario. |
| `401` | No autorizado. |

**Esquema de respuesta `200` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `products` | array<objeto> | Sí | — |
| `products[]` | objeto | — | — |
| `suppliers` | array<objeto> | Sí | — |
| `suppliers[]` | objeto | — | — |
| `movements` | array<objeto> | Sí | — |
| `movements[]` | objeto | — | — |

**Esquema de respuesta `401` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `error` | cadena | Sí | — |

---

### 3.6. Registrar movimiento de inventario

**Método:** `POST`  
**Ruta:** `/api/admin/inventario`  
**Grupo:** Inventario  
**Descripción:** Registra una entrada o salida de unidades y actualiza el stock del producto dentro de una transacción.

**Cuerpo de la solicitud**

- Obligatorio: **Sí**

Tipo de contenido: `application/json`

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `productId` | cadena | Sí | mín. 1 caracteres |
| `type` | cadena | Sí | valores: `ENTRADA`, `SALIDA` |
| `quantity` | entero | Sí | mínimo 0 (exclusivo) |
| `reason` | cadena | Sí | mín. 3 caracteres; máx. 200 caracteres |

**Respuestas**

| Código | Descripción |
|:---:|---|
| `201` | Movimiento registrado. |
| `400` | Datos inválidos. |
| `401` | No autorizado. |
| `404` | Producto no disponible. |
| `409` | Stock insuficiente. |
| `500` | No se pudo registrar el movimiento. |

**Esquema de respuesta `201` (application/json)**

_El esquema no especifica propiedades detalladas._

**Esquema de respuesta `400` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `error` | cadena | Sí | — |

**Esquema de respuesta `401` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `error` | cadena | Sí | — |

**Esquema de respuesta `404` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `error` | cadena | Sí | — |

**Esquema de respuesta `409` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `error` | cadena | Sí | — |

**Esquema de respuesta `500` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `error` | cadena | Sí | — |

---

### 3.7. Actualizar información del inventario

**Método:** `PATCH`  
**Ruta:** `/api/admin/inventario/{id}`  
**Grupo:** Inventario  
**Descripción:** Actualiza el precio de compra, precio de venta, stock mínimo o proveedor de un producto.

**Parámetros**

| Nombre | Ubicación | Tipo | Obligatorio | Restricciones |
|---|---|---|:---:|---|
| `id` | `path` | cadena | Sí | mín. 1 caracteres |

**Cuerpo de la solicitud**

- Obligatorio: **Sí**

Tipo de contenido: `application/json`

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `costPrice` | número | No | mínimo 0 |
| `price` | número | No | mínimo 0 (exclusivo) |
| `minStock` | entero | No | mínimo 0 |
| `supplierId` | cadena | No | admite `null` |

**Respuestas**

| Código | Descripción |
|:---:|---|
| `200` | Inventario actualizado. |
| `400` | Valores inválidos o proveedor no válido. |
| `401` | No autorizado. |
| `404` | Producto no encontrado. |
| `500` | No se pudo actualizar el inventario. |

**Esquema de respuesta `200` (application/json)**

_El esquema no especifica propiedades detalladas._

**Esquema de respuesta `400` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `error` | cadena | Sí | — |

**Esquema de respuesta `401` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `error` | cadena | Sí | — |

**Esquema de respuesta `404` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `error` | cadena | Sí | — |

**Esquema de respuesta `500` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `error` | cadena | Sí | — |

---

### 3.8. Consultar promociones

**Método:** `GET`  
**Ruta:** `/api/admin/promotions`  
**Grupo:** Promociones  
**Descripción:** Obtiene las promociones registradas ordenadas por fecha de creación.

**Respuestas**

| Código | Descripción |
|:---:|---|
| `200` | Lista de promociones. |
| `401` | No autorizado. |

**Esquema de respuesta `200` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `elementos` | array<objeto> | No | — |
| `[]` | objeto | — | — |

**Esquema de respuesta `401` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `error` | cadena | Sí | — |

---

### 3.9. Crear una promoción

**Método:** `POST`  
**Ruta:** `/api/admin/promotions`  
**Grupo:** Promociones  
**Descripción:** Crea una promoción con fechas de vigencia, descuento opcional y producto relacionado.

**Cuerpo de la solicitud**

- Obligatorio: **Sí**

Tipo de contenido: `application/json`

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `title` | cadena | Sí | mín. 2 caracteres |
| `subtitle` | cadena | No | — |
| `imageUrl` | cadena o cadena | No | — |
| `linkUrl` | cadena | No | — |
| `discountPercent` | entero | No | mínimo 0; máximo 100 |
| `startsAt` | cadena | Sí | mín. 1 caracteres |
| `endsAt` | cadena | Sí | mín. 1 caracteres |
| `productId` | cadena | No | admite `null` |

**Respuestas**

| Código | Descripción |
|:---:|---|
| `200` | Promoción creada. |
| `400` | Datos inválidos o error al crear. |
| `401` | No autorizado. |

**Esquema de respuesta `200` (application/json)**

_El esquema no especifica propiedades detalladas._

**Esquema de respuesta `400` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `error` | cadena | Sí | — |

**Esquema de respuesta `401` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `error` | cadena | Sí | — |

---

### 3.10. Eliminar una promoción

**Método:** `DELETE`  
**Ruta:** `/api/admin/promotions/{id}`  
**Grupo:** Promociones  
**Descripción:** Elimina una promoción mediante su identificador.

**Parámetros**

| Nombre | Ubicación | Tipo | Obligatorio | Restricciones |
|---|---|---|:---:|---|
| `id` | `path` | cadena | Sí | mín. 1 caracteres |

**Respuestas**

| Código | Descripción |
|:---:|---|
| `200` | Promoción eliminada. |
| `401` | No autorizado. |

**Esquema de respuesta `200` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `ok` | booleano | No | — |
| `message` | cadena | No | — |

**Esquema de respuesta `401` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `error` | cadena | Sí | — |

---

### 3.11. Consultar ventas y estadísticas

**Método:** `GET`  
**Ruta:** `/api/admin/ventas`  
**Grupo:** Ventas  
**Descripción:** Obtiene productos activos, pedidos, configuración del IVA y unidades vendidas. Permite filtrar por fechas.

**Parámetros**

| Nombre | Ubicación | Tipo | Obligatorio | Restricciones |
|---|---|---|:---:|---|
| `from` | `query` | cadena | No | — |
| `to` | `query` | cadena | No | — |

**Respuestas**

| Código | Descripción |
|:---:|---|
| `200` | Información de ventas y estadísticas. |
| `400` | Fecha inválida o periodo incorrecto. |
| `401` | No autorizado. |
| `500` | No fue posible consultar las ventas. |

**Esquema de respuesta `200` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `products` | array<objeto> | Sí | — |
| `products[]` | objeto | — | — |
| `orders` | array<objeto> | Sí | — |
| `orders[]` | objeto | — | — |
| `tax` | object | Sí | — |
| `tax.enabled` | booleano | Sí | — |
| `tax.rate` | cadena | Sí | — |
| `totalUnitsSold` | número | Sí | — |

**Esquema de respuesta `400` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `error` | cadena | Sí | — |

**Esquema de respuesta `401` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `error` | cadena | Sí | — |

**Esquema de respuesta `500` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `error` | cadena | Sí | — |

---

### 3.12. Registrar venta administrativa

**Método:** `POST`  
**Ruta:** `/api/admin/ventas`  
**Grupo:** Ventas  
**Descripción:** Registra una venta presencial en efectivo, descuenta inventario, crea los detalles de venta y genera una factura.

**Cuerpo de la solicitud**

- Obligatorio: **Sí**

Tipo de contenido: `application/json`

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `customerName` | cadena | Sí | mín. 1 caracteres |
| `email` | cadena | Sí | mín. 1 caracteres |
| `phone` | cadena | Sí | mín. 1 caracteres |
| `address` | cadena | Sí | mín. 1 caracteres |
| `notes` | cadena | No | — |
| `items` | array<object> | Sí | mín. 1 elemento(s) |
| `items[].productId` | cadena | Sí | — |
| `items[].quantity` | entero | Sí | mínimo 0 (exclusivo) |

**Respuestas**

| Código | Descripción |
|:---:|---|
| `201` | Venta y factura registradas. |
| `400` | Datos de cliente o productos inválidos. |
| `401` | No autorizado. |
| `409` | Stock insuficiente. |
| `500` | No fue posible registrar la venta. |

**Esquema de respuesta `201` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `message` | cadena | Sí | — |
| `order` | objeto | Sí | — |
| `invoice` | objeto | Sí | — |

**Esquema de respuesta `400` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `error` | cadena | Sí | — |

**Esquema de respuesta `401` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `error` | cadena | Sí | — |

**Esquema de respuesta `409` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `error` | cadena | Sí | — |

**Esquema de respuesta `500` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `error` | cadena | Sí | — |

---

### 3.13. Confirmar pedido y generar factura

**Método:** `POST`  
**Ruta:** `/api/admin/ventas/{id}/confirmar`  
**Grupo:** Ventas  
**Descripción:** Confirma un pedido pendiente, descuenta el inventario, registra movimientos y genera la factura correspondiente.

**Parámetros**

| Nombre | Ubicación | Tipo | Obligatorio | Restricciones |
|---|---|---|:---:|---|
| `id` | `path` | cadena | Sí | mín. 1 caracteres |

**Respuestas**

| Código | Descripción |
|:---:|---|
| `200` | Pago confirmado y factura generada. |
| `401` | No autorizado. |
| `409` | El pedido no puede procesarse o no existe stock suficiente. |
| `500` | No fue posible confirmar el pago. |

**Esquema de respuesta `200` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `message` | cadena | Sí | — |
| `orderNumber` | cadena | Sí | — |
| `invoiceNumber` | cadena | Sí | — |

**Esquema de respuesta `401` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `error` | cadena | Sí | — |

**Esquema de respuesta `409` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `error` | cadena | Sí | — |

**Esquema de respuesta `500` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `error` | cadena | Sí | — |

---

### 3.14. Consultar facturas

**Método:** `GET`  
**Ruta:** `/api/admin/facturas`  
**Grupo:** Facturación  
**Descripción:** Obtiene las facturas pagadas en efectivo. Permite filtrar por fecha de emisión.

**Parámetros**

| Nombre | Ubicación | Tipo | Obligatorio | Restricciones |
|---|---|---|:---:|---|
| `from` | `query` | cadena | No | — |
| `to` | `query` | cadena | No | — |

**Respuestas**

| Código | Descripción |
|:---:|---|
| `200` | Lista de facturas. |
| `400` | Fecha inválida o periodo incorrecto. |
| `401` | No autorizado. |

**Esquema de respuesta `200` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `invoices` | array<objeto> | Sí | — |
| `invoices[]` | objeto | — | — |

**Esquema de respuesta `400` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `error` | cadena | Sí | — |

**Esquema de respuesta `401` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `error` | cadena | Sí | — |

---

### 3.15. Consultar factura específica

**Método:** `GET`  
**Ruta:** `/api/admin/facturas/{id}`  
**Grupo:** Facturación  
**Descripción:** Obtiene una factura con los datos del cliente, pedido y productos incluidos.

**Parámetros**

| Nombre | Ubicación | Tipo | Obligatorio | Restricciones |
|---|---|---|:---:|---|
| `id` | `path` | cadena | Sí | mín. 1 caracteres |

**Respuestas**

| Código | Descripción |
|:---:|---|
| `200` | Detalle de la factura. |
| `401` | No autorizado. |
| `404` | Factura no encontrada. |

**Esquema de respuesta `200` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `invoice` | objeto | Sí | — |

**Esquema de respuesta `401` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `error` | cadena | Sí | — |

**Esquema de respuesta `404` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `error` | cadena | Sí | — |

---

### 3.16. Consultar proveedores

**Método:** `GET`  
**Ruta:** `/api/admin/proveedores`  
**Grupo:** Proveedores  
**Descripción:** Obtiene los proveedores registrados ordenados por nombre.

**Respuestas**

| Código | Descripción |
|:---:|---|
| `200` | Lista de proveedores. |
| `401` | No autorizado. |

**Esquema de respuesta `200` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `elementos` | array<objeto> | No | — |
| `[]` | objeto | — | — |

**Esquema de respuesta `401` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `error` | cadena | Sí | — |

---

### 3.17. Registrar proveedor

**Método:** `POST`  
**Ruta:** `/api/admin/proveedores`  
**Grupo:** Proveedores  
**Descripción:** Registra un proveedor con nombre y datos de contacto opcionales.

**Cuerpo de la solicitud**

- Obligatorio: **Sí**

Tipo de contenido: `application/json`

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `name` | cadena | Sí | mín. 2 caracteres; máx. 100 caracteres |
| `phone` | cadena | No | máx. 30 caracteres |
| `email` | cadena o cadena | No | — |
| `address` | cadena | No | máx. 200 caracteres |

**Respuestas**

| Código | Descripción |
|:---:|---|
| `201` | Proveedor registrado. |
| `400` | Datos del proveedor inválidos. |
| `401` | No autorizado. |
| `500` | No se pudo registrar el proveedor. |

**Esquema de respuesta `201` (application/json)**

_El esquema no especifica propiedades detalladas._

**Esquema de respuesta `400` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `error` | cadena | Sí | — |

**Esquema de respuesta `401` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `error` | cadena | Sí | — |

**Esquema de respuesta `500` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `error` | cadena | Sí | — |

---

### 3.18. Consultar configuración

**Método:** `GET`  
**Ruta:** `/api/admin/settings`  
**Grupo:** Configuración  
**Descripción:** Obtiene la configuración general del sitio. Si no existe, crea la configuración inicial.

**Respuestas**

| Código | Descripción |
|:---:|---|
| `200` | Configuración del sitio. |
| `401` | No autorizado. |

**Esquema de respuesta `200` (application/json)**

_El esquema no especifica propiedades detalladas._

**Esquema de respuesta `401` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `error` | cadena | Sí | — |

---

### 3.19. Actualizar configuración

**Método:** `PATCH`  
**Ruta:** `/api/admin/settings`  
**Grupo:** Configuración  
**Descripción:** Actualiza la información de contacto, redes sociales, dirección, mapa y contenido institucional.

**Cuerpo de la solicitud**

- Obligatorio: **Sí**

Tipo de contenido: `application/json`

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `whatsapp` | cadena | No | — |
| `facebook` | cadena | No | — |
| `instagram` | cadena | No | — |
| `tiktok` | cadena | No | — |
| `email` | cadena o cadena | No | — |
| `address` | cadena | No | — |
| `mapEmbedUrl` | cadena | No | admite `null` |
| `aboutHtml` | cadena | No | — |
| `servicesHtml` | cadena | No | — |

**Respuestas**

| Código | Descripción |
|:---:|---|
| `200` | Configuración actualizada. |
| `400` | No se pudo guardar la configuración. |
| `401` | No autorizado. |

**Esquema de respuesta `200` (application/json)**

_El esquema no especifica propiedades detalladas._

**Esquema de respuesta `400` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `error` | cadena | Sí | — |

**Esquema de respuesta `401` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `error` | cadena | Sí | — |

---

### 3.20. Iniciar sesión administrativa

**Método:** `POST`  
**Ruta:** `/api/auth/login`  
**Grupo:** Autenticación  
**Descripción:** Valida el correo y la contraseña del administrador y establece una cookie de sesión HTTP-only.

**Cuerpo de la solicitud**

- Obligatorio: **Sí**

Tipo de contenido: `application/json`

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `email` | cadena | Sí | formato: `email` |
| `password` | cadena | Sí | mín. 4 caracteres |

**Respuestas**

| Código | Descripción |
|:---:|---|
| `200` | Sesión iniciada correctamente. |
| `400` | Datos inválidos. |
| `401` | Credenciales incorrectas. |
| `500` | Error del servidor. |

**Esquema de respuesta `200` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `ok` | booleano | Sí | — |

**Esquema de respuesta `400` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `error` | cadena | Sí | — |

**Esquema de respuesta `401` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `error` | cadena | Sí | — |

**Esquema de respuesta `500` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `error` | cadena | Sí | — |

---

### 3.21. Cerrar sesión administrativa

**Método:** `POST`  
**Ruta:** `/api/auth/logout`  
**Grupo:** Autenticación  
**Descripción:** Elimina la cookie de autenticación administrativa.

**Respuestas**

| Código | Descripción |
|:---:|---|
| `200` | Sesión cerrada correctamente. |

**Esquema de respuesta `200` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `ok` | booleano | Sí | — |

---

### 3.22. Registrar pedido de cliente

**Método:** `POST`  
**Ruta:** `/api/orders`  
**Grupo:** Pedidos  
**Descripción:** Registra un pedido, valida los productos, comprueba el stock y calcula subtotal, IVA y total. El pedido queda inicialmente PENDIENTE y el pago es en efectivo.

**Cuerpo de la solicitud**

- Obligatorio: **Sí**

Tipo de contenido: `application/json`

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `customerName` | cadena | Sí | mín. 2 caracteres |
| `email` | cadena | Sí | formato: `email` |
| `phone` | cadena | Sí | mín. 7 caracteres |
| `address` | cadena | Sí | mín. 5 caracteres |
| `notes` | cadena | No | — |
| `paymentMethod` | cadena | Sí | valores: `EFECTIVO` |
| `items` | array<object> | Sí | mín. 1 elemento(s) |
| `items[].productId` | cadena | Sí | mín. 1 caracteres |
| `items[].quantity` | entero | Sí | mínimo 1 |

**Respuestas**

| Código | Descripción |
|:---:|---|
| `201` | Pedido registrado correctamente. |
| `400` | Datos inválidos, producto no disponible o IVA incorrecto. |
| `409` | Stock insuficiente. |
| `500` | No fue posible registrar el pedido. |

**Esquema de respuesta `201` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `success` | booleano | Sí | — |
| `message` | cadena | Sí | — |
| `orderNumber` | cadena | Sí | — |
| `status` | cadena | Sí | — |
| `paymentMethod` | cadena | Sí | valores: `EFECTIVO` |
| `total` | cadena | Sí | — |

**Esquema de respuesta `400` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `valor` | object o object | No | Alternativas: object / object |

**Esquema de respuesta `409` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `error` | cadena | Sí | — |

**Esquema de respuesta `500` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `error` | cadena | Sí | valores: `No fue posible registrar el pedido` |

---

### 3.23. Registrar reseña verificada

**Método:** `POST`  
**Ruta:** `/api/reviews`  
**Grupo:** Reseñas  
**Descripción:** Registra una reseña vinculada a una compra real. Comprueba el número de pedido, correo del comprador, pago y pertenencia del producto al pedido. Evita reseñas duplicadas.

**Cuerpo de la solicitud**

- Obligatorio: **Sí**

Tipo de contenido: `application/json`

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `productId` | cadena | Sí | mín. 1 caracteres |
| `orderNumber` | cadena | Sí | mín. 1 caracteres |
| `authorName` | cadena | Sí | mín. 2 caracteres; máx. 80 caracteres |
| `email` | cadena | Sí | formato: `email`; máx. 150 caracteres |
| `rating` | entero | Sí | mínimo 1; máximo 5 |
| `comment` | cadena | Sí | mín. 5 caracteres; máx. 1000 caracteres |

**Respuestas**

| Código | Descripción |
|:---:|---|
| `201` | Reseña registrada correctamente. |
| `400` | Revisa los datos ingresados. |
| `403` | El comprador no cumple las condiciones para opinar. |
| `404` | Pedido o producto no encontrado. |
| `409` | Ya existe una reseña para esta compra y producto. |
| `500` | Error interno al registrar la reseña. |

**Esquema de respuesta `201` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `ok` | booleano | Sí | — |
| `message` | cadena | Sí | — |
| `reviewId` | cadena | Sí | — |

**Esquema de respuesta `400` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `error` | cadena | Sí | — |

**Esquema de respuesta `403` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `error` | cadena | Sí | — |

**Esquema de respuesta `404` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `error` | cadena | Sí | — |

**Esquema de respuesta `409` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `error` | cadena | Sí | — |

**Esquema de respuesta `500` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `error` | cadena | Sí | — |

---

### 3.24. Registrar mensaje de contacto

**Método:** `POST`  
**Ruta:** `/api/contact`  
**Grupo:** Contacto  
**Descripción:** Valida y guarda un mensaje enviado desde el formulario de contacto del sitio.

**Cuerpo de la solicitud**

- Obligatorio: **Sí**

Tipo de contenido: `application/json`

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `name` | cadena | Sí | mín. 2 caracteres |
| `email` | cadena | Sí | formato: `email` |
| `message` | cadena | Sí | mín. 10 caracteres |

**Respuestas**

| Código | Descripción |
|:---:|---|
| `200` | Mensaje registrado correctamente. |
| `400` | Datos inválidos. |
| `500` | Error del servidor. |

**Esquema de respuesta `200` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `ok` | booleano | Sí | — |

**Esquema de respuesta `400` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `error` | cadena | Sí | — |

**Esquema de respuesta `500` (application/json)**

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `error` | cadena | Sí | — |

---

## 4. Esquemas reutilizables

### 4.1. `OrderItem`

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `productId` | cadena | Sí | mín. 1 caracteres |
| `quantity` | entero | Sí | mínimo 1 |

### 4.2. `CreateOrderRequest`

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `customerName` | cadena | Sí | mín. 2 caracteres |
| `email` | cadena | Sí | formato: `email` |
| `phone` | cadena | Sí | mín. 7 caracteres |
| `address` | cadena | Sí | mín. 5 caracteres |
| `notes` | cadena | No | — |
| `paymentMethod` | cadena | Sí | valores: `EFECTIVO` |
| `items` | array<object> | Sí | mín. 1 elemento(s) |
| `items[].productId` | cadena | Sí | mín. 1 caracteres |
| `items[].quantity` | entero | Sí | mínimo 1 |

### 4.3. `CreateOrderResponse`

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `success` | booleano | Sí | — |
| `message` | cadena | Sí | — |
| `orderNumber` | cadena | Sí | — |
| `status` | cadena | Sí | — |
| `paymentMethod` | cadena | Sí | valores: `EFECTIVO` |
| `total` | cadena | Sí | — |

### 4.4. `CreateProductRequest`

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `name` | cadena | Sí | mín. 2 caracteres |
| `slug` | cadena | Sí | mín. 2 caracteres; patrón: `^[a-z0-9]+(?:-[a-z0-9]+)*$` |
| `brand` | cadena | Sí | mín. 1 caracteres |
| `description` | cadena | Sí | mín. 5 caracteres |
| `characteristics` | cadena | Sí | mín. 3 caracteres |
| `price` | número | Sí | mínimo 0 (exclusivo) |
| `costPrice` | número | No | mínimo 0; predeterminado: `0` |
| `stock` | entero | Sí | mínimo 0 |
| `minStock` | entero | No | mínimo 0; predeterminado: `0` |
| `categoryId` | cadena | Sí | — |
| `imageUrls` | array<cadena> | No | predeterminado: `[]` |
| `imageUrls[]` | cadena | — | formato: `uri` |

### 4.5. `UpdateProductRequest`

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `name` | cadena | No | mín. 2 caracteres |
| `slug` | cadena | No | mín. 2 caracteres; patrón: `^[a-z0-9]+(?:-[a-z0-9]+)*$` |
| `brand` | cadena | No | mín. 1 caracteres |
| `description` | cadena | No | mín. 5 caracteres |
| `characteristics` | cadena | No | mín. 3 caracteres |
| `price` | número | No | mínimo 0 (exclusivo) |
| `costPrice` | número | No | mínimo 0 |
| `stock` | entero | No | mínimo 0 |
| `minStock` | entero | No | mínimo 0 |
| `categoryId` | cadena | No | — |
| `active` | booleano | No | — |
| `imageUrls` | array<cadena> | No | — |
| `imageUrls[]` | cadena | — | formato: `uri` |

### 4.6. `CreateInventoryMovementRequest`

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `productId` | cadena | Sí | mín. 1 caracteres |
| `type` | cadena | Sí | valores: `ENTRADA`, `SALIDA` |
| `quantity` | entero | Sí | mínimo 0 (exclusivo) |
| `reason` | cadena | Sí | mín. 3 caracteres; máx. 200 caracteres |

### 4.7. `UpdateInventoryRequest`

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `costPrice` | número | No | mínimo 0 |
| `price` | número | No | mínimo 0 (exclusivo) |
| `minStock` | entero | No | mínimo 0 |
| `supplierId` | cadena | No | admite `null` |

### 4.8. `CreatePromotionRequest`

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `title` | cadena | Sí | mín. 2 caracteres |
| `subtitle` | cadena | No | — |
| `imageUrl` | cadena o cadena | No | — |
| `linkUrl` | cadena | No | — |
| `discountPercent` | entero | No | mínimo 0; máximo 100 |
| `startsAt` | cadena | Sí | mín. 1 caracteres |
| `endsAt` | cadena | Sí | mín. 1 caracteres |
| `productId` | cadena | No | admite `null` |

### 4.9. `CreateSupplierRequest`

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `name` | cadena | Sí | mín. 2 caracteres; máx. 100 caracteres |
| `phone` | cadena | No | máx. 30 caracteres |
| `email` | cadena o cadena | No | — |
| `address` | cadena | No | máx. 200 caracteres |

### 4.10. `UpdateSettingsRequest`

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `whatsapp` | cadena | No | — |
| `facebook` | cadena | No | — |
| `instagram` | cadena | No | — |
| `tiktok` | cadena | No | — |
| `email` | cadena o cadena | No | — |
| `address` | cadena | No | — |
| `mapEmbedUrl` | cadena | No | admite `null` |
| `aboutHtml` | cadena | No | — |
| `servicesHtml` | cadena | No | — |

### 4.11. `CreateSaleRequest`

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `customerName` | cadena | Sí | mín. 1 caracteres |
| `email` | cadena | Sí | mín. 1 caracteres |
| `phone` | cadena | Sí | mín. 1 caracteres |
| `address` | cadena | Sí | mín. 1 caracteres |
| `notes` | cadena | No | — |
| `items` | array<object> | Sí | mín. 1 elemento(s) |
| `items[].productId` | cadena | Sí | — |
| `items[].quantity` | entero | Sí | mínimo 0 (exclusivo) |

### 4.12. `SalesResponse`

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `products` | array<objeto> | Sí | — |
| `products[]` | objeto | — | — |
| `orders` | array<objeto> | Sí | — |
| `orders[]` | objeto | — | — |
| `tax` | object | Sí | — |
| `tax.enabled` | booleano | Sí | — |
| `tax.rate` | cadena | Sí | — |
| `totalUnitsSold` | número | Sí | — |

### 4.13. `LoginRequest`

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `email` | cadena | Sí | formato: `email` |
| `password` | cadena | Sí | mín. 4 caracteres |

### 4.14. `LoginResponse`

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `ok` | booleano | Sí | — |

### 4.15. `CreateReviewRequest`

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `productId` | cadena | Sí | mín. 1 caracteres |
| `orderNumber` | cadena | Sí | mín. 1 caracteres |
| `authorName` | cadena | Sí | mín. 2 caracteres; máx. 80 caracteres |
| `email` | cadena | Sí | formato: `email`; máx. 150 caracteres |
| `rating` | entero | Sí | mínimo 1; máximo 5 |
| `comment` | cadena | Sí | mín. 5 caracteres; máx. 1000 caracteres |

### 4.16. `ReviewResponse`

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `ok` | booleano | Sí | — |
| `message` | cadena | Sí | — |
| `reviewId` | cadena | Sí | — |

### 4.17. `ContactRequest`

| Campo | Tipo | Obligatorio | Validaciones / restricciones |
|---|---|:---:|---|
| `name` | cadena | Sí | mín. 2 caracteres |
| `email` | cadena | Sí | formato: `email` |
| `message` | cadena | Sí | mín. 10 caracteres |

## 5. Consideraciones generales

- Las rutas que comienzan por `/api/admin/` corresponden a operaciones administrativas según las descripciones y etiquetas de la especificación.
- Los parámetros ubicados en `path` forman parte de la URL; los parámetros ubicados en `query` se envían como parámetros de consulta.
- Los cuerpos de solicitud con contenido `application/json` deben enviarse en formato JSON.
- Los códigos HTTP y sus descripciones se presentan tal como aparecen en el OpenAPI recibido.
- La especificación no define un esquema de autenticación global en `components.securitySchemes`; algunas operaciones describen que requieren autenticación o devuelven `401`, pero el mecanismo concreto no queda detallado en este documento.

## 6. Alcance y observaciones

El archivo OpenAPI contiene **17 rutas** y **24 operaciones** documentadas. También contiene **17 esquemas reutilizables**.

Algunos esquemas de respuesta están definidos como objetos vacíos (`properties: {}`) o arreglos de objetos sin propiedades declaradas. En esos casos, este documento conserva esa limitación de la especificación y no inventa campos.

---

*Documento generado a partir de la especificación OpenAPI 3.0.0 de InventCatag API.*