import { useState, useEffect } from 'react';
import { 
  getCart, 
  addToCart as addToCartService, 
  removeFromCart as removeFromCartService,
  clearCart as clearCartService
} from '../services/cartService';

export const useCart = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar el carrito al inicializar, tambien utilizada para obtener los productos en nuestra base de datos y que se actualice en la pagina
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const cartData = await getCart();
        setCart(cartData);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  // Función para agregar al carrito
  const addToCart = async (product, quantity) => {
    try {
      setLoading(true);
      const updatedCart = await addToCartService(product.id, quantity);
      setCart(updatedCart);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Esta es la funcion apra vaciar el carti ode compras
  const removeFromCart = async (productId) => {
    try {
      setLoading(true);
      const updatedCart = await removeFromCartService(productId);
      setCart(updatedCart);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Aqui se va a vaciar
  const clearCart = async () => {
    try {
      setLoading(true);
      await clearCartService();
      setCart([]);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Aqui es donde se va a calcular el total
  const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return {
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    total,
    loading,
    error
  };
};