import React, { useEffect, useState } from 'react';
import { Package, Calendar, DollarSign, ShoppingCart } from 'lucide-react';

const OrdersSection = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    setLoading(true);
    fetch('https://dangstoreptc.onrender.com/api/profile/orders', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        // Ordenar por fecha más reciente primero
        const sortedOrders = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(sortedOrders);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [token]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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

  if (loading) {
    return (
      <div className="content-card">
        <div className="card-header">
          <div className="card-title">
            <h3>Historial de Pedidos</h3>
          </div>
        </div>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="content-card">
      <div className="card-header">
        <div className="card-title">
          <h3>Historial de Pedidos</h3>
        </div>
        <div className="orders-summary">
          <span className="orders-count">
            <ShoppingCart size={16} />
            {orders.length} pedido{orders.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h4>No hay pedidos registrados</h4>
          <p>Aún no has realizado ningún pedido. ¡Explora nuestro catálogo y encuentra productos increíbles!</p>
        </div>
      ) : (
        <div className="orders-grid">
          {orders.map(order => (
            <div className="order-card" key={order._id}>
              {/* Header de la orden */}
              <div className="order-card-header">
                <div className="order-header-left">
                  <div className="order-icon">
                    <Package size={20} />
                  </div>
                  <div className="order-info">
                    <div className="order-id">Orden #{order._id.slice(-8)}</div>
                    <div className="order-date">
                      <Calendar size={14} />
                      {formatDate(order.createdAt)}
                    </div>
                  </div>
                </div>
                <div className={`order-status-badge ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </div>
              </div>

              {/* Cuerpo de la orden */}
              <div className="order-card-body">
                <div className="order-items">
                  {order.items.map((item, i) => (
                    <div className="order-item" key={i}>
                      <div className="order-item-info">
                        <div className="order-item-name">
                          {item.product?.name || 'Producto eliminado'}
                        </div>
                        <div className="order-item-meta">
                          Cantidad: {item.quantity} × ${item.product?.price?.toFixed(2) || '0.00'}
                        </div>
                      </div>
                      <div className="order-item-subtotal">
                        ${((item.quantity || 0) * (item.product?.price || 0)).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="order-total-section">
                  <div className="order-total-line">
                    <span className="total-label">Total:</span>
                    <span className="order-total">
                      <DollarSign size={16} />
                      {order.total.toFixed(2)}
                    </span>
                  </div>
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