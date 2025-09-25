import React, { useEffect, useState } from 'react';
import { Package, Calendar, DollarSign, MapPin } from 'lucide-react';

const API_BASE = 'https://dangstoreptc-production.up.railway.app/api';

const OrdersSection = ({ userId }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API_BASE}/profile/orders`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();

        // Validar que sea array
        if (!Array.isArray(data)) {
          console.error('Orders API did not return an array:', data);
          setOrders([]);
          setError(data.message || 'Error al cargar pedidos');
        } else {
          setOrders(data);
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Error al cargar las órdenes');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchOrders();
  }, [userId]);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'pending';
      case 'completed': return 'completed';
      case 'cancelled': return 'cancelled';
      case 'processing': return 'processing';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'PENDIENTE';
      case 'completed': return 'COMPLETADO';
      case 'cancelled': return 'CANCELADO';
      case 'processing': return 'PROCESANDO';
      default: return status.toUpperCase();
    }
  };

  if (loading) return <p>Cargando pedidos...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="content-card">
      <div className="card-header">
        <h3>Historial de Pedidos</h3>
        <div className="orders-summary">
          <MapPin size={16} /> {orders.length} pedido{orders.length !== 1 ? 's' : ''}
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h4>No hay pedidos registrados</h4>
          <p>Aún no has realizado ningún pedido.</p>
        </div>
      ) : (
        <div className="orders-grid">
          {orders.map(order => (
            <div className="order-card" key={order._id}>
              <div className="order-card-header">
                <Package size={20} />
                <div>
                  Orden #{order._id.slice(-8)} - {formatDate(order.createdAt)}
                </div>
                <span className={`order-status-badge ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </div>

              <div className="order-card-body">
                {order.items.map((item, i) => (
                  <div className="order-item" key={i}>
                    <div>
                      <strong>{item.product?.name || 'Producto eliminado'}</strong>
                      <div>Cantidad: {item.quantity} × ${item.product?.price?.toFixed(2) || '0.00'}</div>
                    </div>
                    <div>
                      ${((item.quantity || 0) * (item.product?.price || 0)).toFixed(2)}
                    </div>
                  </div>
                ))}

                <div className="order-total-section">
                  <strong>Total: </strong>
                  <DollarSign size={16} /> {order.total?.toFixed(2) || '0.00'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersSection;
