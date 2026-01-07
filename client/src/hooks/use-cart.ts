import { useState, useCallback } from "react";
import { Product } from "@shared/schema";

export interface CartItem extends Product {
  cartQuantity: number;
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((product: Product) => {
    setItems(current => {
      const existing = current.find(item => item.id === product.id);
      if (existing) {
        return current.map(item => 
          item.id === product.id 
            ? { ...item, cartQuantity: item.cartQuantity + 1 }
            : item
        );
      }
      return [...current, { ...product, cartQuantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((productId: number) => {
    setItems(current => current.filter(item => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems(current => current.map(item => 
      item.id === productId ? { ...item, cartQuantity: quantity } : item
    ));
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const total = items.reduce((sum, item) => sum + (Number(item.sellingPrice) * item.cartQuantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.cartQuantity, 0);

  return { items, addItem, removeItem, updateQuantity, clearCart, total, itemCount };
}
