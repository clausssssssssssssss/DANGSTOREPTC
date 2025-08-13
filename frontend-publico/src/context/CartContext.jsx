import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
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

    // Si es GET y no existe el carrito → devolvemos estructura vacía
    if (opts.method == null && res.status === 404) {
      return { products: [] };
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Error ${res.status}: ${text}`);
    }

    return res.json();
  }

  // Sincroniza el estado local con la respuesta del backend
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

  // Cargar carrito inicial
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

  // Añadir producto al carrito
  const addToCart = async ({ productId, quantity = 1 }) => {
    const json = await authFetch('/api/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity })
    });
    // El backend puede devolver { cart } o directamente el carrito
    const cartData = json.cart || json;
    sync(cartData);
  };

  // Actualizar cantidad
  const updateQuantity = async (productId, quantity) => {
    const json = await authFetch('/api/cart', {
      method: 'PUT',
      body: JSON.stringify({ itemId: productId, type: 'product', quantity })
    });
    const cartData = json.cart || json;
    sync(cartData);
  };

  // Eliminar un producto
  const removeFromCart = async (productId) => {
    const json = await authFetch('/api/cart', {
      method: 'DELETE',
      body: JSON.stringify({ itemId: productId, type: 'product' })
    });
    const cartData = json.cart || json;
    sync(cartData);
  };

  // Vaciar el carrito
  const clearCart = async () => {
    for (const item of cart) {
      await authFetch('/api/cart', {
        method: 'DELETE',
        body: JSON.stringify({ itemId: item.product.id, type: 'product' })
      });
    }
    setCart([]);
  };

  const value = {
    cart,
    loading,
    loadCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(userId) {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }

  // Cargar carrito cuando cambie el userId
  useEffect(() => {
    if (userId && !context.loading) {
      context.loadCart(userId);
    }
  }, [userId]);

  return context;
} 