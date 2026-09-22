import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Juice } from '../types';
import { useToast } from './ToastContext';

interface CartContextType {
  items: CartItem[];
  isDrawerOpen: boolean;
  totalPaise: number;
  totalItems: number;
  addToCart: (juice: Juice, quantity?: number) => void;
  updateQuantity: (juiceId: string, quantity: number) => void;
  removeFromCart: (juiceId: string) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_STORAGE_KEY = 'hjs_cart_state_v1';

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.error('Failed to persist cart to localStorage', err);
    }
  }, [items]);

  const addToCart = (juice: Juice, quantity: number = 1) => {
    if (juice.stock <= 0) {
      showToast(`Sorry, "${juice.name}" is currently out of stock!`, 'warning', 'Out of Stock');
      return;
    }

    setItems((prev) => {
      const existing = prev.find((item) => item.juice.id === juice.id);
      if (existing) {
        const newQty = existing.quantity + quantity;
        if (newQty > juice.stock) {
          showToast(
            `Cannot add more. Only ${juice.stock} units available in stock!`,
            'warning',
            'Stock Limit'
          );
          return prev.map((item) =>
            item.juice.id === juice.id ? { ...item, quantity: juice.stock } : item
          );
        }
        showToast(`Updated quantity for "${juice.name}" to ${newQty}`, 'success', 'Cart Updated');
        return prev.map((item) =>
          item.juice.id === juice.id ? { ...item, quantity: newQty } : item
        );
      } else {
        const finalQty = Math.min(quantity, juice.stock);
        showToast(`Added "${juice.name}" to your artisanal cart!`, 'success', 'Added to Cart');
        return [...prev, { juice, quantity: finalQty }];
      }
    });

    setIsDrawerOpen(true);
  };

  const updateQuantity = (juiceId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(juiceId);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.juice.id === juiceId) {
          if (quantity > item.juice.stock) {
            showToast(
              `Only ${item.juice.stock} bottles available for "${item.juice.name}".`,
              'warning',
              'Stock Limit'
            );
            return { ...item, quantity: item.juice.stock };
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const removeFromCart = (juiceId: string) => {
    setItems((prev) => {
      const removed = prev.find((i) => i.juice.id === juiceId);
      if (removed) {
        showToast(`Removed "${removed.juice.name}" from cart`, 'info');
      }
      return prev.filter((item) => item.juice.id !== juiceId);
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);
  const toggleDrawer = () => setIsDrawerOpen((prev) => !prev);

  const totalPaise = items.reduce((sum, item) => sum + item.juice.price * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isDrawerOpen,
        totalPaise,
        totalItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        openDrawer,
        closeDrawer,
        toggleDrawer
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
