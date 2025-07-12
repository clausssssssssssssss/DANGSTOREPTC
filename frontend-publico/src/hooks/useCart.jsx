// src/hooks/useCart.jsx
import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function useCart() {
  const [cart, setCart]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // 1) Al montar, traemos el carrito
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setCart(null);
      setLoading(false);
      return;
    }

    fetch(`${API_URL}/api/cart`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async res => {
        if (!res.ok) {
          throw new Error(`Error ${res.status}`);
        }
        return res.json();
      })
      .then(data => setCart(data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

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
      body: JSON.stringify({
        productId,
        quantity,
        // si quieres enviar un método de pago fijo mientras no implementas el checkout:
        paymentMethod: 'Efectivo'
      })
    });

    if (res.status === 403) {
      throw new Error('No tienes permiso para agregar al carrito');
    }
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Error ${res.status}: ${text}`);
    }

    const updatedCart = await res.json();
    setCart(updatedCart);
    return updatedCart;
  }

  return { cart, loading, error, addToCart };
}
