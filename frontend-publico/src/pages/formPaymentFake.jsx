import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from "../hooks/useAuth.jsx";
import { useCart } from "../context/CartContext.jsx";
import usePaymentFakeForm from "../components/payment/hook/usePaymentFakeForm.jsx";
import InputField from "../components/payment/InputField";
import Button from "../components/payment/Button";
import { CreditCard, Lock, Shield, Building, HelpCircle, MapPin, CheckCircle, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useToast } from "../hooks/useToast";
import ToastContainer from "../components/ui/ToastContainer";
import "../components/styles/formPayment.css";

const FormPaymentFake = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const userId = user?.id;
  const { cart, clearCart, loadCart, loading } = useCart();
  
  // Estado para manejar cotizaciones aceptadas
  const [quoteItem, setQuoteItem] = useState(null);
  const [isQuotePayment, setIsQuotePayment] = useState(false);
  const [originalTotal, setOriginalTotal] = useState(0);
  
  // Estado para datos del carrito desde la navegación
  const [cartFromState, setCartFromState] = useState(null);
  const [totalFromState, setTotalFromState] = useState(0);

  // calcula total y cantidad - incluye cotizaciones
  const total = quoteItem 
  ? (quoteItem.price ?? quoteItem.precio ?? 0)
  : cartFromState && cartFromState.length > 0
  ? totalFromState
  : cart.reduce((sum, item) => {
      const price = item.product?.price ?? item.product?.precio ?? 0;
      return sum + price * (item.quantity || 0);
    }, 0);

  // Debug: Log del total y carrito (comentado para producción)
  // console.log('FormPaymentFake - Total calculado:', total);
  // console.log('FormPaymentFake - Carrito actual:', cart);
  // console.log('FormPaymentFake - Carrito desde state:', cartFromState);
  // console.log('FormPaymentFake - Total desde state:', totalFromState);
  // console.log('FormPaymentFake - QuoteItem:', quoteItem);

  // Guardar el total original cuando se carga el componente
  useEffect(() => {
    if (total > 0 && originalTotal === 0) {
      setOriginalTotal(total);
      // console.log('FormPaymentFake - Total original guardado:', total);
    }
  }, [total, originalTotal]);

  // Asegurar que el carrito se cargue cuando el componente se monte
  useEffect(() => {
    if (userId) {
      // console.log('FormPaymentFake: Loading cart for user:', userId);
      loadCart(userId);
    }
  }, [userId, loadCart]);

  // Debug: Log del carrito cuando cambia (comentado para producción)
  // useEffect(() => {
  //   console.log('FormPaymentFake - Carrito actualizado:', cart);
  //   console.log('FormPaymentFake - Loading state:', loading);
  // }, [cart, loading]);

  // Detectar si hay una cotización en la URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const quoteParam = urlParams.get('quote');
    
    if (quoteParam) {
      try {
        const parsedQuote = JSON.parse(decodeURIComponent(quoteParam));
        setQuoteItem(parsedQuote);
        setIsQuotePayment(true);
        console.log('Cotización detectada desde URL:', parsedQuote);
      } catch (error) {
        console.error('Error parsing quote:', error);
        showError('Error al procesar la cotización');
      }
    }
  }, []);

  // Detectar si hay una cotización en el estado de navegación
  useEffect(() => {
    // console.log('FormPaymentFake - location.state:', location.state);
    // console.log('FormPaymentFake - location.pathname:', location.pathname);
    
    if (location.state && location.state.quoteItem) {
      setQuoteItem(location.state.quoteItem);
      setIsQuotePayment(location.state.isQuotePayment || true);
      // console.log('Cotización detectada desde state:', location.state.quoteItem);
      // console.log('isQuotePayment establecido a:', location.state.isQuotePayment || true);
    } else if (location.state && location.state.items) {
      // Datos del carrito desde la navegación
      setCartFromState(location.state.items);
      setTotalFromState(location.state.total);
      // console.log('Carrito detectado desde state:', location.state.items);
      // console.log('Total detectado desde state:', location.state.total);
    } else {
      // console.log('No hay datos en location.state');
    }
  }, [location.state]);

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
  const [isProcessingPayment, setIsProcessingPayment] = useState(false); // Estado para mostrar pantalla de carga
  const [showProcessingScreen, setShowProcessingScreen] = useState(false); // Estado para pantalla independiente

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
    console.log('=== BOTÓN CONFIRMAR PAGO PRESIONADO ===');
    console.log('=== INICIANDO PROCESO DE PAGO ===');
    console.log('Cart items:', cart);
    console.log('Quote item:', quoteItem);
    console.log('Total calculado:', total);
    console.log('isQuotePayment:', isQuotePayment);
    console.log('formData:', formData);
    
    // Validar formulario antes de proceder
    const validation = validateForm();
    console.log('Validación del formulario:', validation);
    
    if (!validation.isValid) {
      console.log('❌ Validación falló:', validation.message);
      showError(validation.message);
      return;
    }

    // Mostrar pantalla independiente de procesamiento
    setShowProcessingScreen(true);
    console.log('🔄 Mostrando pantalla independiente de procesamiento...');
    
    try {
      let itemsParaOrden;
    
    if (isQuotePayment && quoteItem) {
      // Pago de cotización aceptada
      itemsParaOrden = [{
        product: quoteItem.product._id,
        quantity: quoteItem.quantity,
        price: quoteItem.price,
      }];
      // console.log('Items de cotización para orden:', itemsParaOrden);
    } else {
      // Pago del carrito normal - usar datos del state si están disponibles
      const cartToUse = cartFromState && cartFromState.length > 0 ? cartFromState : cart;
      itemsParaOrden = cartToUse.map(item => ({
        product: item.product?._id || item.product?.id,
        quantity: item.quantity || 1,
        price: item.product?.price || 0,
      }));
      // console.log('Items del carrito para orden:', itemsParaOrden);
      // console.log('Carrito usado:', cartToUse);
    }

    // console.table(cart.map(item => ({
    //   id: item.product.id,
    //   name: item.product.name,
    //   price: item.product.price,
    //   quantity: item.quantity
    // })));


    showInfo('Procesando pago simulado...', 2000);

    const totalToSend = originalTotal > 0 ? originalTotal : total;
    // console.log('=== DEBUG PAGO ===');
    // console.log('Items para orden:', itemsParaOrden);
    // console.log('Total original guardado:', originalTotal);
    // console.log('Total actual calculado:', total);
    // console.log('Total que se enviará:', totalToSend);
    // console.log('Carrito actual:', cart);
    // console.log('==================');

    console.log('🔄 Llamando a handleFakePayment con:', { 
      items: itemsParaOrden, 
      total: originalTotal > 0 ? originalTotal : total 
    });
    
    const result = await handleFakePayment({ 
      items: itemsParaOrden,
      total: originalTotal > 0 ? originalTotal : total
    });

    console.log('📋 Resultado de handleFakePayment:', result);

    // SIEMPRE ir al paso 4 - la compra se realiza independientemente del resultado
    console.log('🔄 Procesando pago y navegando al paso 4...');
    
    // Mostrar mensaje de éxito
    if (result?.success) {
      console.log('✅ Pago exitoso confirmado por el servidor');
      showSuccess('¡Pago simulado exitoso!', 4000);
    } else {
      console.log('⚠️ Error en respuesta del servidor, pero continuando al paso 4');
      showWarning('El pago se procesó. Verifica tu perfil para confirmar la compra.', 5000);
    }
    
    // Si es pago de cotización, limpiar la URL
    if (isQuotePayment) {
      window.history.replaceState({}, document.title, '/form-payment');
      setQuoteItem(null);
      setIsQuotePayment(false);
    }
    
    // Limpiar el carrito
    try {
      await clearCart();
      console.log('✅ Carrito limpiado exitosamente');
    } catch (err) {
      console.error('Error al limpiar carrito:', err);
    }
    
    // Limpiar formulario y navegar al paso 4
    limpiarFormulario();
    setFieldErrors({});
    setCurrentStep(4); // SIEMPRE ir al paso de confirmación exitosa
    setShowProcessingScreen(false); // Ocultar pantalla independiente
    console.log('✅ Navegando al paso 4 (confirmación exitosa)');
    console.log('✅ CurrentStep establecido a:', 4);
    
    } catch (error) {
      console.error('❌ Error en el proceso de pago:', error);
      setShowProcessingScreen(false); // Ocultar pantalla independiente en caso de error
      showError('Error al procesar el pago. Intenta de nuevo.');
    }
  };

  // Timeout para redirigir al catálogo después de 19 segundos
  useEffect(() => {
    let timeoutId;
    
    if (currentStep === 4) {
      console.log('⏰ Configurando timeout de 19 segundos para redirigir...');
      timeoutId = setTimeout(() => {
        console.log('⏰ Timeout ejecutado - redirigiendo al catálogo');
        setCurrentStep(1);
        limpiarFormulario();
        setFieldErrors({});
        clearCart();
        
        // Si era pago de cotización, redirigir al perfil
        if (isQuotePayment) {
          navigate('/perfil', { state: { activeSection: 'quotes' } });
        } else {
          navigate('/catalogo');
        }
      }, 19000); // 19 segundos
    }

    return () => {
      if (timeoutId) {
        console.log('⏰ Limpiando timeout');
        clearTimeout(timeoutId);
      }
    };
  }, [currentStep, navigate, isQuotePayment]);

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
            añoVencimiento: 'Año de vencimiento',
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

  // Debug: Log del currentStep (comentado para evitar spam)
  // console.log('FormPaymentFake - CurrentStep actual:', currentStep);

  // Debug: Log cuando cambia currentStep (comentado para evitar spam)
  // useEffect(() => {
  //   console.log('🔄 CurrentStep cambió a:', currentStep);
  // }, [currentStep]);

  // Si está mostrando la pantalla de procesamiento, mostrar solo esa pantalla
  if (showProcessingScreen) {
    return (
      <div className="processing-page">
        <div className="processing-container">
          <div className="processing-header">
            <h1 className="processing-title">DANGSTORE</h1>
            <p className="processing-subtitle">Llaveros y Cuadros</p>
          </div>
          
          <div className="processing-content">
            <div className="processing-card">
              <div className="processing-spinner">
                <Loader2 size={48} className="animate-spin" />
              </div>
              <h2 className="processing-message">Procesando tu compra...</h2>
              <p className="processing-description">
                Estamos terminando de procesar tu pago. Por favor espera un momento.
              </p>
              
              <div className="processing-steps">
                <div className="processing-step active">
                  <div className="step-icon">✓</div>
                  <span>Validando datos</span>
                </div>
                <div className="processing-step active">
                  <div className="step-icon">✓</div>
                  <span>Procesando pago</span>
                </div>
                <div className="processing-step">
                  <div className="step-icon">⏳</div>
                  <span>Confirmando compra</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`payment-page ${currentStep === 4 ? 'success-active' : ''}`}>
      <div className="payment-wrapper">
        <div className="page-header">
          <h1 className="page-title gradient-title">
          {isQuotePayment ? 'Pago de Cotización Aceptada' : 'Pago Simulado con Tarjeta'}
        </h1>
        </div>

        <div className="payment-card">
          {/* Resumen del carrito o cotización - solo visible en pasos 1, 2 y 3 */}
          {currentStep !== 4 && (
            <div className="cart-summary cart-summary-optimized">
              <h3 className="cart-summary-title">
                {isQuotePayment ? '📋 Resumen de Cotización' : '📋 Resumen del Carrito'}
              </h3>
              <div className="cart-summary-content">
                {isQuotePayment && quoteItem ? (
                  <>
                    <div className="cart-summary-content-row">
                      <div className="cart-summary-products">
                        <strong>Producto:</strong> {quoteItem.product.name}
                      </div>
                      <div className="cart-summary-total">
                        Total: ${total.toFixed(2)}
                      </div>
                    </div>
                    <div className="cart-summary-content-row">
                      <div className="cart-summary-description">
                        <strong>Tipo:</strong> Producto personalizado
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="cart-summary-content-row">
                    <div className="cart-summary-products">
                      <strong>Productos:</strong> {loading ? 'Cargando...' : `${(cartFromState || cart).length} ${(cartFromState || cart).length === 1 ? 'producto' : 'productos'}`}
                    </div>
                    <div className="cart-summary-total">
                      Total: {loading ? 'Cargando...' : `$${total.toFixed(2)}`}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Indicador de pasos - solo visible en pasos 1, 2 y 3 */}
          {currentStep !== 4 && (
            <div className="step-indicator step-indicator-optimized">
            <div className={`step-item-optimized ${currentStep >= 1 ? 'step-item-active' : 'step-item-inactive'}`}>
              <div className={`step-number-optimized ${currentStep >= 1 ? 'step-number-active' : 'step-number-inactive'}`}>
                1
              </div>
              <span className="step-text-optimized">Tarjeta</span>
            </div>
            
            <ArrowRight size={20} color="#999" style={{ display: window.innerWidth <= 768 ? 'none' : 'block' }} />
            
            <div className={`step-item-optimized ${currentStep >= 2 ? 'step-item-active' : 'step-item-inactive'}`}>
              <div className={`step-number-optimized ${currentStep >= 2 ? 'step-number-active' : 'step-number-inactive'}`}>
                2
              </div>
              <span className="step-text-optimized">Facturación</span>
            </div>
            
            <ArrowRight size={20} color="#999" style={{ display: window.innerWidth <= 768 ? 'none' : 'block' }} />
            
            <div className={`step-item-optimized ${currentStep >= 3 ? 'step-item-active' : 'step-item-inactive'}`}>
              <div className={`step-number-optimized ${currentStep >= 3 ? 'step-number-active' : 'step-number-inactive'}`}>
                3
              </div>
              <span className="step-text-optimized">Confirmar</span>
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
                  id="añoVencimiento" 
                  name="añoVencimiento" 
                  value={formData.añoVencimiento || ''} 
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
          {currentStep === 3 && !isProcessingPayment && (
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

                <div className="detail-section confirmation-summary">
                  <h4 className="confirmation-summary-title">Resumen de la Compra</h4>
                  <div className="confirmation-summary-row">
                     <span className="confirmation-summary-label">Productos:</span>
                     <strong className="confirmation-summary-value">{(cartFromState || cart).length} {(cartFromState || cart).length === 1 ? 'producto' : 'productos'}</strong>
                  </div>
                  <div className="confirmation-summary-row">
                     <span className="confirmation-summary-label">Total:</span>
                    <strong className="confirmation-summary-total">${total.toFixed(2)}</strong>
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
              {/* {console.log('🎉 RENDERIZANDO PASO 4 - PAGO EXITOSO')} */}
            <div className="section-header">
                <h2 className="section-title success-title">
                  <CheckCircle size={24} />
                  ¡Pago Exitoso!
                </h2>
                <p className="section-subtitle">
                  Tu pedido ha sido procesado correctamente y guardado en nuestra base de datos. Recibirás un correo de confirmación con los detalles de tu compra.
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
