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
        const cartData = await authFetch(`/cart`); // Este es el carrito completo
        console.log('Cart data received:', cartData);
        
        // cartData ya es el objeto completo del carrito, no solo productos
        // Accedemos a cartData.products, no data.products
        const products = cartData.products || [];
        
        setCart(products
          .filter(p => p.product && p.product._id)
          .map(p => ({
            product: {
              id: p.product._id,
              name: p.product.name || p.product.nombre, // Por si acaso uses 'nombre' en algunos productos
              price: p.product.price || p.product.precio, // Por si acaso uses 'precio'
              image: p.product.images?.[0] || p.product.imagen || '',
              description: p.product.description || p.product.descripcion || ''
            },
            quantity: p.quantity
          }))
        );
      } catch (err) {
        console.error('useCart load:', err);
        setCart([]); // En caso de error, carrito vacío
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  // Sincroniza el estado local con la respuesta del backend
  function sync(cartDoc) {
    console.log('Sync cart data:', cartDoc);
    
    // cartDoc es el carrito completo, no solo los productos
    const products = cartDoc.products || [];
    
    const newCart = products
      .filter(p => p.product && p.product._id)
      .map(p => ({
        product: {
          id: p.product._id,
          name: p.product.name || p.product.nombre,
          price: p.product.price || p.product.precio,
          image: p.product.images?.[0] || p.product.imagen || '',
          description: p.product.description || p.product.descripcion || ''
        },
        quantity: p.quantity
      }));
      
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
      
      // El backend devuelve { message: 'Carrito actualizado', cart: ... }
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