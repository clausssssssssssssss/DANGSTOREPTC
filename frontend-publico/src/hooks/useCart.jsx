import { useState, useEffect, useCallback } from 'react';

const API_BASE = 'http://localhost:4000/api';

export function useCart(userId) {
  const [cart, setCart] = useState([]);

  const fetchCart = useCallback(async () => {
    if (!userId) return;
    const res = await fetch(`${API_BASE}/cart/${userId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    setCart(data.products.map(p => ({ product: p.product, quantity: p.quantity })));
  }, [userId]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async ({ productId, quantity = 1 }) => {
    console.log('→ enviando token:', localStorage.getItem('token'));
    const res = await fetch(`${API_BASE}/cart`, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ productId, quantity })
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    // idealmente refrescar el carrito tras añadir
    await fetchCart();
  };

  return { cart, addToCart };
}
