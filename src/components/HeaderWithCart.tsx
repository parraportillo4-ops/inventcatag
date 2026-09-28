"use client";

import { useCart } from "@/context/CartContext";
import { Header } from "./Header";

export function HeaderWithCart() {
  const { count, ready } = useCart();
  return <Header cartCount={ready ? count : undefined} />;
}
