<<<<<<< HEAD
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
=======
import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../hooks/useAuth.jsx";
import { useCart } from "../context/CartContext.jsx";
import usePaymentFakeForm from "../components/payment/hook/usePaymentFakeForm.jsx";
>>>>>>> master
import InputField from "../components/payment/InputField";
import Button from "../components/payment/Button";
import { CreditCard, Lock, Shield, Building, HelpCircle } from "lucide-react";
import { useToast } from "../hooks/useToast";
import ToastContainer from "../components/ui/ToastContainer";
import "../components/styles/formPayment.css";
<<<<<<< HEAD
import { useCart } from "../context/CartContext";
=======
>>>>>>> master

const FormPaymentFake = () => {
  const navigate = useNavigate();
<<<<<<< HEAD
  const location = useLocation();
  const { clearCart, getTotal } = useCart();
  const [step, setStep] = useState(1);
  const totalFromCart = location.state?.total || getTotal();
  
  const [formData, setFormData] = useState({
    nombre: "",
    email: ""
  });
  const [formDataTarjeta, setFormDataTarjeta] = useState({
    numeroTarjeta: "",
    nombreTarjeta: "",
    mesVencimiento: "",
    anioVencimiento: "",
    cvv: ""
  });
  const [errors, setErrors] = useState({});
=======
  const userId = user?.id;
  const { cart, clearCart, loadCart } = useCart(userId);
>>>>>>> master

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

<<<<<<< HEAD
  const handleChangeData = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
=======
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
>>>>>>> master
    });
  };

