import { useState, useEffect, useCallback } from 'react';

export const useCart = (userId) => {
  const [cart, setCart] = useState([]);

  // Base URL relativa, gracias al proxy
  const API = '/api/cart';

  // 1) Obtener carrito
  const fetchCart = useCallback(async () => {
    if (!userId) return;
    try {
     const res  = await fetch(`${API}/${userId}`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      // Normaliza ambas colecciones a un solo array de { product, quantity }
      const productos = data.products.map(p => ({
        product:  p.product,
        quantity: p.quantity
      }));
      const personalizados = data.customizedProducts.map(p => ({
        product:  p.item,
        quantity: p.quantity
      }));
      setCart([...productos, ...personalizados]);
    } catch (err) {
      console.error('useCart fetchCart:', err);
    }
  }, [userId]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // 2) Añadir al carrito
  const addToCart = async ({ productId, quantity = 1, customItemId }) => {
    const body = { userId, quantity };
    if (productId)    body.productId    = productId;
    if (customItemId) body.customItemId = customItemId;
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error('Error añadiendo al carrito');
    await fetchCart();
  };

  // 3) Actualizar cantidad
  const updateQuantity = async (productId, quantity) => {
    await fetch(API, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        itemId: productId,
        type: 'product',
        quantity
      })
    });
    await fetchCart();
  };

  // 4) Eliminar item
  const removeFromCart = async (productId) => {
    await fetch(API, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        itemId: productId,
        type: 'product'
      })
    });
    // Podrías hacer fetchCart(), pero filtramos localmente para más rapidez
    setCart(prev => prev.filter(it => it.product._id !== productId && it.product.id !== productId));
  };

  // 5) Vaciar carrito (solo en frontend)
  const clearCart = () => setCart([]);

  return { cart, addToCart, updateQuantity, removeFromCart, clearCart };
};



export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    async function fetchCatalog() {
      try {
        const res = await fetch('http://localhost:4000/api/catalog');
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCatalog();
  }, []);

  return { products, loading, error };
}




