import { useState, useEffect } from 'react';

const API_BASE = 'https://dangstoreptc-production.up.railway.app/api';

export function useCart(userId) {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setCart([]);
      setLoading(false);
    }
  }, [userId]);

  async function authFetch(path, opts = {}) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No estás autenticado');

    const res = await fetch(`${API_BASE}${path}`, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(opts.headers || {})
      }
    });

    if (opts.method == null && res.status === 404) return { products: [] };

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Error ${res.status}: ${text}`);
    }

    return res.json();
  }

  // Normaliza productos del CATÁLOGO
  function normalizeProduct(p) {
    if (!p.product || !p.product._id) return null;
    return {
      product: {
        id: p.product._id,
        name: p.product.name || p.product.nombre || 'Sin nombre',
        price: p.product.price ?? p.product.precio ?? 0,
        image: p.product.images?.[0] || p.product.imagen || '',
        description: p.product.description || p.product.descripcion || '',
        type: 'standard' // ✅ Marca como producto estándar
      },
      quantity: p.quantity
    };
  }

  // 🔥 CORRECCIÓN: Normaliza productos PERSONALIZADOS con type: 'customized'
  function normalizeCustomItem(item) {
    if (!item.item || !item.item._id) return null;
    
    return {
      product: {
        id: item.item._id,
        name: item.item.name || item.item.nombre || 'Producto Personalizado',
        price: item.item.price ?? item.item.precio ?? 0,
        image: item.item.images?.[0] || item.item.imagen || '',
        description: item.item.description || item.item.descripcion || 'Diseño personalizado',
        type: 'customized', // ✅ CRÍTICO: Marca como personalizado
        modelType: item.item.modelType || 'custom', // ✅ Tipo de modelo (si existe)
        customOrderId: item.item._id // ✅ Guarda el ID de la orden personalizada
      },
      quantity: item.quantity
    };
  }

  // Carga inicial del carrito
  useEffect(() => {
    if (!userId) return;

    (async () => {
      try {
        const cartData = await authFetch(`/cart`);

        const products = (cartData.products || []).map(normalizeProduct).filter(Boolean);
        const customized = (cartData.customizedProducts || []).map(normalizeCustomItem).filter(Boolean);

        setCart([...products, ...customized]);
      } catch (err) {
        console.error('useCart load:', err);
        setCart([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  // Sincroniza el estado local con la respuesta del backend
  function sync(cartDoc) {
    const products = (cartDoc.products || []).map(normalizeProduct).filter(Boolean);
    const customized = (cartDoc.customizedProducts || []).map(normalizeCustomItem).filter(Boolean);

    const newCart = [...products, ...customized];
    setCart(newCart);
  }

  // 🔄 NUEVO: Función para recargar el carrito manualmente
  async function refreshCart(userIdParam) {
    const targetUserId = userIdParam || userId;
    if (!targetUserId) return;
    
    try {
      //console.log('🔄 Refrescando carrito...');
      const cartData = await authFetch(`/cart`);
      
      const products = (cartData.products || []).map(normalizeProduct).filter(Boolean);
      const customized = (cartData.customizedProducts || []).map(normalizeCustomItem).filter(Boolean);
      
      const newCart = [...products, ...customized];
      //console.log('✅ Carrito refrescado:', newCart);
      setCart(newCart);
    } catch (err) {
      console.error('❌ Error refrescando carrito:', err);
    }
  }

  // Añadir producto al carrito
  async function addToCart({ productId, customItemId, quantity = 1 }) {
    try {
      const json = await authFetch('/cart', {
        method: 'POST',
        body: JSON.stringify({ 
          productId, 
          customItemId,
          quantity 
        })
      });
      
      const cartData = json.cart || json;
      sync(cartData);
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }

    // Actualizar cantidad
async function updateQuantity(itemId, quantity, isCustom = false) {
  try {
    const type = isCustom ? 'custom' : 'product';
    
    const json = await authFetch('/cart', {
      method: 'PUT',
      body: JSON.stringify({ itemId, type, quantity })
    });
    
    const cartData = json.cart || json;
    sync(cartData);
  } catch (error) {
    console.error('Error updating quantity:', error);
    throw error;
  }
}

  // Eliminar un producto
async function removeFromCart(itemId, isCustom = false) {
  try {
    const type = isCustom ? 'custom' : 'product';
    
    const json = await authFetch('/cart', {
      method: 'DELETE',
      body: JSON.stringify({ itemId, type })
    });
    
    const cartData = json.cart || json;
    sync(cartData);
  } catch (error) {
    console.error('Error removing item:', error);
    throw error;
  }
}

  // Vaciar el carrito
  async function clearCart() {
    try {
      for (const item of cart) {
        await authFetch('/cart', {
          method: 'DELETE',
          body: JSON.stringify({ itemId: item.product.id, type: 'product' })
        });
      }
      setCart([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }

  return {
    cart,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart // ✅ Exportar función de refresh
  };
}