<<<<<<< HEAD
  const handleChangeTarjeta = (e) => {
    const { name, value } = e.target;
    
    if (name === 'numeroTarjeta') {
      const numericValue = value.replace(/[^0-9]/g, '').slice(0, 16);
      setFormDataTarjeta({
        ...formDataTarjeta,
        [name]: numericValue
      });
    } else if (name === 'cvv') {
      const numericValue = value.replace(/[^0-9]/g, '').slice(0, 3);
      setFormDataTarjeta({
        ...formDataTarjeta,
        [name]: numericValue
      });
    } else {
      setFormDataTarjeta({
        ...formDataTarjeta,
        [name]: value
      });
=======
    if (result?.success) {
      showSuccess('¡Pago simulado exitoso!', 4000);
      clearCart();
      limpiarFormulario();
      setFieldErrors({});
      navigate('/carrito', { replace: true, state: { paid: true, total } });
    } else {
      console.error('Error en pago:', result?.error);
      showError(`Error al procesar el pago simulado: ${result?.error?.message || 'Error desconocido'}`, 4000);
>>>>>>> master
    }
  };

  const validateFirstStep = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = "Nombre es requerido";
    if (!formData.email.trim()) {
      newErrors.email = "Email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email no válido";
    }
    
    if (Object.keys(newErrors).length === 0) {
      setErrors({});
      setStep(2);
    } else {
      setErrors(newErrors);
    }
  };

  const validateSecondStep = () => {
    const newErrors = {};
    const cardNumber = formDataTarjeta.numeroTarjeta.replace(/\s/g, '');
    
    if (!cardNumber || cardNumber.length !== 16) {
      newErrors.numeroTarjeta = "Se requieren exactamente 16 dígitos";
    }
    if (!formDataTarjeta.nombreTarjeta.trim()) {
      newErrors.nombreTarjeta = "Nombre en tarjeta es requerido";
    }
    if (!formDataTarjeta.mesVencimiento) {
      newErrors.mesVencimiento = "Mes requerido";
    }
    if (!formDataTarjeta.anioVencimiento) {
      newErrors.anioVencimiento = "Año requerido";
    }
    if (!formDataTarjeta.cvv || formDataTarjeta.cvv.length !== 3) {
      newErrors.cvv = "Se requieren exactamente 3 dígitos";
    }
    
    if (Object.keys(newErrors).length === 0) {
      setErrors({});
      handleFinishPayment();
    } else {
      setErrors(newErrors);
    }
  };

  const handleFinishPayment = () => {
    clearCart();
    setStep(3);
  };

  const icons = {
    creditCard: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
        <line x1="1" y1="10" x2="23" y2="10"></line>
      </svg>
    ),
    user: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    ),
    mail: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
        <polyline points="22,6 12,13 2,6"></polyline>
      </svg>
    ),
    helpCircle: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
        <line x1="12" y1="17" x2="12" y2="17"></line>
      </svg>
    ),
    arrowLeft: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
      </svg>
    ),
    check: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    ),
    shoppingBag: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <path d="M16 10a4 4 0 0 1-8 0"></path>
      </svg>
    ),
    home: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
    )
  };

  return (
<<<<<<< HEAD
    <div className="payment-container">
      <div className="payment-card">
        {step === 1 && (
          <>
            <div className="payment-header">
              <h1 className="payment-title">
                {icons.creditCard}
                Pago Simulado
              </h1>
              <p className="payment-subtitle">
                Completa los datos para generar una orden de prueba
              </p>
              
              <div className="payment-total">
                <span>Total a pagar:</span>
                <span className="total-amount">${totalFromCart.toFixed(2)}</span>
              </div>
            </div>

            <div className="payment-form" autoComplete="off">
              <div className="form-section">
                <div className="input-group">
                  <label htmlFor="nombre" className="input-label">
                    {icons.user}
                    Nombre del Cliente
                    <span className="required-field">*</span>
                  </label>
                  <InputField
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChangeData}
                    type="text"
                    placeholder="Nombre completo"
                    required
                    error={errors.nombre}
                    autoComplete="off"
                  />
                  {errors.nombre && <span className="error-message">{errors.nombre}</span>}
                </div>
=======
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
            border: '1px solid #e9ecef'
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
>>>>>>> master

                <div className="input-group">
                  <label htmlFor="email" className="input-label">
                    {icons.mail}
                    Email del Cliente
                    <span className="required-field">*</span>
                  </label>
                  <InputField
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChangeData}
                    type="email"
                    placeholder="correo@ejemplo.com"
                    required
                    error={errors.email}
                    autoComplete="off"
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>
              </div>

              <div className="form-footer">
                <Button
                  onClick={validateFirstStep}
                  variant="primary"
                  className="btn-primary"
                  text="Continuar al Pago"
                />
              </div>
            </div>
<<<<<<< HEAD
          </>
        )}

        {step === 2 && (
          <div className="payment-process">
            <div className="payment-details">
              <h3 className="payment-details-title">
                {icons.creditCard}
                Información de Pago
              </h3>
              
              <div className="payment-summary">
                <div className="summary-total">
                  <span>Total a pagar:</span>
                  <span className="total-amount">${totalFromCart.toFixed(2)}</span>
                </div>
              </div>

              <div className="card-form" autoComplete="off">
                <div className="input-group">
                  <label htmlFor="numeroTarjeta" className="input-label">
                    Número de tarjeta
                    <span className="required-field">*</span>
                  </label>
                  <div className="card-input">
                    {icons.creditCard}
                    <InputField
                      id="numeroTarjeta"
                      name="numeroTarjeta"
                      value={formatCardNumber(formDataTarjeta.numeroTarjeta)}
                      onChange={handleChangeTarjeta}
                      type="text"
                      placeholder="4242 4242 4242 4242"
                      required
                      maxLength="19"
                      error={errors.numeroTarjeta}
                      autoComplete="cc-number"
                      inputMode="numeric"
                    />
                  </div>
                  {errors.numeroTarjeta && <span className="error-message">{errors.numeroTarjeta}</span>}
                </div>

                <div className="input-group">
                  <label htmlFor="nombreTarjeta" className="input-label">
                    Nombre en la tarjeta
                    <span className="required-field">*</span>
                  </label>
                  <InputField
                    id="nombreTarjeta"
                    name="nombreTarjeta"
                    value={formDataTarjeta.nombreTarjeta}
                    onChange={handleChangeTarjeta}
                    type="text"
                    placeholder="Como aparece en la tarjeta"
                    required
                    error={errors.nombreTarjeta}
                    autoComplete="cc-name"
                  />
                  {errors.nombreTarjeta && <span className="error-message">{errors.nombreTarjeta}</span>}
                </div>

                <div className="double-grid">
                  <div className="input-group">
                    <label className="input-label">
                      Fecha de vencimiento
                      <span className="required-field">*</span>
                    </label>
                    <div className="expiry-fields">
                      <select
                        name="mesVencimiento"
                        value={formDataTarjeta.mesVencimiento}
                        onChange={handleChangeTarjeta}
                        className={`expiry-select ${errors.mesVencimiento ? 'error' : ''}`}
                        required
                        autoComplete="cc-exp-month"
                      >
                        <option value="">Mes</option>
                        {Array.from({length: 12}, (_, i) => (
                          <option key={i+1} value={String(i+1).padStart(2, '0')}>
                            {String(i+1).padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                      <select
                        name="anioVencimiento"
                        value={formDataTarjeta.anioVencimiento}
                        onChange={handleChangeTarjeta}
                        className={`expiry-select ${errors.anioVencimiento ? 'error' : ''}`}
                        required
                        autoComplete="cc-exp-year"
                      >
                        <option value="">Año</option>
                        {Array.from({length: 10}, (_, i) => (
                          <option key={i} value={new Date().getFullYear() + i}>
                            {new Date().getFullYear() + i}
                          </option>
                        ))}
                      </select>
                    </div>
                    {(errors.mesVencimiento || errors.anioVencimiento) && (
                      <span className="error-message">
                        {errors.mesVencimiento || errors.anioVencimiento}
                      </span>
                    )}
                  </div>

                  <div className="input-group">
                    <div className="cvv-label-container">
                      <label htmlFor="cvv" className="input-label">
                        CVV
                        <span className="required-field">*</span>
                      </label>
                      <span className="help-tooltip">
                        {icons.helpCircle}
                        <span className="tooltip-text">
                          El CVV son los 3 dígitos en el reverso de tu tarjeta
                        </span>
                      </span>
                    </div>
                    <InputField
                      id="cvv"
                      name="cvv"
                      value={formDataTarjeta.cvv}
                      onChange={handleChangeTarjeta}
                      type="text"
                      placeholder="123"
                      required
                      maxLength="3"
                      error={errors.cvv}
                      autoComplete="off"
                      inputMode="numeric"
                    />
                    {errors.cvv && <span className="error-message">{errors.cvv}</span>}
                  </div>
                </div>

                <div className="accepted-cards">
                  <span>Tarjetas aceptadas:</span>
                  <div className="card-brands">
                    <div className="card-brand visa">VISA</div>
                    <div className="card-brand mastercard">MASTERCARD</div>
                  </div>
                </div>
              </div>

              <div className="payment-actions">
                <Button
                  onClick={() => setStep(1)}
                  variant="secondary"
                  className="btn-secondary"
                  text="Volver"
                  icon={icons.arrowLeft}
                />
                <Button
                  onClick={validateSecondStep}
                  variant="primary"
                  className="btn-primary"
                  text="Confirmar Pago"
                />
=======
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
>>>>>>> master
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <motion.div
            className="payment-success"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className="success-icon"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 20 }}
            >
              {icons.check}
            </motion.div>
            <h2 className="success-title">¡Pago Simulado Exitoso!</h2>
            <p className="success-message">
              Esta es una simulación, no se ha realizado ningún cargo real
            </p>

            <div className="success-details">
              <div className="detail-item">
                <span className="detail-label">Nombre:</span>
                <span className="detail-value">{formData.nombre}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{formData.email}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Tarjeta:</span>
                <span className="detail-value">•••• •••• •••• {formDataTarjeta.numeroTarjeta.slice(-4)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Total:</span>
                <span className="detail-value">${totalFromCart.toFixed(2)}</span>
              </div>
            </div>

            <div className="success-actions">
              <Button
                onClick={() => navigate('/catalogo')}
                variant="primary"
                className="btn-primary"
                text="Seguir Comprando"
                icon={icons.shoppingBag}
              />
              <Button
                onClick={() => navigate('/')}
                variant="secondary"
                className="btn-secondary"
                text="Volver al Inicio"
                icon={icons.home}
              />
            </div>
          </motion.div>
        )}
      </div>
      
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default FormPaymentFake;