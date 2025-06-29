import { useState, useEffect } from 'react';
import { getHistory } from '../utils/orderService';

export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getHistory();
        setOrders(data);
      } catch (err) {
        setError(err.message || 'Error al cargar el historial');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return { orders, loading, error };
};