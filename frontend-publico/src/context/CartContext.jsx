import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || '';

  async function authFetch(path, opts = {}) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No estás autenticado');

    const res = await fetch(`${API_URL}${path}`, {
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
      throw new Error(`Error ${res.status}: ${text}`);
    }

    return res.json();
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
      const data = await authFetch(`/api/cart`);
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
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async ({ productId, quantity = 1 }) => {
    const json = await authFetch('/api/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity })
    });
    const cartData = json.cart || json;
    sync(cartData);
  };

  const updateQuantity = async (productId, quantity) => {
    const json = await authFetch('/api/cart', {
      method: 'PUT',
      body: JSON.stringify({ itemId: productId, type: 'product', quantity })
    });
    const cartData = json.cart || json;
    sync(cartData);
  };

  const removeFromCart = async (productId) => {
    const json = await authFetch('/api/cart', {
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
        await authFetch('/api/cart', {
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

// Exporta el hook como función nombrada
export const useCart = (userId) => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }

  const { loadCart } = context;

  useEffect(() => {
    if (userId) {
      loadCart(userId);
    }
  }, [userId]); // Solo se ejecuta cuando cambia userId

  return context;
};