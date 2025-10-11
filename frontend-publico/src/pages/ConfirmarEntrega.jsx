import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ui/ToastContainer';
import '../components/styles/ConfirmarEntrega.css';

const API_URL = 'https://dangstoreptc-production.up.railway.app';

export default function ConfirmarEntrega() {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toasts, showSuccess, showError, showWarning, removeToast } = useToast();
  
  const action = searchParams.get('action'); // 'confirm' o 'reschedule'
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showRescheduleForm, setShowRescheduleForm] = useState(false);
  
  const [rescheduleData, setRescheduleData] = useState({
    proposedDate: '',
    proposedTime: '',
    reason: '',
  });
  
  useEffect(() => {
    loadOrder();
    
    // Si viene con action=confirm, confirmar automáticamente
    if (action === 'confirm' && order && !order.deliveryConfirmed) {
      handleConfirm();
    }
    // Si viene con action=reschedule, mostrar formulario
    else if (action === 'reschedule') {
      setShowRescheduleForm(true);
    }
  }, [orderId, action]);
  
  const loadOrder = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/api/cart/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('No se pudo cargar la orden');
      }
      
      const data = await response.json();
      setOrder(data.order || data);
    } catch (error) {
      console.error('Error cargando orden:', error);
      showError('No se pudo cargar la información de la orden');
    } finally {
      setLoading(false);
    }
  };
  
  const handleConfirm = async () => {
    try {
      setProcessing(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/api/delivery-schedule/${orderId}/confirm`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        showSuccess('¡Entrega confirmada exitosamente!');
        setTimeout(() => {
          navigate('/perfil');
        }, 2000);
      } else {
        showError(data.message || 'Error al confirmar la entrega');
      }
    } catch (error) {
      console.error('Error confirmando entrega:', error);
      showError('Error al confirmar la entrega');
    } finally {
      setProcessing(false);
    }
  };
  
  const handleRequestRescheduling = async (e) => {
    e.preventDefault();
    
    if (!rescheduleData.proposedDate || !rescheduleData.proposedTime || !rescheduleData.reason) {
      showWarning('Por favor completa todos los campos');
      return;
    }
    
    try {
      setProcessing(true);
      const token = localStorage.getItem('token');
      
      const proposedDateTime = new Date(`${rescheduleData.proposedDate}T${rescheduleData.proposedTime}`);
      
      const response = await fetch(`${API_URL}/api/delivery-schedule/${orderId}/request-rescheduling`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          proposedDate: proposedDateTime.toISOString(),
          reason: rescheduleData.reason,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        showSuccess('Solicitud de reprogramación enviada exitosamente');
        setTimeout(() => {
          navigate('/perfil');
        }, 2000);
      } else {
        showError(data.message || 'Error al solicitar reprogramación');
      }
    } catch (error) {
      console.error('Error solicitando reprogramación:', error);
      showError('Error al solicitar reprogramación');
    } finally {
      setProcessing(false);
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'No programada';
    const date = new Date(dateString);
    return date.toLocaleString('es-SV', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const getMinDateTime = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.toISOString().slice(0, 16);
  };
  
  if (loading) {
    return (
      <div className="confirmar-entrega-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando información...</p>
        </div>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="confirmar-entrega-container">
        <div className="error-state">
          <XCircle size={64} color="#F44336" />
          <h2>Orden no encontrada</h2>
          <p>No se pudo encontrar la orden solicitada</p>
          <button onClick={() => navigate('/perfil')} className="btn-primary">
            Volver al Perfil
          </button>
        </div>
      </div>
    );
  }
  
  const statusLabels = {
    'PAID': 'Pagado',
    'SCHEDULED': 'Programado',
    'CONFIRMED': 'Confirmado',
    'READY_FOR_DELIVERY': 'Listo para Entrega',
    'DELIVERED': 'Entregado',
    'CANCELLED': 'Cancelado',
  };
  
  return (
    <div className="confirmar-entrega-container">
      <div className="confirmar-entrega-card">
        <div className="order-header">
          <h1>Confirmación de Entrega</h1>
          <div className="order-id">Pedido #{orderId.slice(-8)}</div>
        </div>
        
        {/* Información de la orden */}
        <div className="order-info">
          <div className="info-section">
            <div className="info-icon">
              <MapPin size={20} color="#6c5ce7" />
            </div>
            <div className="info-content">
              <h3>Punto de Entrega</h3>
              <p><strong>{order.deliveryPoint?.nombre || 'No especificado'}</strong></p>
              <p>{order.deliveryPoint?.direccion || ''}</p>
              <p className="schedule">{order.deliveryPoint?.horarioAtencion || ''}</p>
            </div>
          </div>
          
          <div className="info-section">
            <div className="info-icon">
              <Calendar size={20} color="#6c5ce7" />
            </div>
            <div className="info-content">
              <h3>Fecha Programada</h3>
              <p>{formatDate(order.deliveryDate)}</p>
            </div>
          </div>
          
          <div className="info-section">
            <div className="info-icon">
              <CheckCircle size={20} color="#6c5ce7" />
            </div>
            <div className="info-content">
              <h3>Estado</h3>
              <p><strong>{statusLabels[order.deliveryStatus] || order.deliveryStatus}</strong></p>
              {order.deliveryConfirmed && (
                <span className="confirmed-badge">Confirmado ✓</span>
              )}
            </div>
          </div>
        </div>
        
        {/* Acciones */}
        {order.deliveryStatus === 'SCHEDULED' && !order.deliveryConfirmed && !showRescheduleForm && (
          <div className="actions-section">
            <h2>¿Puedes recibir tu pedido en esta fecha?</h2>
            <p className="actions-subtitle">
              Por favor confirma tu disponibilidad o solicita una reprogramación
            </p>
            
            <div className="actions-buttons">
              <button
                className="btn-confirm"
                onClick={handleConfirm}
                disabled={processing}
              >
                <CheckCircle size={20} />
                {processing ? 'Confirmando...' : 'Confirmar Entrega'}
              </button>
              
              <button
                className="btn-reschedule"
                onClick={() => setShowRescheduleForm(true)}
                disabled={processing}
              >
                <Clock size={20} />
                Solicitar Reprogramación
              </button>
            </div>
          </div>
        )}
        
        {/* Formulario de reprogramación */}
        {showRescheduleForm && order.deliveryStatus === 'SCHEDULED' && (
          <div className="reschedule-form-section">
            <div className="form-header">
              <AlertCircle size={24} color="#FF9800" />
              <h2>Solicitar Reprogramación</h2>
            </div>
            
            <form onSubmit={handleRequestRescheduling} className="reschedule-form">
              <div className="form-group">
                <label htmlFor="proposedDate">Nueva Fecha *</label>
                <input
                  type="date"
                  id="proposedDate"
                  value={rescheduleData.proposedDate}
                  onChange={(e) =>
                    setRescheduleData({ ...rescheduleData, proposedDate: e.target.value })
                  }
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="proposedTime">Nueva Hora *</label>
                <input
                  type="time"
                  id="proposedTime"
                  value={rescheduleData.proposedTime}
                  onChange={(e) =>
                    setRescheduleData({ ...rescheduleData, proposedTime: e.target.value })
                  }
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="reason">Razón de la Reprogramación *</label>
                <textarea
                  id="reason"
                  value={rescheduleData.reason}
                  onChange={(e) =>
                    setRescheduleData({ ...rescheduleData, reason: e.target.value })
                  }
                  rows="4"
                  placeholder="Por favor indica la razón por la cual necesitas reprogramar la entrega"
                  required
                />
              </div>
              
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowRescheduleForm(false)}
                  disabled={processing}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={processing}
                >
                  {processing ? 'Enviando...' : 'Enviar Solicitud'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Estado ya confirmado */}
        {order.deliveryConfirmed && (
          <div className="confirmed-state">
            <CheckCircle size={64} color="#4CAF50" />
            <h2>Entrega Confirmada</h2>
            <p>Has confirmado que puedes recibir tu pedido en la fecha programada</p>
            <button onClick={() => navigate('/perfil')} className="btn-primary">
              Volver al Perfil
            </button>
          </div>
        )}
        
        {/* Solicitud de reprogramación pendiente */}
        {order.reschedulingStatus === 'REQUESTED' && (
          <div className="reschedule-pending-state">
            <Clock size={64} color="#FF9800" />
            <h2>Solicitud de Reprogramación Pendiente</h2>
            <p>Tu solicitud está siendo revisada por nuestro equipo</p>
            <p className="proposed-date">
              Nueva fecha propuesta: {formatDate(order.proposedDeliveryDate)}
            </p>
            <button onClick={() => navigate('/perfil')} className="btn-primary">
              Volver al Perfil
            </button>
          </div>
        )}
      </div>
      
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}






