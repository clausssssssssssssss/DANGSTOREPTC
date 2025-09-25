import { useState, useEffect } from 'react';

// URL del servidor en producción (Render)
const API_BASE = 'https://dangstoreptc-production.up.railway.app/api';

export function useCart(userId) {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // Si no hay userId, inicializar con carrito vacío
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

  // Función para normalizar cualquier producto del backend
  function normalizeProduct(p) {
    if (!p.product || !p.product._id) return null;
    return {
      product: {
        id: p.product._id,
        name: p.product.name || p.product.nombre || 'Sin nombre',
        price: p.product.price ?? p.product.precio ?? 0,
        image: p.product.images?.[0] || p.product.imagen || '',
        description: p.product.description || p.product.descripcion || ''
      },
      quantity: p.quantity
    };
  }

  // Normaliza también ítems personalizados
  function normalizeCustomItem(item) {
    if (!item.item || !item.item._id) return null;
    return {
      product: {
        id: item.item._id,
        name: item.item.name || item.item.nombre || 'Sin nombre',
        price: item.item.price ?? item.item.precio ?? 0,
        image: item.item.images?.[0] || item.item.imagen || '',
        description: item.item.description || item.item.descripcion || ''
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
        console.log('Cart data received:', cartData);

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
    console.log('Sync cart data:', cartDoc);

    const products = (cartDoc.products || []).map(normalizeProduct).filter(Boolean);
    const customized = (cartDoc.customizedProducts || []).map(normalizeCustomItem).filter(Boolean);

    const newCart = [...products, ...customized];
    console.log('New cart state:', newCart);
    setCart(newCart);
  }

  // Añadir producto al carrito
  async function addToCart({ productId, quantity = 1 }) {
    try {
      const json = await authFetch('/cart', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity })
      });
      
      const cartData = json.cart || json;
      sync(cartData);
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }

  // Actualizar cantidad
  async function updateQuantity(productId, quantity) {
    try {
      const json = await authFetch('/cart', {
        method: 'PUT',
        body: JSON.stringify({ itemId: productId, type: 'product', quantity })
      });
      const cartData = json.cart || json;
      sync(cartData);
    } catch (error) {
      console.error('Error updating quantity:', error);
      throw error;
    }
  }

  // Eliminar un producto
  async function removeFromCart(productId) {
    try {
      const json = await authFetch('/cart', {
        method: 'DELETE',
        body: JSON.stringify({ itemId: productId, type: 'product' })
      });
      const cartData = json.cart || json;
      sync(cartData);
    } catch (error) {
      console.error('Error removing from cart:', error);
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
    clearCart
  };
}
