import { useState, useEffect } from 'react';
import { customOrdersAPI } from '../services/customOrders';

export function usePendingQuotes() {
  const [pendingQuotes, setPendingQuotes] = useState([]);
  const [totalPendingCount, setTotalPendingCount] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPendingQuotes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener órdenes pendientes de cotización
      const orders = await customOrdersAPI.getPendingOrders();
      // Filtrar solo las órdenes que están pendientes de cotización
      const pendingOrders = orders.filter(order => 
        order.status === 'pending' || 
        !order.status || 
        order.status === 'waiting_for_quote'
      );
      
      // Guardar el conteo total de órdenes pendientes
      setTotalPendingCount(pendingOrders.length);
      
      // Ordenar por fecha de creación (más recientes primero) y tomar solo 3
      const sortedOrders = pendingOrders
        .sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at))
        .slice(0, 3);
      
      setPendingQuotes(sortedOrders);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingQuotes();
  }, []);

  return {
    pendingQuotes,
    totalPendingCount,
    loading,
    error,
    refresh: fetchPendingQuotes
  };
}
