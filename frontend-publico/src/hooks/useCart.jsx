// src/hooks/useCart.js
import { useState, useEffect, useCallback } from 'react';

const API_BASE = 'http://localhost:4000/api';

export function useCart(userId) {
  const [cart, setCart] = useState([]);

  const fetchCart = useCallback(async () => {
    if (!userId) return;
    const res = await fetch(`/api/cart/${userId}`);
    const data = await res.json();
    setCart(data.products.map(p => ({ product: p.product, quantity: p.quantity })));
  }, [userId]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const token = localStorage.getItem('token');

const addToCart = async ({ productId, quantity = 1 }) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/cart`, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ productId, quantity })
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
};

  return { cart, addToCart };
}
