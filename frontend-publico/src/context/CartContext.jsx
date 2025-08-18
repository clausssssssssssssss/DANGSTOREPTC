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
    console.log('🔄 Sincronizando carrito con datos:', cartDoc);
    
    // Productos estándar
    const standardProducts = (cartDoc.products || []).map(p => ({
      product: {
        id: p.product._id || p.product.id,
        name: p.product.name,
        price: p.product.price,
        image: p.product.images?.[0] || '',
        description: p.product.description || '',
        type: 'standard'
      },
      quantity: p.quantity
    }));

    // Productos personalizados
    const customizedProducts = (cartDoc.customizedProducts || []).map(p => {
      console.log('🎨 Procesando producto personalizado:', p);
      return {
        product: {
          id: p.item._id || p.item.id || p.item,
          name: p.item.modelType || 'Producto Personalizado',
          price: p.item.price || 0,
          image: p.item.imageUrl || '',
          description: p.item.description || 'Encargo personalizado',
          type: 'customized'
        },
        quantity: p.quantity
      };
    });

    // Combinar ambos tipos de productos
    const newCart = [...standardProducts, ...customizedProducts];
    console.log('🛒 Carrito final sincronizado:', newCart);
    setCart(newCart);
  }

  const loadCart = async (userId) => {
    if (!userId) {
      setCart([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await authFetch(`/api/cart`);
      console.log('🛒 Datos del carrito recibidos:', data);
      
      // Usar la función sync actualizada que maneja ambos tipos de productos
      sync(data);
    } catch (err) {
      console.error('Global useCart load:', err);
      setCart([]);
    } finally {
      setLoading(false);
    }
  };

  // Función para forzar recarga del carrito
  const refreshCart = async (forceUserId = null) => {
    try {
      // Si se proporciona un userId forzado, usarlo
      if (forceUserId) {
        console.log('🔄 Recargando carrito con userId forzado:', forceUserId);
        await loadCart(forceUserId);
        return;
      }
      
      // Si no hay userId forzado, intentar obtenerlo del carrito existente
      if (cart.length > 0) {
        const userId = cart[0]?.userId || null;
        if (userId) {
          await loadCart(userId);
        }
      }
    } catch (err) {
      console.error('Error en refreshCart:', err);
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
    for (const item of cart) {
      await authFetch('/api/cart', {
        method: 'DELETE',
        body: JSON.stringify({ itemId: item.product.id, type: 'product' })
      });
    }
    setCart([]);
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
    getTotal,
    refreshCart
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

  const { loadCart, loading } = context;

  useEffect(() => {
    if (userId && !loading) {
      loadCart(userId);
    }
  }, [userId, loadCart, loading]);

  return context;
};