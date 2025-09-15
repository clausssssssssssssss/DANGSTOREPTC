import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { handleAuthError } from '../utils/authUtils';

// URL del servidor local para desarrollo
const API_BASE = 'http://localhost:4000/api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  async function authFetch(path, opts = {}) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No estás autenticado');

    try {
      const res = await fetch(`${API_BASE}${path}`, {
        ...opts,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          ...(opts.headers || {})
        }
      });

      if (opts.method == null && res.status === 404) {
        return { products: [] };
      }

      if (!res.ok) {
        const text = await res.text();
        // Verificar si la respuesta es HTML en lugar de JSON
        if (text.includes('<!doctype') || text.includes('<html')) {
          throw new Error('El servidor está devolviendo HTML en lugar de JSON. Verifica que la API esté corriendo correctamente.');
        }
        throw new Error(`Error ${res.status}: ${text}`);
      }

      return res.json();
    } catch (error) {
      console.error('Error en authFetch:', error);
      throw error;
    }
  }

  function sync(cartDoc) {
    const newCart = (cartDoc.products || []).map(p => ({
      product: {
        id: p.product._id,
        name: p.product.name,
        price: p.product.price,
        image: p.product.images?.[0] || '',
        description: p.product.description || ''
      },
      quantity: p.quantity
    }));
    setCart(newCart);
  }

  const loadCart = async (userId) => {
    if (!userId) {
      setCart([]);
      setLoading(false);
      return;
    }

    try {
      const data = await authFetch(`/cart`);
      setCart((data.products || []).map(p => ({
        product: {
          id: p.product._id,
          name: p.product.name,
          price: p.product.price,
          image: p.product.images?.[0] || '',
          description: p.product.description || ''
        },
        quantity: p.quantity
      })));
    } catch (err) {
      console.error('Global useCart load:', err);
      // Manejar errores de autenticación
      if (handleAuthError(err)) {
        setCart([]);
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async ({ productId, quantity = 1 }) => {
    const json = await authFetch('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity })
    });
    const cartData = json.cart || json;
    sync(cartData);
  };

  const updateQuantity = async (productId, quantity) => {
    const json = await authFetch('/cart', {
      method: 'PUT',
      body: JSON.stringify({ itemId: productId, type: 'product', quantity })
    });
    const cartData = json.cart || json;
    sync(cartData);
  };

  const removeFromCart = async (productId) => {
    const json = await authFetch('/cart', {
      method: 'DELETE',
      body: JSON.stringify({ itemId: productId, type: 'product' })
    });
    const cartData = json.cart || json;
    sync(cartData);
  };

  const clearCart = async () => {
    try {
      // Limpiar el carrito en el servidor usando la ruta existente
      for (const item of cart) {
        await authFetch('/cart', {
          method: 'DELETE',
          body: JSON.stringify({ itemId: item.product.id, type: 'product' })
        });
      }
    } catch (err) {
      console.error('Error al limpiar carrito:', err);
    } finally {
      // Siempre limpiar el estado local
      setCart([]);
    }
  };

    const getTotal = useCallback(() => {
    return cart.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  }, [cart]);

  const value = {
    cart,
    loading,
    loadCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotal
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Hook para usar el contexto del carrito
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
};