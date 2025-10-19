import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from "../hooks/useAuth.jsx";
import { useCart } from "../context/CartContext.jsx";
import usePaymentFakeForm from "../components/payment/hook/usePaymentFakeForm.jsx";
import InputField from "../components/payment/InputField";
import Button from "../components/payment/Button";
import DeliveryPointSelector from "../components/payment/DeliveryPointSelector";
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
  
  // Estado para punto de entrega
  const [selectedDeliveryPoint, setSelectedDeliveryPoint] = useState(null);
  const [deliveryPoints, setDeliveryPoints] = useState([]);

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

  // Función para manejar la selección del punto de entrega
  const handleSelectDeliveryPoint = (pointId) => {
    // Buscar el punto completo por ID
    const point = deliveryPoints.find(p => p._id === pointId);
    setSelectedDeliveryPoint(point);
    
    // Mostrar toast de confirmación
    if (point) {
      showSuccess(`Punto de entrega seleccionado: ${point.nombre}`, 3000);
    }
  };

  // Función para cargar puntos de entrega
  const fetchDeliveryPoints = async () => {
    try {
      const response = await fetch('https://dangstoreptc-production.up.railway.app/api/delivery-points');
      const data = await response.json();
      
      if (data.success) {
        setDeliveryPoints(data.deliveryPoints || []);
      }
    } catch (error) {
      console.error('Error fetching delivery points:', error);
    }
  };

  // Cargar puntos de entrega al montar el componente
  useEffect(() => {
    fetchDeliveryPoints();
  }, []);

  // Estados - TODOS AL PRINCIPIO
  const [currentStep, setCurrentStep] = useState(1); // Nuevo estado para controlar los pasos
  const [fieldErrors, setFieldErrors] = useState({});
  const [isProcessingPayment, setIsProcessingPayment] = useState(false); // Estado para mostrar pantalla de carga
  const [showProcessingScreen, setShowProcessingScreen] = useState(false); // Estado para pantalla independiente

  const { showSuccess, showError, showWarning, showInfo, toasts, removeToast } = useToast();

  // Toast de bienvenida cuando se carga el componente
  useEffect(() => {
    if (currentStep === 1) {
      showInfo('¡Bienvenido! Completa los datos de tu tarjeta para continuar con el pago simulado.', 4000);
    }
  }, [currentStep]);

  // Validar campo individual en tiempo real
  const validateField = (name, value) => {
    let error = '';
    
    // Solo loggear en desarrollo y para campos específicos
    if (process.env.NODE_ENV === 'development' && name === 'numeroTarjeta' && value.length % 4 === 0) {
      console.log(`validateField called: ${name} = "${value}"`);
    }

    switch (name) {
      case 'numeroTarjeta':
        const cleanNumber = value.replace(/\s/g, '');
        if (!value) {
          error = 'Número de tarjeta es requerido';
        } else if (!/^\d+$/.test(cleanNumber)) {
          error = 'Solo números permitidos';
        } else if (cleanNumber.length !== 16) {
          error = 'Debe tener exactamente 16 dígitos';
        } else {
          // Validación adicional: verificar que no sean todos los mismos dígitos
          if (/^(\d)\1{15}$/.test(cleanNumber)) {
            error = 'Número de tarjeta inválido';
          }
        }
        break;
        
      case 'cvv':
        if (!value) {
          error = 'CVV es requerido';
        } else if (!/^\d+$/.test(value)) {
          error = 'Solo números permitidos';
        } else if (value.length !== 3) {
          error = 'Debe tener exactamente 3 dígitos';
        }
        break;
        
      case 'mesVencimiento':
        if (!value) {
          error = 'Mes es requerido';
        } else if (!/^\d+$/.test(value)) {
          error = 'Solo números permitidos';
        } else {
          const month = parseInt(value);
          if (month < 1 || month > 12) {
            error = 'El mes debe estar entre 1 y 12';
          }
        }
        break;
        
      case 'anioVencimiento':
        console.log('Validando año:', { value, type: typeof value });
        if (!value) {
          error = 'Año es requerido';
        } else if (!/^\d+$/.test(value)) {
          error = 'Solo números permitidos';
        } else if (value.length !== 4) {
          error = 'Debe tener 4 dígitos';
        } else {
          const currentYear = new Date().getFullYear();
          const inputYear = parseInt(value);
          console.log('Comparando años:', { currentYear, inputYear, isLess: inputYear < currentYear });
          if (inputYear < currentYear) {
            error = 'El año no puede ser anterior al actual (' + currentYear + ')';
            console.log('❌ Año anterior detectado:', inputYear, '<', currentYear);
          } else if (inputYear > currentYear + 20) {
            error = 'El año no puede ser más de 20 años en el futuro';
          }
        }
        console.log('Error del año:', error);
        break;
        
      case 'nombreTitular':
        if (!value) {
          error = 'Nombre del titular es requerido';
        } else if (value.trim().length < 2) {
          error = 'El nombre debe tener al menos 2 caracteres';
        } else if (value.trim().length > 50) {
          error = 'El nombre no puede tener más de 50 caracteres';
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value.trim())) {
          error = 'Solo se permiten letras y espacios';
        } else if (value.trim().split(' ').length < 2) {
          error = 'Debe incluir nombre y apellido';
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
          error = 'Formato de email inválido (ejemplo: usuario@ejemplo.com)';
        } else if (value.length > 100) {
          error = 'El email no puede tener más de 100 caracteres';
        } else if (value.includes('..') || value.startsWith('.') || value.endsWith('.')) {
          error = 'Formato de email inválido';
        }
        break;
        
      case 'telefonoFacturacion':
        if (!value) {
          error = 'Teléfono es requerido';
        } else {
          const cleanPhone = value.replace(/[^0-9]/g, '');
          if (cleanPhone.length !== 8) {
            error = 'El teléfono debe tener exactamente 8 dígitos (formato salvadoreño)';
          } else if (!/^[0-9]+$/.test(cleanPhone)) {
            error = 'Solo se permiten números';
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

    // Mostrar toasts de ayuda para ciertos campos
    if (name === 'numeroTarjeta' && value && value.replace(/\s/g, '').length === 16) {
      showSuccess('¡Número de tarjeta válido!', 2000);
    } else if (name === 'cvv' && value && value.length === 3) {
      showSuccess('¡CVV válido!', 2000);
    } else if (name === 'anioVencimiento' && value && value.length === 4) {
      const year = parseInt(value);
      const currentYear = new Date().getFullYear();
      if (year < currentYear) {
        showError('El año no puede ser anterior al actual', 3000);
      } else {
        showSuccess('¡Año válido!', 2000);
      }
    } else if (name === 'mesVencimiento' && value) {
      const month = parseInt(value);
      if (month >= 1 && month <= 12) {
        showSuccess('¡Mes válido!', 2000);
      }
    }

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

    // Validar que se haya seleccionado un punto de entrega
    if (!selectedDeliveryPoint) {
      console.log('❌ No se ha seleccionado un punto de entrega');
      showError('Debes seleccionar un punto de entrega para continuar');
      return;
    }

    // Mostrar pantalla independiente de procesamiento
    setShowProcessingScreen(true);
    console.log('🔄 Mostrando pantalla independiente de procesamiento...');
    showInfo('Procesando tu pago simulado... Por favor espera.', 2000);
    
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
      total: originalTotal > 0 ? originalTotal : total,
      deliveryPointId: selectedDeliveryPoint?._id
    });

    console.log('📋 Resultado de handleFakePayment:', result);

    // SIEMPRE ir al paso 4 - la compra se realiza independientemente del resultado
    console.log('🔄 Procesando pago y navegando al paso 4...');
    
    // Mostrar mensaje según el resultado
    if (result?.success) {
      console.log('✅ Pago exitoso confirmado por el servidor');
      showSuccess('¡Pago simulado exitoso! Tu orden ha sido procesada.', 4000);
    } else {
      console.log('⚠️ Error en respuesta del servidor');
      
      // Verificar si es un error de stock
      if (result?.error?.message?.includes('stock disponible') || 
          result?.error?.message?.includes('solo quedan')) {
        showError(result.error.message, 6000);
        return; // No continuar al paso 4 si hay error de stock
      } else if (result?.error?.message?.includes('límite máximo')) {
        showError(result.error.message, 6000);
        return; // No continuar al paso 4 si hay error de límite
      } else {
        showWarning('El pago se procesó con advertencias. Verifica tu perfil para confirmar la compra.', 5000);
      }
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
      showInfo('Carrito limpiado. Tu orden ha sido guardada en tu perfil.', 3000);
    } catch (err) {
      console.error('Error al limpiar carrito:', err);
      showWarning('La orden se procesó pero hubo un problema al limpiar el carrito.', 4000);
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
      showError('Error al procesar el pago. Por favor, verifica tu conexión e intenta de nuevo.', 5000);
    }
  };

  // Timeout para redirigir al catálogo después de 19 segundos
  useEffect(() => {
    let timeoutId;
    
    if (currentStep === 4) {
      console.log('⏰ Configurando timeout de 19 segundos para redirigir...');
      timeoutId = setTimeout(() => {
        console.log('⏰ Timeout ejecutado - redirigiendo al catálogo');
        showInfo('Redirigiendo automáticamente al catálogo...', 2000);
        
        setTimeout(() => {
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
        }, 2000); // Esperar 2 segundos para mostrar el toast
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
        
        // Verificar que todos los campos estén completos y sin errores
        cardFields.forEach(field => {
          const value = formData[field] || '';
          const error = validateField(field, value);
          
          console.log(`Validando campo ${field}:`, { value, error });
          
          // Verificar si el campo está vacío
          if (!value || value.trim() === '') {
            invalidFields.push(field);
            isValid = false;
          } else if (error) {
            // Verificar si hay errores de validación
            invalidFields.push(field);
            isValid = false;
          }
        });
        
        // Validación adicional: verificar que la fecha no haya expirado
        if (isValid && formData.mesVencimiento && formData.anioVencimiento) {
          const currentDate = new Date();
          const currentYear = currentDate.getFullYear();
          const currentMonth = currentDate.getMonth() + 1;
          const expiryYear = parseInt(formData.anioVencimiento);
          const expiryMonth = parseInt(formData.mesVencimiento);
          
          console.log('Validación de fecha:', {
            currentYear,
            currentMonth,
            expiryYear,
            expiryMonth,
            isExpired: expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)
          });
          
          if (expiryYear < currentYear) {
            isValid = false;
            message = `El año ${expiryYear} no puede ser anterior al actual (${currentYear})`;
          } else if (expiryYear === currentYear && expiryMonth < currentMonth) {
            isValid = false;
            message = 'La tarjeta ha expirado este mes. Verifica la fecha de vencimiento.';
          }
        }
        
        if (!isValid && !message) {
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
        
      case 2: // Punto de entrega
        const billingFields = [
          'nombreFacturacion', 'emailFacturacion', 'telefonoFacturacion'
        ];
        
        // Verificar que todos los campos estén completos y sin errores
        billingFields.forEach(field => {
          const value = formData[field] || '';
          const error = validateField(field, value);
          
          // Verificar si el campo está vacío
          if (!value || value.trim() === '') {
            invalidFields.push(field);
            isValid = false;
          } else if (error) {
            // Verificar si hay errores de validación
            invalidFields.push(field);
            isValid = false;
          }
        });
        
        // Validar que se haya seleccionado un punto de entrega
        if (!selectedDeliveryPoint) {
          isValid = false;
          if (invalidFields.length > 0) {
            message = `Completa correctamente: ${invalidFields.map(field => {
              const fieldNames = {
                nombreFacturacion: 'Nombre completo',
                emailFacturacion: 'Email de facturación',
                telefonoFacturacion: 'Teléfono'
              };
              return fieldNames[field];
            }).join(', ')} y selecciona un punto de entrega`;
          } else {
            message = 'Debes seleccionar un punto de entrega para continuar';
          }
        } else if (!isValid) {
          const fieldNames = {
            nombreFacturacion: 'Nombre completo',
            emailFacturacion: 'Email de facturación',
            telefonoFacturacion: 'Teléfono'
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
    console.log('=== INTENTANDO AVANZAR AL SIGUIENTE PASO ===');
    console.log('Current step:', currentStep);
    console.log('Form data:', formData);
    
    // Validar el paso actual antes de continuar
    const isValid = validateCurrentStep();
    
    console.log('Validación result:', isValid);
    
    if (isValid) {
      console.log('✅ Validación exitosa, avanzando...');
      setCurrentStep(prev => {
        const newStep = prev + 1;
        
        // Mostrar toasts informativos según el paso
        if (newStep === 2) {
          showInfo('¡Excelente! Datos de tarjeta completados. Ahora selecciona tu punto de entrega.', 3000);
        } else if (newStep === 3) {
          showInfo('¡Perfecto! Ahora revisa todos los datos antes de confirmar el pago.', 3000);
        }
        
        return newStep;
      });
      // Limpiar errores de campos al avanzar exitosamente
      setFieldErrors({});
    } else {
      console.log('❌ Validación falló, no se puede avanzar');
      showWarning('Por favor, corrige los errores antes de continuar', 3000);
    }
    // Si no es válido, validateCurrentStep ya mostró el error
  };

  // Función para ir al paso anterior
  const prevStep = () => {
    console.log('=== VOLVIENDO AL PASO ANTERIOR ===');
    console.log('Current step:', currentStep);
    setCurrentStep(prev => {
      const newStep = prev - 1;
      console.log('New step:', newStep);
      
      // Mostrar toasts informativos al volver
      if (newStep === 1) {
        showInfo('Volviendo a los datos de tarjeta. Puedes modificar cualquier campo.', 2500);
      } else if (newStep === 2) {
        showInfo('Volviendo a selección de punto de entrega.', 2500);
      }
      
      return newStep;
    });
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
                    maxLength="3"
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

          {/* PASO 2: PUNTO DE ENTREGA */}
          {currentStep === 2 && (
            <div className="card-form">
              <div className="section-header">
                <h2 className="section-title">
                  <MapPin size={24} />
                  Punto de Entrega
                </h2>
                <p className="section-subtitle">
                  <Building size={16} />
                  Selecciona dónde deseas recoger tu pedido
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
                  placeholder="1234-5678" 
                  maxLength="8"
                  required 
                />
              </div>

              <DeliveryPointSelector 
                selectedDeliveryPoint={selectedDeliveryPoint?._id}
                onDeliveryPointChange={handleSelectDeliveryPoint}
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
                  <h4>Información de Facturación</h4>
                  <p><strong>Nombre:</strong> {formData.nombreFacturacion || 'No especificado'}</p>
                  <p><strong>Email:</strong> {formData.emailFacturacion || 'No especificado'}</p>
                  <p><strong>Teléfono:</strong> {formData.telefonoFacturacion || 'No especificado'}</p>
                </div>

                <div className="detail-section">
                  <h4>Punto de Entrega</h4>
                  {selectedDeliveryPoint ? (
                    <>
                      <p><strong>Punto:</strong> {selectedDeliveryPoint.nombre}</p>
                      <p><strong>Dirección:</strong> {selectedDeliveryPoint.direccion}</p>
                      {selectedDeliveryPoint.referencia && (
                        <p><strong>Referencia:</strong> {selectedDeliveryPoint.referencia}</p>
                      )}
                    </>
                  ) : (
                    <p>No se ha seleccionado un punto de entrega</p>
                  )}
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
                    navigate('/perfil', { state: { activeSection: 'orders' } });
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
