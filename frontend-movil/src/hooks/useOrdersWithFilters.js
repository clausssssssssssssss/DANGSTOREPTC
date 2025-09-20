import { useState, useEffect } from 'react';
import { customOrdersAPI } from '../services/customOrders';

export function useOrdersWithFilters() {
  const [allOrders, setAllOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('pending'); // 'pending', 'quoted', 'rejected'
  const [dateFilter, setDateFilter] = useState(null);

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener todas las órdenes (pendientes, cotizadas, rechazadas)
      const orders = await customOrdersAPI.getAllOrders();
      console.log('Orders received:', orders.map(o => ({ id: o._id, status: o.status, price: o.price })));
      setAllOrders(orders);
      
      // Aplicar filtro inicial
      applyFilter(orders, activeFilter);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const applyDateFilter = (orders, dateFilter) => {
    if (!dateFilter) return orders;
    
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt || order.created_at);
      const filterDate = new Date(dateFilter);
      
      if (dateFilter.length === 10) { // YYYY-MM-DD (día específico)
        return orderDate.toDateString() === filterDate.toDateString();
      } else if (dateFilter.length === 7) { // YYYY-MM (mes)
        return orderDate.getFullYear() === filterDate.getFullYear() && 
               orderDate.getMonth() === filterDate.getMonth();
      } else if (dateFilter.length === 4) { // YYYY (año)
        return orderDate.getFullYear() === filterDate.getFullYear();
      }
      
      return true;
    });
  };

  const applyFilter = (orders, filter, dateFilterValue = null) => {
    let filtered = [];
    
    // Aplicar filtro de estado
    switch (filter) {
      case 'pending':
        filtered = orders.filter(order => 
          order.status === 'pending' || 
          !order.status || 
          order.status === 'waiting_for_quote'
        );
        break;
      case 'quoted':
        filtered = orders.filter(order => 
          order.status === 'quoted' || 
          order.status === 'approved' ||
          order.status === 'accepted' ||
          (order.price && order.price > 0)
        );
        break;
      case 'rejected':
        filtered = orders.filter(order => 
          order.status === 'rejected' ||
          order.status === 'cancelled'
        );
        break;
      default:
        filtered = orders;
    }
    
    // Aplicar filtro de fecha si existe
    if (dateFilterValue) {
      filtered = applyDateFilter(filtered, dateFilterValue);
    }
    
    // Ordenar por fecha de creación (más recientes primero)
    const sortedOrders = filtered.sort((a, b) => 
      new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at)
    );
    
    setFilteredOrders(sortedOrders);
  };

  const changeFilter = (newFilter, dateFilterValue = null) => {
    setActiveFilter(newFilter);
    if (dateFilterValue !== null) {
      setDateFilter(dateFilterValue);
    }
    applyFilter(allOrders, newFilter, dateFilterValue || dateFilter);
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  return {
    orders: filteredOrders,
    allOrders,
    loading,
    error,
    activeFilter,
    dateFilter,
    changeFilter,
    refresh: fetchAllOrders
  };
}
