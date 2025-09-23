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

  // Carga inicial del carrito
  useEffect(() => {
    if (!userId) return;

    (async () => {
      try {
        const data = await authFetch(`/cart`);
        setCart((data.products || []).filter(p => p.product && p.product._id).map(p => ({
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
        console.error('useCart load:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  // Sincroniza el estado local con la respuesta del backend
  function sync(cartDoc) {
    console.log('Sync cart data:', cartDoc);
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
    console.log('New cart state:', newCart);
    setCart(newCart);
  }

  // Añadir producto al carrito
  async function addToCart({ productId, quantity = 1 }) {
    const json = await authFetch('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity })
    });
    // El backend puede devolver { cart } o directamente el carrito
    const cartData = json.cart || json;
    sync(cartData);
  }

  // Actualizar cantidad
  async function updateQuantity(productId, quantity) {
    const json = await authFetch('/cart', {
      method: 'PUT',
      body: JSON.stringify({ itemId: productId, type: 'product', quantity })
    });
    const cartData = json.cart || json;
    sync(cartData);
  }

  // Eliminar un producto
  async function removeFromCart(productId) {
    const json = await authFetch('/cart', {
      method: 'DELETE',
      body: JSON.stringify({ itemId: productId, type: 'product' })
    });
    const cartData = json.cart || json;
    sync(cartData);
  }

  // Vaciar el carrito
  async function clearCart() {
    for (const item of cart) {
      await authFetch('/cart', {
        method: 'DELETE',
        body: JSON.stringify({ itemId: item.product.id, type: 'product' })
      });
    }
    setCart([]);
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
