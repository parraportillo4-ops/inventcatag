export function formatCOP(value: number | bigint | { toString(): string }) {
  const n = typeof value === "number" ? value : Number(value.toString());
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);
}

export function stockLabel(stock: number) {
  if (stock <= 0) return "Sin disponibilidad";
  return `${stock} disponibles`;
}
