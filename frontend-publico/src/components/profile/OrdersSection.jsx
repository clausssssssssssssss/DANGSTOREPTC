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
    <div className="content-card">
  <h3 className="history-title">Historial de Pedidos</h3>

  {/* 🔁 Contenedor con scroll */}
  <div className="history-scroll-container">
    <div className="history-list">
      {orders.length === 0 && <p>No hay órdenes registradas.</p>}
      {orders.map(order => (
        <div className="history-item" key={order._id}>
          <div className="history-header purple">
            <span className="history-date purple">{new Date(order.createdAt).toLocaleDateString()}</span>
            <span className={`history-status ${order.status.toLowerCase()}`}>{order.status}</span>
          </div>
          <div className="history-content">
            <ul>
              {order.items.map((item, i) => (
                <li key={i}>
                  <strong>{item.product?.name || 'Producto eliminado'}</strong> — Cantidad: {item.quantity} — Precio unitario: ${item.product?.price?.toFixed(2) || '0.00'}
                </li>
              ))}
            </ul>
            <p><strong>Total:</strong> ${order.total.toFixed(2)}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
</div>
    </div>
  );
};

export default OrdersSection;
