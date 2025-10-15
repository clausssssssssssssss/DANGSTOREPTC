import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { handleAuthError } from '../utils/authUtils';
import storeConfigService from '../services/storeConfigService';

// URL del servidor en producción (Railway)
const API_BASE = 'https://dangstoreptc-production.up.railway.app/api';

const CartContext = createContext();

// Exportar el contexto para uso en otros componentes
export { CartContext };

export const CartProvider = ({ children }) => {
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
    const newCart = (cartDoc.products || []).map(p => {
      // Verificar si es un producto personalizado
      if (p.type === 'custom' || p.customOrderId) {
        return {
          type: 'custom',
          customOrderId: p.customOrderId || p.product._id,
          product: {
            id: p.product._id,
            name: p.product.modelType || p.product.name || 'Producto Personalizado',
            price: p.product.price || p.price,
            image: p.product.imageUrl || p.product.image || '',
            description: p.product.description || 'Producto personalizado',
            modelType: p.product.modelType
          },
          quantity: p.quantity
        };
      }
      
      // Producto normal del catálogo
      return {
        type: 'normal',
        product: {
          id: p.product._id,
          name: p.product.name,
          price: p.product.price,
          image: p.product.images?.[0] || '',
          description: p.product.description || ''
        },
        quantity: p.quantity
      };
    });
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
      sync(data);
    } catch (err) {
      console.error('Global useCart load:', err);
      if (handleAuthError(err)) {
        setCart([]);
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ NUEVA FUNCIÓN: Agregar producto personalizado
  const addCustomToCart = async ({ customOrderId, modelType, price, imageUrl, description }) => {
    try {
      const payload = {
        customItemId: customOrderId,
        quantity: 1,
        type: 'custom',
        customOrderId
      };

      const json = await authFetch('/cart', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      const cartData = json.cart || json;
      sync(cartData);
      
      return { success: true };
    } catch (error) {
      console.error('Error al agregar producto personalizado:', error);
      throw error;
    }
  };

  // ✅ FUNCIÓN MEJORADA: Agregar producto normal (con validaciones)
  const addToCart = async ({ productId, quantity = 1, productName = 'Producto', type = 'normal' }) => {
    try {
      // Si es un producto personalizado, usar la función específica
      if (type === 'custom') {
        return await addCustomToCart({
          customOrderId: productId,
          modelType: productName,
          price: 0,
        });
      }
      
      // Validaciones solo para productos normales
      const stockCheck = await storeConfigService.checkProductStock(productId, quantity);
      
      if (!stockCheck.success || !stockCheck.hasStock) {
        throw new Error(`Lo sentimos, no hay suficiente stock disponible para "${productName}". Solo quedan ${stockCheck.available || 0} unidades.`);
      }
      
      const catalogLimit = await storeConfigService.checkCatalogLimit();
      
      if (!catalogLimit.success || !catalogLimit.canBuy) {
        throw new Error(`Lo sentimos, hemos alcanzado el límite máximo de ${catalogLimit.maxCatalogOrders || 10} productos del catálogo. Por favor, intenta nuevamente la próxima semana.`);
      }

      const json = await authFetch('/cart', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity, type: 'normal' })
      });
      
      const cartData = json.cart || json;
      sync(cartData);
      
      return { success: true };
    } catch (error) {
      console.error('Error al agregar producto:', error.message);
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
      for (const item of cart) {
        await authFetch('/cart', {
          method: 'DELETE',
          body: JSON.stringify({ itemId: item.product.id, type: 'product' })
        });
      }
    } catch (err) {
      console.error('Error al limpiar carrito:', err);
    } finally {
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
    addCustomToCart, // ✅ Nueva función exportada
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotal
  }), [cart, loading, getTotal]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Hook para usar el contexto del carrito
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    console.error('useCart: No se encontró el contexto del carrito');
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
};