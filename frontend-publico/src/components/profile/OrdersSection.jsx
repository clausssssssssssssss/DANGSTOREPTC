import React, { useEffect, useState } from 'react';

const OrdersSection = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    setLoading(true);
    fetch('/api/profile/orders', {
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
      case 'pending': return 'yellow';
      case 'completed': return 'green';
      case 'cancelled': return 'red';
      default: return 'purple';
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
        <div className="loading-spinner">
          <div className="spinner"></div>
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
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <p>No hay órdenes registradas.</p>
        </div>
      ) : (
        <div className="orders-grid">
          {orders.map(order => (
            <div className="order-card" key={order._id}>
              {/* Header de la orden */}
              <div className="order-card-header">
                <div>
                  <div className="order-id">Orden #{order._id.slice(-8)}</div>
                  <div className="order-date">{formatDate(order.createdAt)}</div>
                </div>
                <span className={`order-status ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>

              {/* Cuerpo de la orden */}
              <div className="order-card-body">
                <div className="order-items">
                  {order.items.map((item, i) => (
                    <div className="order-item-row" key={i}>
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
                <div className="order-total-row">
                  <span>Total:</span>
                  <span className="order-total">${order.total.toFixed(2)}</span>
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