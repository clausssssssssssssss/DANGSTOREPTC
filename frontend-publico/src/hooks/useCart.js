import { useState, useEffect } from 'react';

export const useCart = (userId) => {
  const [cart, setCart] = useState([]);

  // 1) Al montar: obtener carrito del backend
  useEffect(() => {
    if (!userId) return;
    fetch(`http://localhost:4000/api/cart/${userId}`)
      .then(res => res.json())
      .then(data => {
        // Backend devuelve { products: [...], customizedProducts: [...] }
        // Normaliza para tu componente: un array único
        const productos = data.products.map(p => ({
          product: p.product,
          quantity: p.quantity
        }));
        const personalizados = data.customizedProducts.map(p => ({
          product: p.item,
          quantity: p.quantity
        }));
        setCart([...productos, ...personalizados]);
      })
      .catch(console.error);
  }, [userId]);

  // 2) Añadir ítem al carrito
  const addToCart = async ({ productId, quantity = 1, customItemId }) => {
    const body = { userId, quantity };
    if (productId) body.productId = productId;
    if (customItemId) body.customItemId = customItemId;

    const res = await fetch('http://localhost:4000/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const json = await res.json();
    setCart(json.cart.products.map(p => ({
      product: p.product,
      quantity: p.quantity
    })));
  };

  // 3) Actualizar cantidad
  const updateCartItem = async ({ itemId, type, quantity }) => {
    await fetch('http://localhost:4000/api/cart', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, itemId, type, quantity })
    });
    // Refresca el carrito
    const resp = await fetch(`http://localhost:4000/api/cart/${userId}`);
    const data = await resp.json();
    const productos = data.products.map(p => ({ product: p.product, quantity: p.quantity }));
    const personalizados = data.customizedProducts.map(p => ({ product: p.item, quantity: p.quantity }));
    setCart([...productos, ...personalizados]);
  };

  // 4) Eliminar ítem
  const removeCartItem = async ({ itemId, type }) => {
    await fetch('http://localhost:4000/api/cart', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, itemId, type })
    });
    setCart(cart.filter(it => it.product.id !== itemId));
  };

  // 5) Vaciar carrito (solo en frontend)
  const clearCart = () => {
    setCart([]);
  };

  return { cart, addToCart, updateCartItem, removeCartItem, clearCart };
};
