import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function useCart(userId) {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Carga inicial del carrito
  useEffect(() => {
    if (!userId) return;

    (async () => {
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
        console.error('useCart load:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  // Sincroniza el estado local con la respuesta del backend
  function sync(cartDoc) {
    setCart((cartDoc.products || []).map(p => ({
      product: {
        id: p.product._id,
        name: p.product.name,
        price: p.product.price,
        image: p.product.images?.[0] || '',
        description: p.product.description || ''
      },
      quantity: p.quantity
    })));
  }

  // Añadir producto al carrito
  async function addToCart({ productId, quantity = 1 }) {
    const json = await authFetch('/api/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity })
    });
    sync(json.cart);
  }

  // Actualizar cantidad
  async function updateQuantity(productId, quantity) {
    const json = await authFetch('/api/cart', {
      method: 'PUT',
      body: JSON.stringify({ itemId: productId, type: 'product', quantity })
    });
    sync(json.cart);
  }

  // Eliminar un producto
  async function removeFromCart(productId) {
    const json = await authFetch('/api/cart', {
      method: 'DELETE',
      body: JSON.stringify({ itemId: productId, type: 'product' })
    });
    sync(json.cart);
  }

  // Vaciar el carrito
  async function clearCart() {
    for (const item of cart) {
      await authFetch('/api/cart', {
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
