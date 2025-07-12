// src/hooks/useCart.jsx
import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function useCart(userId) {
  const [cart, setCart] = useState([]);

  // 1) Al montar o cambiar userId, recuperamos el carrito
  useEffect(() => {
    if (!userId) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/cart/${userId}`, {
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        // data es el cart completo; aquí extraemos un array plano
        const items = data.products.map(p => ({
          product: {
            id:    p.product._id,
            name:  p.product.name,
            price: p.product.price,
            image: p.product.images?.[0] || ''
          },
          quantity: p.quantity
        }));
        setCart(items);
      } catch {
        setCart([]);
      }
    })();
  }, [userId]);

  // 2) Función para añadir al carrito
  async function addToCart({ productId, quantity = 1 }) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No estás autenticado');

    const res = await fetch(`${API_URL}/api/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ productId, quantity })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || `Error ${res.status}`);
    }

    const { cart: updated } = await res.json();
    // Volvemos a mapear a nuestro formato plano
    const items = updated.products.map(p => ({
      product: {
        id:    p.product._id,
        name:  p.product.name,
        price: p.product.price,
        image: p.product.images?.[0] || ''
      },
      quantity: p.quantity
    }));
    setCart(items);
    return items;
  }

  return { cart, addToCart };
}
