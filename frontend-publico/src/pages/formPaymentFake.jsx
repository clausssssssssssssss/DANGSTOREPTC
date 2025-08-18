import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../hooks/useAuth.jsx";
import { useCart } from "../context/CartContext.jsx";
import usePaymentFakeForm from "../components/payment/hook/usePaymentFakeForm.jsx";
import InputField from "../components/payment/InputField";
import Button from "../components/payment/Button";
import { CreditCard, Lock, Shield, Building, HelpCircle, MapPin, CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { useToast } from "../hooks/useToast";
import ToastContainer from "../components/ui/ToastContainer";
import "../components/styles/formPayment.css";

const FormPaymentFake = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userId = user?.id;
  const { cart, clearCart, loadCart, loading } = useCart(userId);

  // calcula total y cantidad
  const total = cart.reduce((sum, item) => sum + (item.product?.price || 0) * (item.quantity || 0), 0);

  // Asegurar que el carrito se cargue cuando el componente se monte
  useEffect(() => {
    if (userId) {
      console.log('FormPaymentFake: Loading cart for user:', userId);
      loadCart(userId);
    }
  }, [userId]); // Solo depende de userId para evitar bucles infinitos

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

  const [fieldErrors, setFieldErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1); // Nuevo estado para controlar los pasos

  // Validar campo individual en tiempo real
  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'numeroTarjeta':
        const cleanNumber = value.replace(/\s/g, '');
        if (!value) {
          error = 'Número de tarjeta es requerido';
        } else if (cleanNumber.length !== 16) {
          error = 'Debe tener exactamente 16 dígitos';
        } else if (!/^\d+$/.test(cleanNumber)) {
          error = 'Solo números permitidos';
        }
        break;
        
      case 'cvv':
        if (!value) {
          error = 'CVV es requerido';
        } else if (!/^\d+$/.test(value)) {
          error = 'Solo números permitidos';
        } else if (value.length < 3) {
          error = 'Mínimo 3 dígitos';
        } else if (value.length > 4) {
          error = 'Máximo 4 dígitos';
        }
        break;
        
      case 'mesVencimiento':
        if (!value) {
          error = 'Mes es requerido';
        } else if (!/^\d+$/.test(value)) {
          error = 'Solo números permitidos';
        } else if (parseInt(value) < 1 || parseInt(value) > 12) {
          error = 'Mes inválido (1-12)';
        }
        break;
        
      case 'anioVencimiento':
        if (!value) {
          error = 'Año es requerido';
        } else if (!/^\d+$/.test(value)) {
          error = 'Solo números permitidos';
        } else if (value.length !== 4) {
          error = 'Debe tener 4 dígitos';
        } else {
          const currentYear = new Date().getFullYear();
          const inputYear = parseInt(value);
          if (inputYear < currentYear) {
            error = 'Año no puede ser anterior al actual';
          } else if (inputYear > currentYear + 20) {
            error = 'Año muy lejano';
          }
        }
        break;
        
      case 'nombreTitular':
        if (!value) {
          error = 'Nombre del titular es requerido';
        } else if (value.trim().length < 2) {
          error = 'Mínimo 2 caracteres';
        } else if (value.trim().length > 50) {
          error = 'Máximo 50 caracteres';
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value.trim())) {
          error = 'Solo letras y espacios permitidos';
        }
        break;
        
      case 'nombreFacturacion':
        if (!value) {
          error = 'Nombre de facturación es requerido';
        } else if (value.trim().length < 2) {
          error = 'Mínimo 2 caracteres';
        } else if (value.trim().length > 100) {
          error = 'Máximo 100 caracteres';
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value.trim())) {
          error = 'Solo letras y espacios permitidos';
        }
        break;
        
      case 'emailFacturacion':
        if (!value) {
          error = 'Email de facturación es requerido';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Formato de email inválido';
        } else if (value.length > 100) {
          error = 'Máximo 100 caracteres';
        }
        break;
        
      case 'telefonoFacturacion':
        if (!value) {
          error = 'Teléfono es requerido';
        } else {
          const cleanPhone = value.replace(/[^0-9]/g, '');
          if (cleanPhone.length < 7) {
          error = 'Mínimo 7 dígitos';
          } else if (cleanPhone.length > 15) {
            error = 'Máximo 15 dígitos';
          }
        }
        break;
        
      case 'direccionFacturacion':
        if (!value) {
          error = 'Dirección es requerida';
        } else if (value.trim().length < 5) {
          error = 'Mínimo 5 caracteres';
        } else if (value.trim().length > 200) {
          error = 'Máximo 200 caracteres';
        }
        break;
        
      case 'ciudadFacturacion':
        if (!value) {
          error = 'Ciudad es requerida';
        } else if (value.trim().length < 2) {
          error = 'Mínimo 2 caracteres';
        } else if (value.trim().length > 50) {
          error = 'Máximo 50 caracteres';
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value.trim())) {
          error = 'Solo letras y espacios permitidos';
        }
        break;
        
      case 'estadoFacturacion':
        if (!value) {
          error = 'Estado/Provincia es requerido';
        } else if (value.trim().length < 2) {
          error = 'Mínimo 2 caracteres';
        } else if (value.trim().length > 50) {
          error = 'Máximo 50 caracteres';
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value.trim())) {
          error = 'Solo letras y espacios permitidos';
        }
        break;
        
      case 'codigoPostal':
        if (!value) {
          error = 'Código postal es requerido';
        } else if (value.trim().length < 3) {
          error = 'Mínimo 3 caracteres';
        } else if (value.trim().length > 10) {
          error = 'Máximo 10 caracteres';
        }
        break;
        
      case 'paisFacturacion':
        if (!value) {
          error = 'País es requerido';
        } else if (value.trim().length < 2) {
          error = 'Mínimo 2 caracteres';
        } else if (value.trim().length > 50) {
          error = 'Máximo 50 caracteres';
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value.trim())) {
          error = 'Solo letras y espacios permitidos';
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

    // Llamar al handleChange original
    handleChange(e);
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
      // Solo limpiar el carrito después de que la orden se haya guardado exitosamente
      try {
        await clearCart();
      } catch (err) {
        console.error('Error al limpiar carrito:', err);
      }
      limpiarFormulario();
      setFieldErrors({});
      setCurrentStep(4); // Ir al paso de confirmación exitosa
    } else {
      console.error('Error en pago:', result?.error);
      showError(`Error al procesar el pago simulado: ${result?.error?.message || 'Error desconocido'}`, 4000);
    }
  };

  // Timeout para redirigir al catálogo después de 19 segundos
  useEffect(() => {
    let timeoutId;
    
    if (currentStep === 4) {
      timeoutId = setTimeout(() => {
        setCurrentStep(1);
        limpiarFormulario();
        setFieldErrors({});
        clearCart();
        navigate('/catalogo');
      }, 19000); // 19 segundos
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [currentStep, navigate]);

  // Función para validar el paso actual antes de continuar
  const validateCurrentStep = () => {
    let isValid = true;
    let message = '';
    let invalidFields = [];

    switch (currentStep) {
      case 1: // Datos de tarjeta
        const cardFields = ['numeroTarjeta', 'nombreTitular', 'mesVencimiento', 'anioVencimiento', 'cvv'];
        cardFields.forEach(field => {
          const error = validateField(field, formData[field] || '');
          if (error) {
            invalidFields.push(field);
            isValid = false;
          }
        });
        
        if (!isValid) {
          const fieldNames = {
            numeroTarjeta: 'Número de tarjeta',
            nombreTitular: 'Nombre del titular',
            mesVencimiento: 'Mes de vencimiento',
            anioVencimiento: 'Año de vencimiento',
            cvv: 'CVV'
          };
          message = `Completa correctamente: ${invalidFields.map(field => fieldNames[field]).join(', ')}`;
        }
        break;
        
      case 2: // Facturación
        const billingFields = [
          'nombreFacturacion', 'emailFacturacion', 'telefonoFacturacion', 
          'direccionFacturacion', 'ciudadFacturacion', 'estadoFacturacion', 
          'codigoPostal', 'paisFacturacion'
        ];
        billingFields.forEach(field => {
          const error = validateField(field, formData[field] || '');
          if (error) {
            invalidFields.push(field);
            isValid = false;
          }
        });
        
        if (!isValid) {
          const fieldNames = {
            nombreFacturacion: 'Nombre completo',
            emailFacturacion: 'Email de facturación',
            telefonoFacturacion: 'Teléfono',
            direccionFacturacion: 'Dirección',
            ciudadFacturacion: 'Ciudad',
            estadoFacturacion: 'Estado/Provincia',
            codigoPostal: 'Código postal',
            paisFacturacion: 'País'
          };
          message = `Completa correctamente: ${invalidFields.map(field => fieldNames[field]).join(', ')}`;
        }
        break;
        
      default:
        break;
    }

    if (!isValid) {
      showError(message, 4000);
    }
    return isValid;
  };

  // Función para ir al siguiente paso
  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  // Función para ir al paso anterior
  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  return (
    <div className="payment-page">
      <div className="payment-wrapper">
        <div className="page-header">
          <h1 className="page-title">Pago Simulado con Tarjeta</h1>
        </div>

        <div className="payment-card">
          {/* Resumen del carrito - solo visible en pasos 1, 2 y 3 */}
          {currentStep !== 4 && (
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
                  <strong>Productos:</strong> {loading ? 'Cargando...' : `${cart.length} ${cart.length === 1 ? 'producto' : 'productos'}`}
                </div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#6c5ce7' }}>
                  Total: {loading ? 'Cargando...' : `$${total.toFixed(2)}`}
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
                  Items: {cart.map(item => `${item.product?.name || 'Sin nombre'} (${item.quantity})`).join(', ')} |
                  User ID: {userId} |
                  Loading: {loading}
                </div>
              )}
            </div>
          )}

          {/* Indicador de pasos - solo visible en pasos 1, 2 y 3 */}
          {currentStep !== 4 && (
            <div className="step-indicator" style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: '20px', 
              marginBottom: '30px',
              padding: '20px',
              background: '#f8f9fa',
              borderRadius: '12px',
              border: '1px solid #e9ecef',
              flexWrap: 'wrap'
            }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              color: currentStep >= 1 ? '#6c5ce7' : '#999',
              fontWeight: currentStep >= 1 ? 'bold' : 'normal',
              minWidth: '120px',
              justifyContent: 'center'
            }}>
              <div style={{ 
                width: '30px', 
                height: '30px', 
                borderRadius: '50%', 
                background: currentStep >= 1 ? '#6c5ce7' : '#e9ecef',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                1
              </div>
              <span style={{ fontSize: '14px' }}>Tarjeta</span>
            </div>
            
            <ArrowRight size={20} color="#999" style={{ display: window.innerWidth <= 768 ? 'none' : 'block' }} />
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              color: currentStep >= 2 ? '#6c5ce7' : '#999',
              fontWeight: currentStep >= 2 ? 'bold' : 'normal',
              minWidth: '120px',
              justifyContent: 'center'
            }}>
              <div style={{ 
                width: '30px', 
                height: '30px', 
                borderRadius: '50%', 
                background: currentStep >= 2 ? '#6c5ce7' : '#e9ecef',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                2
              </div>
              <span style={{ fontSize: '14px' }}>Facturación</span>
            </div>
            
            <ArrowRight size={20} color="#999" style={{ display: window.innerWidth <= 768 ? 'none' : 'block' }} />
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              color: currentStep >= 3 ? '#6c5ce7' : '#999',
              fontWeight: currentStep >= 3 ? 'bold' : 'normal',
              minWidth: '120px',
              justifyContent: 'center'
            }}>
              <div style={{ 
                width: '30px', 
                height: '30px', 
                borderRadius: '50%', 
                background: currentStep >= 3 ? '#6c5ce7' : '#e9ecef',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                3
              </div>
              <span style={{ fontSize: '14px' }}>Confirmar</span>
            </div>
          </div>
        )}

          {/* PASO 1: DATOS DE LA TARJETA */}
          {currentStep === 1 && (
            <div className="card-form">
          <div className="section-header">
            <h2 className="section-title">
              <CreditCard size={24} />
                  Datos de la Tarjeta
            </h2>
            <p className="section-subtitle">
              <Lock size={16} />
              Completa los datos de tu tarjeta para la simulación
            </p>
          </div>

            <div className="form-section">
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
                />
                   <div className="input-field">
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
                       className="input"
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

                <div className="accepted-cards">
                  <span className="accepted-label">Tarjetas aceptadas:</span>
                  <div className="card-logos">
                    <div className="card-logo visa">VISA</div>
                    <div className="card-logo mastercard">MASTERCARD</div>
                  </div>
            </div>

                <div className="form-footer">
                  <Button 
                    onClick={nextStep} 
                    variant="primary" 
                    className="btn-primary" 
                    text="Continuar a Facturación" 
                  />
                </div>
              </div>
            </div>
          )}

          {/* PASO 2: DIRECCIÓN DE FACTURACIÓN */}
          {currentStep === 2 && (
            <div className="card-form">
              <div className="section-header">
                <h2 className="section-title">
                  <Building size={24} />
                Dirección de Facturación
                </h2>
                <p className="section-subtitle">
                  <MapPin size={16} />
                  Completa tu información de facturación
                </p>
              </div>

              <div className="form-section">
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

                <div className="form-footer">
                  <Button 
                    onClick={prevStep} 
                    variant="secondary" 
                    className="btn-secondary" 
                    text="Volver a Tarjeta" 
                  />
                  <Button 
                    onClick={nextStep} 
                    variant="primary" 
                    className="btn-primary" 
                    text="Continuar a Confirmación" 
                  />
                </div>
              </div>
            </div>
          )}

          {/* PASO 3: CONFIRMACIÓN */}
          {currentStep === 3 && (
            <div className="card-form">
              <div className="section-header">
                <h2 className="section-title">
                  <CheckCircle size={24} />
                  Confirmar Pago
                </h2>
                <p className="section-subtitle">
                  Revisa los datos antes de confirmar
                </p>
              </div>

              <div className="confirmation-details">
                <div className="detail-section">
                  <h4>Datos de la Tarjeta</h4>
                  <p>•••• •••• •••• {formData.numeroTarjeta ? formData.numeroTarjeta.slice(-4) : '****'}</p>
                  <p>{formData.nombreTitular || 'No especificado'}</p>
                </div>

                <div className="detail-section">
                  <h4>Dirección de Facturación</h4>
                  <p>{formData.nombreFacturacion || 'No especificado'}</p>
                  <p>{formData.direccionFacturacion || 'No especificado'}</p>
                  <p>{formData.ciudadFacturacion || 'No especificado'}, {formData.estadoFacturacion || 'No especificado'} {formData.codigoPostal || 'No especificado'}</p>
                  <p>{formData.paisFacturacion || 'No especificado'}</p>
            </div>

                <div className="detail-section" style={{ background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '8px', padding: '16px' }}>
                  <h4 style={{ color: '#6c5ce7', marginBottom: '12px' }}>Resumen de la Compra</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span>Productos:</span>
                    <strong>{cart.length} {cart.length === 1 ? 'producto' : 'productos'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span>Total:</span>
                    <strong style={{ color: '#6c5ce7', fontSize: '18px' }}>${total.toFixed(2)}</strong>
              </div>
          </div>

                <div className="form-footer">
              <Button 
                    onClick={prevStep} 
                variant="secondary" 
                className="btn-secondary" 
                    text="Volver a Facturación" 
              />
              <Button 
                    onClick={onPay} 
                variant="primary" 
                className="btn-primary" 
                    text={`Confirmar Pago $${total.toFixed(2)}`} 
              />
            </div>
          </div>
        </div>
          )}

                    {/* PASO 4: PAGO EXITOSO */}
          {currentStep === 4 && (
            <div className="card-form">
            <div className="section-header">
                <h2 className="section-title" style={{ color: '#00b894' }}>
                  <CheckCircle size={24} />
                  ¡Pago Exitoso!
                </h2>
                <p className="section-subtitle">
                  Tu pedido ha sido procesado correctamente y guardado en nuestra base de datos. Recibirás un correo de confirmación con los detalles de tu compra.
                </p>
                <p className="section-subtitle" style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
                  ⏰ Serás redirigido al catálogo en 19 segundos...
                </p>
            </div>

              <div className="form-footer">
                <Button 
                  onClick={() => {
                    setCurrentStep(1);
                    limpiarFormulario();
                    setFieldErrors({});
                    clearCart();
                    navigate('/catalogo');
                  }} 
                  variant="primary" 
                  className="btn-primary" 
                  text="Seguir comprando" 
                />
                <Button 
                  onClick={() => {
                    setCurrentStep(1);
                    limpiarFormulario();
                    setFieldErrors({});
                    clearCart();
                    navigate('/perfil');
                  }} 
                  variant="secondary" 
                  className="btn-secondary" 
                  text="Ver mis pedidos" 
                />
            </div>
          </div>
        )}
        </div>
      </div>
      
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default FormPaymentFake;
