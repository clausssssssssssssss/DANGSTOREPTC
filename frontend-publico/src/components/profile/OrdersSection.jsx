import React, { useEffect, useState } from 'react';

const OrdersSection = () => {
  const [orders, setOrders] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch('/api/profile/orders', {  // Corrige la URL si es diferente
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="content-card">
      <div className="card-header">
        <div className="card-title"><h3>Mis pedidos</h3></div>
      </div>
      <div className="orders-grid">
        {orders.length === 0 && (
          <div className="empty-state"><p>No hay órdenes registradas.</p></div>
        )}
        {orders.map(order => (
          <div className="order-card" key={order._id}>
            <div className="order-card-header">
              <span className="order-id">#{order._id.slice(-6)}</span>
              <span className={`order-status ${order.status.toLowerCase()}`}>{order.status}</span>
            </div>
            <div className="order-card-body">
              <div className="order-items">
                {order.items.map((item, i) => (
                  <div className="order-item-row" key={i}>
                    <div className="order-item-info">
                      <div className="order-item-name">{item.product?.name || 'Producto eliminado'}</div>
                      <div className="order-item-meta">Cant. {item.quantity} · ${item.product?.price?.toFixed(2) || '0.00'}</div>
                    </div>
                    <div className="order-item-subtotal">${((item.product?.price || 0) * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>
              <div className="order-total-row">
                <span>Fecha: {new Date(order.createdAt).toLocaleDateString()}</span>
                <span className="order-total">Total: ${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersSection;
