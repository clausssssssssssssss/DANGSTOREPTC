import React, { useEffect, useState } from 'react';
import { Package } from 'lucide-react';
import OrderStatusDisplay from './OrderStatusDisplay';

// URL del servidor
const API_BASE = 'https://dangstoreptc-production.up.railway.app/api';

const OrdersSection = ({ userId }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadOrders();
  }, [userId]);

  const loadOrders = () => {
    const token = localStorage.getItem('token');
    console.log('Token:', token ? 'Presente' : 'No encontrado');
    console.log('Cargando órdenes desde:', `${API_BASE}/profile/orders`);
    
    fetch(`${API_BASE}/profile/orders`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => {
      console.log('Respuesta del servidor:', res.status, res.statusText);
      return res.json();
    })
    .then(data => {
      console.log('Datos recibidos:', data);
      // El endpoint existente devuelve un array directamente, no con success
      setOrders(data || []);
      setLoading(false);
    })
    .catch(err => {
      console.error('Error fetching orders:', err);
      setError('Error al cargar las órdenes');
      setLoading(false);
    });
  };

  if (loading) {
    return (
      <div className="content-card">
        <div className="card-header centered-title">
          <div className="card-title">
            <h3>Mis Pedidos</h3>
          </div>
        </div>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando pedidos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content-card">
        <div className="card-header centered-title">
          <div className="card-title">
            <h3>Mis Pedidos</h3>
          </div>
        </div>
        <div className="error-state">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="content-card orders-section">
      <div className="card-header centered-title">
        <div className="card-title">
          <h3>Mis Pedidos</h3>
        </div>
        <div className="orders-summary">
          <span className="orders-count">
            <Package size={16} />
            {orders.length} pedido{orders.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <Package size={48} className="empty-icon" />
          <h4>No tienes pedidos aún</h4>
          <p>Cuando realices tu primera compra, aparecerá aquí.</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <OrderStatusDisplay key={order._id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersSection;
