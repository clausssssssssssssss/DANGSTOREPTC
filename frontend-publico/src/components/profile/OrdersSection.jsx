import React, { useEffect, useState } from 'react';
import { Package, Calendar, DollarSign, MapPin, Clock, CheckCircle, AlertCircle, MessageSquare, Send } from 'lucide-react';

// URL del servidor
const API_BASE = 'https://dangstoreptc-production.up.railway.app/api';

const OrdersSection = ({ userId }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rescheduleModal, setRescheduleModal] = useState(null);
  const [rescheduleComment, setRescheduleComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [userId]);

  const loadOrders = () => {
    fetch(`${API_BASE}/profile/orders`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    .then(res => res.json())
    .then(data => {
      setOrders(data);
      setLoading(false);
    })
    .catch(err => {
      console.error('Error fetching orders:', err);
      setError('Error al cargar las órdenes');
      setLoading(false);
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Función para determinar la fase según deliveryStatus
  const getDeliveryPhase = (deliveryStatus) => {
    switch (deliveryStatus) {
      case 'PAID':
        return {
          phase: 1,
          title: 'Tu pedido se está elaborando',
          description: 'Estamos preparando tu pedido con mucho cuidado',
          icon: Package,
          color: '#2196F3'
        };
      case 'SCHEDULED':
      case 'CONFIRMED':
        return {
          phase: 2,
          title: 'Tu pedido ya está listo',
          description: 'Revisa los detalles de entrega y confirma',
          icon: Clock,
          color: '#FF9800'
        };
      case 'READY_FOR_DELIVERY':
        return {
          phase: 2,
          title: 'Listo para entregar',
          description: 'Tu pedido está preparado y confirmado',
          icon: CheckCircle,
          color: '#4CAF50'
        };
      case 'DELIVERED':
        return {
          phase: 3,
          title: 'Pedido completado',
          description: '¡Gracias por tu compra!',
          icon: CheckCircle,
          color: '#4CAF50'
        };
      case 'CANCELLED':
        return {
          phase: 0,
          title: 'Pedido cancelado',
          description: 'Este pedido ha sido cancelado',
          icon: AlertCircle,
          color: '#F44336'
        };
      default:
        return {
          phase: 1,
          title: 'Procesando pedido',
          description: 'Estamos trabajando en tu pedido',
          icon: Package,
          color: '#2196F3'
        };
    }
  };

  const handleConfirmDelivery = async (orderId) => {
    try {
      const response = await fetch(`${API_BASE}/delivery-schedule/${orderId}/confirm`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        alert('¡Entrega confirmada! Recibirás tu pedido en la fecha acordada.');
        loadOrders(); // Recargar pedidos
      } else {
        alert(data.message || 'Error al confirmar la entrega');
      }
    } catch (error) {
      console.error('Error confirming delivery:', error);
      alert('Error al confirmar la entrega');
    }
  };

  const handleRequestReschedule = (order) => {
    setRescheduleModal(order);
    setRescheduleComment('');
  };

  const submitReschedule = async () => {
    if (!rescheduleComment.trim()) {
      alert('Por favor, indica tus días y horas disponibles');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_BASE}/delivery-schedule/${rescheduleModal._id}/request-reschedule`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: rescheduleComment
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Solicitud de reprogramación enviada. El administrador revisará tu solicitud.');
        setRescheduleModal(null);
        setRescheduleComment('');
        loadOrders();
      } else {
        alert(data.message || 'Error al solicitar reprogramación');
      }
    } catch (error) {
      console.error('Error requesting reschedule:', error);
      alert('Error al solicitar reprogramación');
    } finally {
      setSubmitting(false);
    }
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
    <>
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
            <div className="empty-icon">📋</div>
            <h4>No hay pedidos registrados</h4>
            <p>Aún no has realizado ningún pedido. ¡Explora nuestro catálogo y encuentra productos increíbles!</p>
          </div>
        ) : (
          <div className="orders-grid">
            {orders.map(order => {
              const phaseInfo = getDeliveryPhase(order.deliveryStatus);
              const PhaseIcon = phaseInfo.icon;
              const isPhase2 = order.deliveryStatus === 'SCHEDULED' || order.deliveryStatus === 'CONFIRMED';
              const canConfirm = order.deliveryStatus === 'SCHEDULED' && !order.deliveryConfirmed;
              const isWaitingReschedule = order.reschedulingStatus === 'REQUESTED';

              return (
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
                  </div>

                  {/* Fase del pedido */}
                  <div className="delivery-phase" style={{ borderColor: phaseInfo.color }}>
                    <div className="phase-header" style={{ backgroundColor: phaseInfo.color + '15' }}>
                      <PhaseIcon size={24} color={phaseInfo.color} />
                      <div className="phase-info">
                        <h4 style={{ color: phaseInfo.color }}>
                          {phaseInfo.phase > 0 && `Fase ${phaseInfo.phase}: `}
                          {phaseInfo.title}
                        </h4>
                        <p>{phaseInfo.description}</p>
                      </div>
                    </div>

                    {/* Detalles de Fase 2 */}
                    {isPhase2 && order.deliveryDate && (
                      <div className="phase-details">
                        <div className="delivery-info">
                          <div className="info-row">
                            <Calendar size={18} />
                            <span>Fecha de entrega:</span>
                            <strong>{formatDate(order.deliveryDate)}</strong>
                          </div>
                          
                          {order.deliveryPoint && (
                            <div className="info-row">
                              <MapPin size={18} />
                              <span>Punto de entrega:</span>
                              <strong>{order.deliveryPoint.nombre || 'No especificado'}</strong>
                            </div>
                          )}

                          {order.deliveryPoint?.direccion && (
                            <div className="info-row address">
                              <span>{order.deliveryPoint.direccion}</span>
                            </div>
                          )}
                        </div>

                        {/* Botones de acción */}
                        {canConfirm && !isWaitingReschedule && (
                          <div className="phase-actions">
                            <button
                              className="btn-confirm"
                              onClick={() => handleConfirmDelivery(order._id)}
                            >
                              <CheckCircle size={18} />
                              Aceptar Entrega
                            </button>
                            <button
                              className="btn-reschedule"
                              onClick={() => handleRequestReschedule(order)}
                            >
                              <MessageSquare size={18} />
                              Reprogramar
                            </button>
                          </div>
                        )}

                        {isWaitingReschedule && (
                          <div className="reschedule-notice">
                            <AlertCircle size={18} />
                            <span>Solicitud de reprogramación enviada. Esperando respuesta del administrador.</span>
                          </div>
                        )}

                        {order.deliveryConfirmed && (
                          <div className="confirmed-notice">
                            <CheckCircle size={18} />
                            <span>Entrega confirmada ✓</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Cuerpo de la orden - Items */}
                  <div className="order-card-body">
                    <div className="order-items">
                      {order.items.map((item, i) => {
                        const productName = item.product?.name || 'Producto no disponible';
                        const itemPrice = item.price || 0;
                        const subtotal = (item.quantity || 0) * itemPrice;

                        return (
                          <div className="order-item" key={i}>
                            <div className="order-item-info">
                              <div className="order-item-name">
                                {productName}
                              </div>
                              <div className="order-item-meta">
                                Cantidad: {item.quantity} × ${itemPrice.toFixed(2)}
                              </div>
                            </div>
                            <div className="order-item-subtotal">
                              ${subtotal.toFixed(2)}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Total */}
                    <div className="order-total-section">
                      <div className="order-total-line">
                        <span className="total-label">Total:</span>
                        <span className="order-total">
                          <DollarSign size={16} />
                          ${order.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de reprogramación */}
      {rescheduleModal && (
        <div className="modal-overlay" onClick={() => setRescheduleModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Solicitar Reprogramación</h3>
              <button className="modal-close" onClick={() => setRescheduleModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <p>Indica tus días y horas disponibles para la entrega:</p>
              <textarea
                className="reschedule-textarea"
                value={rescheduleComment}
                onChange={(e) => setRescheduleComment(e.target.value)}
                placeholder="Ejemplo: Estoy disponible los días lunes, miércoles y viernes de 2:00 PM a 6:00 PM"
                rows={4}
              />
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setRescheduleModal(null)}
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                className="btn-submit"
                onClick={submitReschedule}
                disabled={submitting}
              >
                {submitting ? (
                  <>Enviando...</>
                ) : (
                  <>
                    <Send size={18} />
                    Enviar Solicitud
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrdersSection;
