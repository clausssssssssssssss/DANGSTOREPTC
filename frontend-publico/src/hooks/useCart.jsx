// src/hooks/useCart.jsx
import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function useCart(userId) {
  const [cart, setCart]       = useState([]);
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
    // Si es 404 al cargar → carrito vacío
    if (opts.method == null && res.status === 404) {
      return null;
    }
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Error ${res.status}: ${text}`);
    }
    return res.json();
  }

  // 1) Carga inicial
  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const data = await authFetch(`/api/cart/${userId}`);
        if (!data) {
          // No existe → carrito vacío
          setCart([]);
        } else {
          // Poblamos igual que antes
          setCart(data.products.map(p => ({
            product: {
              id:          p.product._id,
              name:        p.product.name,
              price:       p.product.price,
              image:       p.product.images?.[0] || '',
              description: p.product.description || ''
            },
            quantity: p.quantity
          })));
        }
      } catch (err) {
        console.error('useCart load:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  // Sincroniza el estado con la respuesta del servidor
  function sync(cartDoc) {
    setCart(cartDoc.products.map(p => ({
      product: {
        id:          p.product._id,
        name:        p.product.name,
        price:       p.product.price,
        image:       p.product.images?.[0] || '',
        description: p.product.description || ''
      },
      quantity: p.quantity
    })));
  }

  // 2) Añadir
  async function addToCart({ productId, quantity = 1 }) {
    const json = await authFetch('/api/cart', {
      method: 'POST',
      body:   JSON.stringify({ productId, quantity })
    });
    sync(json.cart);
  }

  // 3) Actualizar cantidad
  async function updateQuantity(productId, quantity) {
    const json = await authFetch('/api/cart', {
      method: 'PUT',
      body:   JSON.stringify({ itemId: productId, type: 'product', quantity })
    });
    sync(json.cart);
  }

  // 4) Eliminar
  async function removeFromCart(productId) {
    const json = await authFetch('/api/cart', {
      method: 'DELETE',
      body:   JSON.stringify({ itemId: productId, type: 'product' })
    });
    sync(json.cart);
  }

  // 5) Vaciar
  async function clearCart() {
    for (const item of cart) {
      await authFetch('/api/cart', {
        method: 'DELETE',
        body:   JSON.stringify({ itemId: item.product.id, type: 'product' })
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
