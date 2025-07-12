import React, { useEffect, useState } from 'react';

const OrdersSection = () => {
  const [orders, setOrders] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch('/api/profile/orders', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="content-card">
      <h3 className="history-title">Historial de Pedidos</h3>
      <div className="history-list">
        {orders.map(order => (
          <div className="history-item" key={order._id}>
            <div className="history-header purple">
              <span className="history-date purple">{new Date(order.createdAt).toLocaleDateString()}</span>
              <span className="history-status purple">{order.status}</span>
            </div>
            <div className="history-content">
              {JSON.stringify(order)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersSection;
