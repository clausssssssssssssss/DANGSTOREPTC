import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { handleAuthError } from '../utils/authUtils';
import storeConfigService from '../services/storeConfigService';

// URL del servidor en producción (Render)
const API_BASE = 'https://dangstoreptc-production.up.railway.app/api';

const CartContext = createContext();

// Exportar el contexto para uso en otros componentes
export { CartContext };

export const CartProvider = ({ children }) => {
  console.log('CartProvider: Renderizando...');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  async function authFetch(path, opts = {}) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No estás autenticado');

    try {
      const res = await fetch(`${API_BASE}${path}`, {
        ...opts,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          ...(opts.headers || {})
        }
      });

      if (opts.method == null && res.status === 404) {
        return { products: [] };
      }

      if (!res.ok) {
        const text = await res.text();
        // Verificar si la respuesta es HTML en lugar de JSON
        if (text.includes('<!doctype') || text.includes('<html')) {
          throw new Error('El servidor está devolviendo HTML en lugar de JSON. Verifica que la API esté corriendo correctamente.');
        }
        throw new Error(`Error ${res.status}: ${text}`);
      }

      return res.json();
    } catch (error) {
      console.error('Error en authFetch:', error);
      throw error;
    }
  }

  function sync(cartDoc) {
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
    setCart(newCart);
  }

  const loadCart = async (userId) => {
    if (!userId) {
      setCart([]);
      setLoading(false);
      return;
    }

    try {
      const data = await authFetch(`/cart`);
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
      console.error('Global useCart load:', err);
      // Manejar errores de autenticación
      if (handleAuthError(err)) {
        setCart([]);
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async ({ productId, quantity = 1, productName = 'Producto' }) => {
    try {
      console.log('addToCart: Iniciando validaciones...');
      
      // 1. Verificar stock individual del producto
      console.log('addToCart: Verificando stock individual...');
      console.log('addToCart: productId:', productId, 'quantity:', quantity);
      const stockCheck = await storeConfigService.checkProductStock(productId, quantity);
      console.log('addToCart: Respuesta del stock:', stockCheck);
      
      if (!stockCheck.success || !stockCheck.hasStock) {
        console.log('addToCart: Sin stock disponible, lanzando error...');
        throw new Error(`Lo sentimos, no hay suficiente stock disponible para "${productName}". Solo quedan ${stockCheck.available || 0} unidades.`);
      }
      
      // 2. Verificar límite global del catálogo (sincronizado con app móvil)
      console.log('addToCart: Verificando límite global del catálogo...');
      const catalogLimit = await storeConfigService.checkCatalogLimit();
      console.log('addToCart: Respuesta del límite:', catalogLimit);
      
      if (!catalogLimit.success || !catalogLimit.canBuy) {
        console.log('addToCart: Límite global alcanzado, lanzando error...');
        throw new Error(`Lo sentimos, hemos alcanzado el límite máximo de ${catalogLimit.maxCatalogOrders || 10} productos del catálogo. Por favor, intenta nuevamente la próxima semana.`);
      }
      
      console.log('addToCart: Todas las validaciones OK, agregando al carrito...');

      const json = await authFetch('/cart', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity })
      });
      const cartData = json.cart || json;
      sync(cartData);
      console.log('addToCart: Producto agregado exitosamente');
    } catch (error) {
      console.log('addToCart: Error capturado:', error);
      // Re-lanzar el error para que el componente pueda manejarlo
      throw error;
    }
  };

  const updateQuantity = async (productId, quantity) => {
    const json = await authFetch('/cart', {
      method: 'PUT',
      body: JSON.stringify({ itemId: productId, type: 'product', quantity })
    });
    const cartData = json.cart || json;
    sync(cartData);
  };

  const removeFromCart = async (productId) => {
    const json = await authFetch('/cart', {
      method: 'DELETE',
      body: JSON.stringify({ itemId: productId, type: 'product' })
    });
    const cartData = json.cart || json;
    sync(cartData);
  };

  const clearCart = async () => {
    try {
      // Limpiar el carrito en el servidor usando la ruta existente
      for (const item of cart) {
        await authFetch('/cart', {
          method: 'DELETE',
          body: JSON.stringify({ itemId: item.product.id, type: 'product' })
        });
      }
    } catch (err) {
      console.error('Error al limpiar carrito:', err);
    } finally {
      // Siempre limpiar el estado local
      setCart([]);
    }
  };

    const getTotal = useCallback(() => {
    return cart.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  }, [cart]);

  const value = useMemo(() => ({
    cart,
    loading,
    loadCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotal
  }), [cart, loading, loadCart, addToCart, updateQuantity, removeFromCart, clearCart, getTotal]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Hook para usar el contexto del carrito
export const useCart = () => {
  const context = useContext(CartContext);
  console.log('useCart context:', context);
  if (!context) {
    console.error('useCart: No se encontró el contexto del carrito');
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
};