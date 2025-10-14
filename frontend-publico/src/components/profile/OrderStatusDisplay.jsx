import React from 'react';
import { Clock, CheckCircle, Package, MapPin, Calendar, AlertCircle } from 'lucide-react';
import useAlert from '../../hooks/useAlert';
import Alert from '../ui/Alert';
import './OrderStatusDisplay.css';

const OrderStatusDisplay = ({ order }) => {
  const { alert, showAlert, hideAlert, success, error: showError, prompt } = useAlert();
  const getStatusInfo = (status) => {
    switch (status) {
      case 'PAID':
        return {
          title: 'Pedido pagado',
          description: 'Tu pedido ha sido procesado correctamente',
          icon: <CheckCircle className="status-icon" />,
          color: 'success'
        };
      case 'REVIEWING':
        return {
          title: 'Están revisando tu pedido',
          description: 'Nuestro equipo está verificando los detalles de tu pedido',
          icon: <Clock className="status-icon" />,
          color: 'warning'
        };
      case 'MAKING':
        return {
          title: 'Tu pedido se está realizando',
          description: 'Estamos elaborando tu pedido con mucho cuidado',
          icon: <Package className="status-icon" />,
          color: 'info'
        };
      case 'READY_FOR_DELIVERY':
        return {
          title: 'Revisa tu perfil para conocer los últimos datos de entrega',
          description: 'Tu pedido está listo. Revisa los detalles de entrega en tu perfil',
          icon: <MapPin className="status-icon" />,
          color: 'primary'
        };
      case 'CONFIRMED':
        return {
          title: '¡Gracias por confirmar tu entrega!',
          description: 'Hemos recibido tu confirmación. Nos vemos en la fecha acordada. ¡Gracias por elegir DangStore!',
          icon: <CheckCircle className="status-icon" />,
          color: 'success'
        };
      case 'DELIVERED':
        return {
          title: 'Pedido entregado',
          description: '¡Tu pedido ha sido entregado exitosamente!',
          icon: <CheckCircle className="status-icon" />,
          color: 'success'
        };
      case 'CANCELLED':
        return {
          title: 'Pedido cancelado',
          description: 'Tu pedido ha sido cancelado',
          icon: <AlertCircle className="status-icon" />,
          color: 'error'
        };
      default:
        return {
          title: 'Estado desconocido',
          description: 'No se pudo determinar el estado del pedido',
          icon: <AlertCircle className="status-icon" />,
          color: 'error'
        };
    }
  };

  const getDeliveryActions = (order) => {
    if (order.deliveryStatus === 'READY_FOR_DELIVERY' && order.deliveryDate && !order.deliveryConfirmed) {
      return (
        <div className="delivery-actions">
          <div className="delivery-info">
            <Calendar className="action-icon" />
            <div className="delivery-details">
              <p><strong>Fecha programada:</strong> {new Date(order.deliveryDate).toLocaleDateString('es-ES')}</p>
              <p><strong>Hora:</strong> {new Date(order.deliveryDate).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
          <div className="action-buttons">
            <button 
              className="btn-accept"
              onClick={() => handleAcceptDelivery(order._id)}
            >
              Aceptar Entrega
            </button>
            <button 
              className="btn-reject"
              onClick={() => handleRejectDelivery(order._id)}
            >
              Rechazar Entrega
            </button>
          </div>
        </div>
      );
    }
    return null;
  };

  const handleAcceptDelivery = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      // Usar el endpoint existente de delivery-schedule
      const response = await fetch(`https://dangstoreptc-production.up.railway.app/api/delivery-schedule/${orderId}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        success('¡Éxito!', 'Entrega confirmada exitosamente');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        const errorData = await response.json();
        showError('Error', errorData.message || 'No se pudo confirmar la entrega');
      }
    } catch (error) {
      console.error('Error:', error);
      showError('Error de conexión', 'No se pudo conectar con el servidor');
    }
  };

  const handleRejectDelivery = async (orderId) => {
    // Usar prompt personalizado para pedir la razón
    prompt(
      'Motivo de reprogramación',
      '¿Por qué necesitas reprogramar la entrega?',
      'Escribe el motivo aquí...',
      async (reason) => {
        if (!reason || reason.trim() === '') {
          showError('Error', 'Por favor, escribe un motivo para la reprogramación');
          return;
        }

        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`https://dangstoreptc-production.up.railway.app/api/delivery-schedule/${orderId}/request-reschedule`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ reason: reason.trim() })
          });

          if (response.ok) {
            success('¡Solicitud enviada!', 'Solicitud de reprogramación enviada al administrador');
            setTimeout(() => window.location.reload(), 1500);
          } else {
            const errorData = await response.json();
            showError('Error', errorData.message || 'No se pudo enviar la solicitud');
          }
        } catch (error) {
          console.error('Error:', error);
          showError('Error de conexión', 'No se pudo conectar con el servidor');
        }
      },
      () => {
        // onCancel - no hacer nada
      }
    );
  };

  const statusInfo = getStatusInfo(order.deliveryStatus);

  return (
    <div className={`order-status-card status-${statusInfo.color}`}>
      <div className="status-header">
        {statusInfo.icon}
        <div className="status-content">
          <h4 className="status-title">{statusInfo.title}</h4>
          <p className="status-description">{statusInfo.description}</p>
        </div>
      </div>
      
      {getDeliveryActions(order)}
      
      <div className="order-details">
        <p><strong>Pedido #:</strong> {order._id.slice(-8)}</p>
        <p><strong>Total:</strong> ${order.total.toFixed(2)}</p>
        <p><strong>Fecha:</strong> {new Date(order.createdAt).toLocaleDateString('es-ES')}</p>
      </div>
      
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
        showInput={alert.showInput}
        inputPlaceholder={alert.inputPlaceholder}
        inputValue={alert.inputValue}
        onInputChange={alert.onInputChange}
      />
    </div>
  );
};

export default OrderStatusDisplay;
