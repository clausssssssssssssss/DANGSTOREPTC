import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../hooks/useAuth.jsx";
import { useCart } from "../context/CartContext.jsx";
import usePaymentFakeForm from "../components/payment/hook/usePaymentFakeForm.jsx";
import InputField from "../components/payment/InputField";
import Button from "../components/payment/Button";
import { CreditCard, Lock, Shield, Building, HelpCircle } from "lucide-react";
import { useToast } from "../hooks/useToast";
import ToastContainer from "../components/ui/ToastContainer";
import "../components/styles/formPayment.css";

const FormPaymentFake = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userId = user?.id;
  const { cart, clearCart, loadCart } = useCart(userId);

  // calcula total y cantidad
  const total = cart.reduce((sum, item) => sum + (item.product?.price || 0) * (item.quantity || 0), 0);

  // Debug del carrito
  console.log('=== DEBUG DEL CARRITO ===');
  console.log('Cart completo:', cart);
  console.log('Número de items:', cart.length);
  console.log('Items individuales:', cart.map(item => ({
    id: item.product?._id || item.product?.id,
    name: item.product?.name,
    price: item.product?.price,
    quantity: item.quantity,
    subtotal: (item.product?.price || 0) * (item.quantity || 0)
  })));
  console.log('Total calculado:', total);
  console.log('========================');

  // Asegurar que el carrito se cargue cuando el componente se monte
  useEffect(() => {
    if (userId && cart.length === 0) {
      console.log('Recargando carrito para userId:', userId);
      loadCart(userId);
    }
  }, [userId, cart.length, loadCart]);

  const {
    formData,
    datosEnviados,
    handleChange,
    handleSubmit,
    limpiarFormulario,
    handleFakePayment,
    validateForm,
  } = usePaymentFakeForm();

  const { showSuccess, showError, showWarning, showInfo } = useToast();

  // Obtener el estado de los toasts del hook
  const { toasts, removeToast } = useToast();

  const [cardType, setCardType] = useState('unknown');
  const [fieldErrors, setFieldErrors] = useState({});

  // Detectar tipo de tarjeta cuando cambie el número
  const detectCardType = (cardNumber) => {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    if (/^4/.test(cleanNumber)) return 'visa';
    if (/^5[1-5]/.test(cleanNumber)) return 'mastercard';
    if (/^3[47]/.test(cleanNumber)) return 'amex';
    return 'unknown';
  };

  useEffect(() => {
    if (formData.numeroTarjeta) {
      const detectedType = detectCardType(formData.numeroTarjeta);
      setCardType(detectedType);
      
      // Mostrar toast informativo del tipo de tarjeta
      if (detectedType !== 'unknown') {
        const cardNames = {
          visa: 'VISA',
          mastercard: 'Mastercard',
          amex: 'American Express'
        };
        showInfo(`Tarjeta ${cardNames[detectedType]} detectada`, 3000);
      }
    }
  }, [formData.numeroTarjeta, showInfo]);

  // Validar campo individual en tiempo real
  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'numeroTarjeta':
        if (!value || value.replace(/\s/g, '').length < 13) {
          error = 'Mínimo 13 dígitos';
        }
        break;
      case 'cvv':
        if (!value || value.length < 3) {
          error = 'Mínimo 3 dígitos';
        }
        break;
      case 'mesVencimiento':
        if (!value || value < 1 || value > 12) {
          error = 'Mes inválido (1-12)';
        }
        break;
      case 'anioVencimiento':
        // Permitir editar el año, solo validar si es muy antiguo
        if (value && value.length === 4) {
          const currentYear = new Date().getFullYear();
          if (parseInt(value) < currentYear - 10) {
            error = 'Año muy antiguo';
          }
        }
        break;
      case 'emailFacturacion':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Email inválido';
        }
        break;
      case 'telefonoFacturacion':
        if (value && value.replace(/[^0-9]/g, '').length < 7) {
          error = 'Mínimo 7 dígitos';
        }
        break;
      default:
        if (value && value.trim().length < 2) {
          error = 'Mínimo 2 caracteres';
        }
    }

    return error;
  };

  // Manejar cambios con validación en tiempo real
  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    
    // Validar campo
    const error = validateField(name, value);
    setFieldErrors(prev => ({
      ...prev,
      [name]: error
    }));

    // Mostrar toast de éxito si el campo es válido
    if (!error && value && value.trim().length > 0) {
      const fieldNames = {
        numeroTarjeta: 'Número de tarjeta',
        cvv: 'CVV',
        mesVencimiento: 'Mes de vencimiento',
        anioVencimiento: 'Año de vencimiento',
        nombreTitular: 'Nombre del titular',
        nombreFacturacion: 'Nombre de facturación',
        emailFacturacion: 'Email de facturación',
        direccionFacturacion: 'Dirección',
        ciudadFacturacion: 'Ciudad',
        estadoFacturacion: 'Estado/Provincia',
        codigoPostal: 'Código postal',
        paisFacturacion: 'País',
        telefonoFacturacion: 'Teléfono',
        empresaFacturacion: 'Empresa'
      };
      
      if (fieldNames[name]) {
        showSuccess(`Campo "${fieldNames[name]}" válido`, 2000);
      }
    }

    // Mostrar toast de error si el campo es inválido
    if (error && value && value.trim().length > 0) {
      const fieldNames = {
        numeroTarjeta: 'Número de tarjeta',
        cvv: 'CVV',
        mesVencimiento: 'Mes de vencimiento',
        anioVencimiento: 'Año de vencimiento',
        nombreTitular: 'Nombre del titular',
        nombreFacturacion: 'Nombre de facturación',
        emailFacturacion: 'Email de facturación',
        direccionFacturacion: 'Dirección',
        ciudadFacturacion: 'Ciudad',
        estadoFacturacion: 'Estado/Provincia',
        codigoPostal: 'Código postal',
        paisFacturacion: 'País',
        telefonoFacturacion: 'Teléfono',
        empresaFacturacion: 'Empresa'
      };
      
      if (fieldNames[name]) {
        showWarning(`Campo "${fieldNames[name]}": ${error}`, 3000);
      }
    }

    // Llamar al handleChange original
    handleChange(e);
  };

  // Obtener clase CSS para el campo
  const getFieldClass = (fieldName) => {
    if (fieldErrors[fieldName]) {
      return 'error';
    }
    const value = formData[fieldName];
    
    // Para el año, ser menos restrictivo
    if (fieldName === 'anioVencimiento') {
      if (value && value.toString().length >= 4) {
        return 'valid';
      }
      return '';
    }
    
    // Verificar que el valor existe y es un string válido
    // Si no es string, convertirlo a string
    const stringValue = typeof value === 'string' ? value : String(value || '');
    if (stringValue && stringValue.trim().length > 0) {
      return 'valid';
    }
    return '';
  };

  // Calcular progreso del formulario
  const calculateProgress = () => {
    const requiredFields = [
      'numeroTarjeta', 'cvv', 'mesVencimiento', 'anioVencimiento', 'nombreTitular',
      'nombreFacturacion', 'emailFacturacion', 'direccionFacturacion', 
      'ciudadFacturacion', 'estadoFacturacion', 'codigoPostal', 'paisFacturacion', 'telefonoFacturacion'
    ];
    
    const completedFields = requiredFields.filter(field => {
      const value = formData[field];
      // Verificar que el valor existe y es un string válido
      // Si no es string, convertirlo a string
      const stringValue = typeof value === 'string' ? value : String(value || '');
      return stringValue && stringValue.trim().length > 0;
    });
    
    return Math.round((completedFields.length / requiredFields.length) * 100);
  };

  const progress = calculateProgress();

  // Mostrar toast cuando se complete el formulario
  useEffect(() => {
    if (progress === 100) {
      showSuccess('¡Formulario completado al 100%!', 3000);
    } else if (progress >= 75) {
      showInfo('¡Casi completas el formulario!', 2000);
    } else if (progress >= 50) {
      showInfo('¡Mitad del formulario completada!', 2000);
    }
  }, [progress, showSuccess, showInfo]);

  // Función local para manejar el envío del formulario
  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    // Validar todos los campos antes de enviar
    const validationResult = validateForm();
    if (!validationResult.isValid) {
      showError(`Error de validación: ${validationResult.message}`, 4000);
      return;
    }
    
    showSuccess('¡Formulario enviado exitosamente!', 3000);
    handleSubmit(e);
  };

  const onPay = async () => {
    console.log('Cart items:', cart);
    console.log('Total calculado:', total);
    
    const itemsParaOrden = cart.map(item => ({
      product: item.product?._id || item.product?.id,
      quantity: item.quantity || 1,
      price: item.product?.price || 0,
    }));

    console.log('Items para orden:', itemsParaOrden);

    showInfo('Procesando pago simulado...', 2000);

    const result = await handleFakePayment({ 
      userId, 
      items: itemsParaOrden,
      total, 
      clientData: formData 
    });

    if (result?.success) {
      showSuccess('¡Pago simulado exitoso!', 4000);
      clearCart();
      limpiarFormulario();
      setFieldErrors({});
      navigate('/carrito', { replace: true, state: { paid: true, total } });
    } else {
      console.error('Error en pago:', result?.error);
      showError(`Error al procesar el pago simulado: ${result?.error?.message || 'Error desconocido'}`, 4000);
    }
  };

  return (
    <div className="payment-page">
      <div className="payment-wrapper">
        <div className="page-header">
          <h1 className="page-title">Pago Simulado con Tarjeta</h1>
        </div>

        <div className="payment-card">
          {/* Resumen del carrito */}
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
            <h3 style={{ margin: '0 0 12px 0', color: '#6c5ce7', fontSize: '18px' }}>
              📋 Resumen del Carrito
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <strong>Productos:</strong> {cart.length} {cart.length === 1 ? 'producto' : 'productos'}
              </div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#6c5ce7' }}>
                Total: ${total.toFixed(2)}
              </div>
            </div>
            
            {/* Debug info - solo en desarrollo */}
            {process.env.NODE_ENV === 'development' && (
              <div style={{ 
                background: '#fff3cd', 
                border: '1px solid #ffeaa7', 
                borderRadius: '4px', 
                padding: '8px', 
                fontSize: '12px',
                color: '#856404'
              }}>
                <strong>Debug:</strong> Cart length: {cart.length} | 
                Items: {cart.map(item => `${item.product?.name || 'Sin nombre'} (${item.quantity})`).join(', ')}
              </div>
            )}
          </div>

          <div className="section-header">
            <h2 className="section-title">
              <CreditCard size={24} />
              Información de Pago Simulado
            </h2>
            <p className="section-subtitle">
              <Lock size={16} />
              Completa los datos de tu tarjeta para la simulación
            </p>
            
            {/* Barra de progreso */}
            <div className="form-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="progress-text">{progress}% completado</span>
            </div>
          </div>

          <div className="card-form">
            {/* Información de la Tarjeta */}
            <div className="form-section">
              <h3 className="section-subtitle">
                <CreditCard size={18} />
                Datos de la Tarjeta
              </h3>
              
              <InputField 
                id="numeroTarjeta" 
                name="numeroTarjeta" 
                value={formData.numeroTarjeta || ''} 
                onChange={handleFieldChange} 
                type="text" 
                label="Número de tarjeta" 
                placeholder="4242 4242 4242 4242" 
                maxLength="19"
                required 
                className={getFieldClass('numeroTarjeta')}
              />
              {fieldErrors.numeroTarjeta && (
                <div className="field-error">{fieldErrors.numeroTarjeta}</div>
              )}
              
              <InputField 
                id="nombreTitular" 
                name="nombreTitular" 
                value={formData.nombreTitular || ''} 
                onChange={handleFieldChange} 
                type="text" 
                label="Nombre en la tarjeta" 
                placeholder="Como aparece en la tarjeta" 
                required 
                className={getFieldClass('nombreTitular')}
              />
              {fieldErrors.nombreTitular && (
                <div className="field-error">{fieldErrors.nombreTitular}</div>
              )}

              <div className="triple-grid">
                <InputField 
                  id="mesVencimiento" 
                  name="mesVencimiento" 
                  value={formData.mesVencimiento || ''} 
                  onChange={handleFieldChange} 
                  type="text" 
                  label="Mes" 
                  placeholder="MM" 
                  maxLength="2"
                  required 
                  className={getFieldClass('mesVencimiento')}
                />
                <InputField 
                  id="anioVencimiento" 
                  name="anioVencimiento" 
                  value={formData.anioVencimiento || ''} 
                  onChange={handleFieldChange} 
                  type="text" 
                  label="Año" 
                  placeholder="YYYY" 
                  maxLength="4"
                  required 
                  className={getFieldClass('anioVencimiento')}
                />
                <div className={`input-field ${getFieldClass('cvv')}`}>
                  <label htmlFor="cvv" className="input-label">
                    CVV <span className="required">*</span>
                    <HelpCircle size={16} className="help-icon" />
                  </label>
                  <input
                    type="text"
                    id="cvv"
                    name="cvv"
                    value={formData.cvv || ''}
                    onChange={handleFieldChange}
                    className={`input ${getFieldClass('cvv')}`}
                    placeholder="123"
                    maxLength="4"
                    required
                  />
                </div>
              </div>
              {(fieldErrors.mesVencimiento || fieldErrors.anioVencimiento || fieldErrors.cvv) && (
                <div className="field-error">
                  {fieldErrors.mesVencimiento && `Mes: ${fieldErrors.mesVencimiento} `}
                  {fieldErrors.anioVencimiento && `Año: ${fieldErrors.anioVencimiento} `}
                  {fieldErrors.cvv && `CVV: ${fieldErrors.cvv}`}
                </div>
              )}
            </div>

            {/* Información de Facturación */}
            <div className="form-section">
              <h3 className="section-subtitle">
                <Building size={18} />
                Dirección de Facturación
              </h3>
              
              <div className="double-grid">
                <InputField 
                  id="nombreFacturacion" 
                  name="nombreFacturacion" 
                  value={formData.nombreFacturacion || ''} 
                  onChange={handleFieldChange} 
                  type="text" 
                  label="Nombre completo" 
                  placeholder="Nombre y apellidos" 
                  required 
                />
              </div>
              
              <div className="double-grid">
                <InputField 
                  id="emailFacturacion" 
                  name="emailFacturacion" 
                  value={formData.emailFacturacion || ''} 
                  onChange={handleFieldChange} 
                  type="email" 
                  label="Email de facturación" 
                  placeholder="email@ejemplo.com" 
                  required 
                />
                <InputField 
                  id="telefonoFacturacion" 
                  name="telefonoFacturacion" 
                  value={formData.telefonoFacturacion || ''} 
                  onChange={handleFieldChange} 
                  type="tel" 
                  label="Teléfono" 
                  placeholder="+1 (555) 123-4567" 
                  required 
                />
              </div>

              <InputField 
                id="direccionFacturacion" 
                name="direccionFacturacion" 
                value={formData.direccionFacturacion || ''} 
                onChange={handleFieldChange} 
                type="text" 
                label="Dirección" 
                placeholder="Calle, número, apartamento" 
                required 
              />

              <div className="triple-grid">
                <InputField 
                  id="ciudadFacturacion" 
                  name="ciudadFacturacion" 
                  value={formData.ciudadFacturacion || ''} 
                  onChange={handleFieldChange} 
                  type="text" 
                  label="Ciudad" 
                  placeholder="Ciudad" 
                  required 
                />
                <InputField 
                  id="estadoFacturacion" 
                  name="estadoFacturacion" 
                  value={formData.estadoFacturacion || ''} 
                  onChange={handleFieldChange} 
                  type="text" 
                  label="Estado/Provincia" 
                  placeholder="Estado o provincia" 
                  required 
                />
                <InputField 
                  id="codigoPostal" 
                  name="codigoPostal" 
                  value={formData.codigoPostal || ''} 
                  onChange={handleFieldChange} 
                  type="text" 
                  label="Código Postal" 
                  placeholder="Código postal" 
                  required 
                />
              </div>

              <InputField 
                id="paisFacturacion" 
                name="paisFacturacion" 
                value={formData.paisFacturacion || ''} 
                onChange={handleFieldChange} 
                type="text" 
                label="País" 
                placeholder="País" 
                required 
              />
            </div>

            <div className="accepted-cards">
              <span className="accepted-label">Tarjetas aceptadas:</span>
              <div className="card-logos">
                <div className="card-logo visa">VISA</div>
                <div className="card-logo mastercard">MASTERCARD</div>
                <div className="card-logo amex">AMEX</div>
                <div className="card-logo discover">DISCOVER</div>
              </div>
          </div>

            <div className="actions actions-duo">
              <Button 
                onClick={() => {
                  showInfo('Volviendo al carrito...', 2000);
                  setTimeout(() => navigate('/carrito'), 1000);
                }} 
                variant="secondary" 
                className="btn-secondary" 
                text="Volver al Carrito" 
              />
              <Button 
                onClick={() => {
                  limpiarFormulario();
                  setFieldErrors({});
                  showInfo('Formulario limpiado', 2000);
                }} 
                variant="secondary" 
                className="btn-secondary" 
                text="Limpiar Formulario" 
              />
              <Button 
                onClick={handleFormSubmit} 
                variant="primary" 
                className="btn-primary" 
                text="Simular Pago" 
              />
            </div>
          </div>
        </div>

        {datosEnviados && (
          <div className="payment-card" style={{ marginTop: 16 }}>
            <div className="section-header">
              <h3 className="section-title">✅ Datos Recibidos</h3>
              <p className="section-subtitle">Revisa y confirma el pago de prueba.</p>
            </div>
            <div className="form-grid">
              <div>
                <strong>Nombre:</strong> {datosEnviados.nombreFacturacion || datosEnviados.nombreTitular}
              </div>
              <div>
                <strong>Email:</strong> {datosEnviados.emailFacturacion}
              </div>
              <div>
                <strong>Tarjeta:</strong> {datosEnviados.numeroTarjeta ? `**** **** **** ${datosEnviados.numeroTarjeta.slice(-4)}` : 'No especificada'}
              </div>
              <div className="actions actions-duo">
                <Button onClick={onPay} text={`Pagar $${total.toFixed(2)}`} variant="secondary" className="btn-primary" />
                <Button onClick={limpiarFormulario} text="Editar" variant="secondary" className="btn-secondary" />
              </div>
            </div>
          </div>
        )}
      </div>
      
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default FormPaymentFake;
