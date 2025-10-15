import React, { useEffect, useState } from 'react';
import { Package, Trash2 } from 'lucide-react';
import OrderStatusDisplay from './OrderStatusDisplay';
import Alert from '../ui/Alert';
import useAlert from '../../hooks/useAlert';
import './OrdersSection.css';

// URL del servidor
const API_BASE = 'https://dangstoreptc-production.up.railway.app/api';

const OrdersSection = ({ userId }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { alert, showAlert, hideAlert, confirm, success, error: showError } = useAlert();

  useEffect(() => {
    loadOrders();
  }, [userId]);

  const loadOrders = () => {
    const token = localStorage.getItem('token');
    
    fetch(`${API_BASE}/profile/orders`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => res.json())
    .then(data => {
      setOrders(data || []);
      setLoading(false);
    })
    .catch(err => {
      console.error('Error fetching orders:', err);
      setError('Error al cargar las órdenes');
      setLoading(false);
    });
  };

  const deleteOrder = async (orderId) => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`${API_BASE}/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setOrders(orders.filter(order => order._id !== orderId));
        success('¡Éxito!', 'Pedido eliminado correctamente');
      } else {
        showError('Error', 'No se pudo eliminar el pedido');
      }
    } catch (error) {
      console.error('Error:', error);
      showError('Error de conexión', 'No se pudo conectar con el servidor');
    }
  };

  const deleteAllOrders = async () => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`${API_BASE}/orders/all`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setOrders([]);
        success('¡Éxito!', 'Todos los pedidos han sido eliminados');
      } else {
        showError('Error', 'No se pudieron eliminar los pedidos');
      }
    } catch (error) {
      console.error('Error:', error);
      showError('Error de conexión', 'No se pudo conectar con el servidor');
    }
  };

  const handleDeleteOrder = (orderId) => {
    confirm(
      'Eliminar pedido',
      '¿Estás seguro de que quieres eliminar este pedido?',
      () => deleteOrder(orderId)
    );
  };

  const handleDeleteAll = () => {
    if (orders.length === 0) return;
    
    confirm(
      'Eliminar todos los pedidos',
      `¿Estás seguro de que quieres eliminar todos los ${orders.length} pedidos? Esta acción no se puede deshacer.`,
      () => deleteAllOrders()
    );
  };

  if (loading) {
    return (
      <div className="orders-container">
        <div className="orders-header">
          <h2 className="orders-title">Mis Pedidos</h2>
          <div className="orders-count-badge">
            <Package size={16} />
            <span>Cargando...</span>
          </div>
        </div>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Cargando pedidos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-container">
        <div className="orders-header">
          <h2 className="orders-title">Mis Pedidos</h2>
          <div className="orders-count-badge error">
            <AlertTriangle size={16} />
            <span>Error</span>
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
          {orders.length > 0 && (
            <button 
              className="delete-all-btn"
              onClick={handleDeleteAll}
              title="Eliminar todos los pedidos"
            >
              <Trash2 size={16} />
              Eliminar Todos
            </button>
          )}
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
            <div key={order._id} className="order-item-wrapper">
              <OrderStatusDisplay order={order} />
              <button 
                className="delete-order-btn"
                onClick={() => handleDeleteOrder(order._id)}
                title="Eliminar este pedido"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Componente de alerta personalizada */}
      <Alert
        isOpen={alert.isOpen}
        onClose={hideAlert}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        showCancel={alert.showCancel}
        onConfirm={alert.onConfirm}
        onCancel={alert.onCancel}
        confirmText={alert.confirmText}
        cancelText={alert.cancelText}
      />
    </div>
  );
};

export default OrdersSection;
