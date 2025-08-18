import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Building, CreditCard as CreditCardIcon, CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../context/CartContext';
import usePaymentFakeForm from '../components/payment/hook/usePaymentFakeForm';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ui/ToastContainer';
import InputField from '../components/payment/InputField';
import '../components/styles/formPayment.css';

const FormPaymentFake = () => {
  const navigate = useNavigate();
  const { user, userId } = useAuth();
  const { cart, clearCart, loadCart, getTotal } = useCart();
  const total = getTotal();
  
  const {
    formData,
    handleChange,
    handleSubmit,
    limpiarFormulario,
    handleFakePayment,
    validateForm,
    detectCardType,
    validateField,
    handleFieldChange,
    getFieldClass,
    calculateProgress,
  } = usePaymentFakeForm();

  const { toasts, removeToast, showSuccess, showError, showInfo } = useToast();

  // Asegurar que el carrito se cargue cuando el componente se monte
  useEffect(() => {
    if (userId && cart.length === 0) {
      console.log('Recargando carrito para userId:', userId);
      loadCart(userId);
    }
  }, [userId, cart.length, loadCart]);

  // Memoizar la función de progreso para evitar bucles infinitos
  const memoizedCalculateProgress = useCallback(() => {
    return calculateProgress();
  }, [calculateProgress]);

  // Mostrar toasts de progreso solo cuando cambie significativamente
  useEffect(() => {
    const progress = memoizedCalculateProgress();
    if (progress > 0 && progress < 100) {
      // Solo mostrar toast si el progreso cambió significativamente
      const lastProgress = sessionStorage.getItem('lastProgress');
      if (lastProgress !== progress.toString()) {
        showInfo(`Progreso del formulario: ${progress}%`);
        sessionStorage.setItem('lastProgress', progress.toString());
      }
    }
  }, [memoizedCalculateProgress, showInfo]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      handleSubmit(e);
    } else {
      showError('Por favor, completa todos los campos requeridos correctamente.');
    }
  };

  const onPay = async () => {
    try {
      console.log('Iniciando pago simulado...');
      console.log('Datos del formulario:', formData);
      console.log('Total del carrito:', total);
      
      await handleFakePayment();
      showSuccess('¡Pago procesado exitosamente!');
      
      setTimeout(() => {
        clearCart();
        navigate('/carrito', { 
          state: { 
            showSuccess: true,
            message: '¡Pago exitoso! Tu pedido ha sido procesado.' 
          } 
        });
      }, 2000);
    } catch (error) {
      console.error('Error en el pago:', error);
      showError('Error al procesar el pago. Por favor, intenta de nuevo.');
    }
  };

  const formatCardNumber = (value) => {
    if (!value) return '';
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    }
    return v;
  };

  return (
    <div className="payment-page">
      <div className="payment-wrapper">
        <div className="payment-card">
          <div className="page-header">
            <h1 className="page-title">Información de Pago</h1>
            <p className="page-subtitle">Completa los datos de tu tarjeta para continuar</p>
          </div>

          {/* Resumen del Carrito */}
          <div className="cart-summary" style={{
            background: '#f8f9fa',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #e9ecef',
            position: 'static',
            top: 'auto',
            left: 'auto',
            right: 'auto',
            bottom: 'auto',
            zIndex: 'auto'
          }}>
            <h3>Resumen del Carrito</h3>
            <div className="cart-items-summary">
              {cart.map((item, index) => (
                <div key={index} className="cart-item-summary">
                  <span>{item.product?.name || 'Producto personalizado'}</span>
                  <span>x{item.quantity}</span>
                  <span>${((item.product?.price || 0) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="cart-total">
              <strong>Total: ${total.toFixed(2)}</strong>
            </div>
          </div>

          {/* Barra de Progreso */}
          <div className="form-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${memoizedCalculateProgress()}%` }}
              ></div>
            </div>
            <div className="progress-text">
              Progreso: {memoizedCalculateProgress()}%
            </div>
          </div>

          <form onSubmit={handleFormSubmit} className="card-form">
            {/* Datos de la Tarjeta */}
            <div className="form-section">
              <div className="section-header">
                <CreditCard className="section-icon" />
                <div>
                  <h3 className="section-title">Datos de la Tarjeta</h3>
                  <p className="section-subtitle">Información de tu tarjeta de crédito o débito</p>
                </div>
              </div>
              
              <div className="double-grid">
                <InputField
                  label="Número de Tarjeta"
                  name="numeroTarjeta"
                  value={formData.numeroTarjeta}
                  onChange={(e) => handleFieldChange('numeroTarjeta', e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  className={getFieldClass('numeroTarjeta', formData.numeroTarjeta)}
                  required
                />
                <div className="card-logos">
                  <div className={`card-logo visa ${detectCardType(formData.numeroTarjeta) === 'visa' ? 'active' : ''}`}>Visa</div>
                  <div className={`card-logo mastercard ${detectCardType(formData.numeroTarjeta) === 'mastercard' ? 'active' : ''}`}>Mastercard</div>
                  <div className={`card-logo amex ${detectCardType(formData.numeroTarjeta) === 'amex' ? 'active' : ''}`}>Amex</div>
                  <div className={`card-logo discover ${detectCardType(formData.numeroTarjeta) === 'discover' ? 'active' : ''}`}>Discover</div>
                </div>
              </div>

              <div className="double-grid">
                <InputField
                  label="Nombre en la Tarjeta"
                  name="nombreTitular"
                  value={formData.nombreTitular}
                  onChange={(e) => handleFieldChange('nombreTitular', e.target.value)}
                  placeholder="Como aparece en la tarjeta"
                  className={getFieldClass('nombreTitular', formData.nombreTitular)}
                  required
                />
                <InputField
                  label="CVV"
                  name="cvv"
                  value={formData.cvv}
                  onChange={(e) => handleFieldChange('cvv', e.target.value)}
                  placeholder="123"
                  className={getFieldClass('cvv', formData.cvv)}
                  required
                />
              </div>

              <div className="double-grid">
                <InputField
                  label="Mes de Vencimiento"
                  name="mesVencimiento"
                  value={formData.mesVencimiento}
                  onChange={(e) => handleFieldChange('mesVencimiento', e.target.value)}
                  placeholder="MM"
                  className={getFieldClass('mesVencimiento', formData.mesVencimiento)}
                  required
                />
                <InputField
                  label="Año de Vencimiento"
                  name="anioVencimiento"
                  value={formData.anioVencimiento}
                  onChange={(e) => handleFieldChange('anioVencimiento', e.target.value)}
                  placeholder="AAAA"
                  className={getFieldClass('anioVencimiento', formData.anioVencimiento)}
                  required
                />
              </div>
            </div>

            {/* Dirección de Facturación */}
            <div className="form-section">
              <div className="section-header">
                <Building className="section-icon" />
                <div>
                  <h3 className="section-title">Dirección de Facturación</h3>
                  <p className="section-subtitle">Dirección donde se enviará la factura</p>
                </div>
              </div>
              
              <div className="double-grid">
                <InputField
                  label="Nombre Completo"
                  name="nombreFacturacion"
                  value={formData.nombreFacturacion}
                  onChange={(e) => handleFieldChange('nombreFacturacion', e.target.value)}
                  placeholder="Tu nombre completo"
                  className={getFieldClass('nombreFacturacion', formData.nombreFacturacion)}
                  required
                />
                <InputField
                  label="Email"
                  name="emailFacturacion"
                  value={formData.emailFacturacion}
                  onChange={(e) => handleFieldChange('emailFacturacion', e.target.value)}
                  placeholder="tu@email.com"
                  className={getFieldClass('emailFacturacion', formData.emailFacturacion)}
                  required
                />
              </div>

              <InputField
                label="Dirección"
                name="direccionFacturacion"
                value={formData.direccionFacturacion}
                onChange={(e) => handleFieldChange('direccionFacturacion', e.target.value)}
                placeholder="Calle, número, apartamento"
                className={getFieldClass('direccionFacturacion', formData.direccionFacturacion)}
                required
              />

              <div className="double-grid">
                <InputField
                  label="Ciudad"
                  name="ciudadFacturacion"
                  value={formData.ciudadFacturacion}
                  onChange={(e) => handleFieldChange('ciudadFacturacion', e.target.value)}
                  placeholder="Ciudad"
                  className={getFieldClass('ciudadFacturacion', formData.ciudadFacturacion)}
                  required
                />
                <InputField
                  label="Estado/Provincia"
                  name="estadoFacturacion"
                  value={formData.estadoFacturacion}
                  onChange={(e) => handleFieldChange('estadoFacturacion', e.target.value)}
                  placeholder="Estado o provincia"
                  className={getFieldClass('estadoFacturacion', formData.estadoFacturacion)}
                  required
                />
              </div>

              <div className="double-grid">
                <InputField
                  label="Código Postal"
                  name="codigoPostal"
                  value={formData.codigoPostal}
                  onChange={(e) => handleFieldChange('codigoPostal', e.target.value)}
                  placeholder="Código postal"
                  className={getFieldClass('codigoPostal', formData.codigoPostal)}
                  required
                />
                <InputField
                  label="País"
                  name="paisFacturacion"
                  value={formData.paisFacturacion}
                  onChange={(e) => handleFieldChange('paisFacturacion', e.target.value)}
                  placeholder="País"
                  className={getFieldClass('paisFacturacion', formData.paisFacturacion)}
                  required
                />
              </div>

              <div className="double-grid">
                <InputField
                  label="Teléfono"
                  name="telefonoFacturacion"
                  value={formData.telefonoFacturacion}
                  onChange={(e) => handleFieldChange('telefonoFacturacion', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className={getFieldClass('telefonoFacturacion', formData.telefonoFacturacion)}
                  required
                />
                <InputField
                  label="Empresa (opcional)"
                  name="empresaFacturacion"
                  value={formData.empresaFacturacion}
                  onChange={(e) => handleFieldChange('empresaFacturacion', e.target.value)}
                  placeholder="Nombre de la empresa"
                  className={getFieldClass('empresaFacturacion', formData.empresaFacturacion)}
                />
              </div>
            </div>

            {/* Acciones */}
            <div className="actions-duo">
              <button
                type="button"
                onClick={() => navigate('/carrito')}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={onPay}
                className="btn btn-primary"
              >
                Procesar Pago
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default FormPaymentFake;