import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';

// URL del servidor local para desarrollo
const API_BASE = 'https://dangstoreptc-production.up.railway.app/api';

const usePaymentFakeForm = () => {
  const [datosEnviados, setDatosEnviados] = useState(null);
  const [step, setStep] = useState(1);
  const [accessToken, setAccessToken] = useState(null);

  const [formDataTarjeta, setFormDataTarjeta] = useState({
    numeroTarjeta: "",
    cvv: "",
    mesVencimiento: 0,
    anioVencimiento: 0,
  });

  const [formData, setFormData] = useState({
    // Campos básicos
    nombreCliente: "",
    emailCliente: "",
    monto: 0.01,
    // Campos de tarjeta
    numeroTarjeta: "",
    cvv: "",
    mesVencimiento: "",
    anioVencimiento: new Date().getFullYear().toString(),
    nombreTitular: "",
    // Campos de facturación
    nombreFacturacion: "",
    emailFacturacion: "",
    direccionFacturacion: "",
    ciudadFacturacion: "",
    estadoFacturacion: "",
    codigoPostal: "",
    paisFacturacion: "",
    telefonoFacturacion: "",
    empresaFacturacion: "",
  });

  // Función para detectar el tipo de tarjeta
  const detectCardType = (cardNumber) => {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    
    if (/^4/.test(cleanNumber)) return 'visa';
    if (/^5[1-5]/.test(cleanNumber)) return 'mastercard';
    if (/^3[47]/.test(cleanNumber)) return 'amex';
    if (/^6(?:011|5)/.test(cleanNumber)) return 'discover';
    
    return 'unknown';
  };

  // Función para validar un campo específico
  const validateField = (field, value) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return false;
    }
    
    switch (field) {
      case 'numeroTarjeta':
        return value.replace(/\s/g, '').length >= 13 && value.replace(/\s/g, '').length <= 19;
      case 'cvv':
        return value.length >= 3 && value.length <= 4;
      case 'mesVencimiento':
        const month = parseInt(value);
        return month >= 1 && month <= 12;
      case 'anioVencimiento':
        const year = parseInt(value);
        return year >= new Date().getFullYear() && year <= new Date().getFullYear() + 20;
      case 'nombreTitular':
        return value.trim().length >= 2;
      case 'nombreFacturacion':
        return value.trim().length >= 2;
      case 'emailFacturacion':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case 'direccionFacturacion':
        return value.trim().length >= 5;
      case 'ciudadFacturacion':
        return value.trim().length >= 2;
      case 'estadoFacturacion':
        return value.trim().length >= 2;
      case 'codigoPostal':
        return value.trim().length >= 3;
      case 'paisFacturacion':
        return value.trim().length >= 2;
      case 'telefonoFacturacion':
        return value.trim().length >= 7;
      default:
        return true;
    }
  };

  // Función para manejar cambios en campos específicos
  const handleFieldChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Función para obtener la clase CSS de un campo
  const getFieldClass = (field, value) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return '';
    }
    
    return validateField(field, value) ? 'valid' : 'error';
  };

  // Función para calcular el progreso del formulario
  const calculateProgress = () => {
    const requiredFields = [
      'numeroTarjeta', 'cvv', 'mesVencimiento', 'anioVencimiento',
      'nombreTitular', 'nombreFacturacion', 'emailFacturacion',
      'direccionFacturacion', 'ciudadFacturacion', 'estadoFacturacion',
      'codigoPostal', 'paisFacturacion', 'telefonoFacturacion'
    ];
    
    const validFields = requiredFields.filter(field => {
      const value = formData[field];
      return validateField(field, value);
    });
    
    return Math.round((validFields.length / requiredFields.length) * 100);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    // Validaciones específicas para campos de tarjeta
    if (name === 'numeroTarjeta') {
      // Solo permitir números y espacios
      processedValue = value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim();
      if (processedValue.length > 19) return; // Máximo 16 dígitos + 3 espacios
    }
    
    if (name === 'cvv') {
      // Solo permitir números, máximo 4 dígitos
      processedValue = value.replace(/\D/g, '');
      if (processedValue.length > 4) return;
    }
    
    if (name === 'mesVencimiento') {
      // Solo permitir números del 1 al 12
      processedValue = value.replace(/\D/g, '');
      if (processedValue > 12) processedValue = 12;
      if (processedValue < 1) processedValue = 1;
      // Asegurar que sea string
      processedValue = processedValue.toString();
    }
    
    if (name === 'anioVencimiento') {
      // Solo permitir números, ser menos restrictivo con el año
      processedValue = value.replace(/\D/g, '');
      // Solo validar que tenga 4 dígitos, no restringir por año actual
      if (processedValue.length > 4) {
        processedValue = processedValue.slice(0, 4);
      }
      // Asegurar que sea string
      processedValue = processedValue.toString();
    }

    // Validaciones para campos de facturación
    if (name === 'codigoPostal') {
      // Solo permitir números y letras, máximo 10 caracteres
      processedValue = value.replace(/[^a-zA-Z0-9\s-]/g, '');
      if (processedValue.length > 10) return;
    }

    if (name === 'telefonoFacturacion') {
      // Solo permitir números, espacios, paréntesis, guiones y +
      processedValue = value.replace(/[^0-9\s\(\)\-\+]/g, '');
      if (processedValue.length > 20) return;
    }

    if (name === 'nombreTitular' || name === 'nombreFacturacion') {
      // Solo permitir letras, espacios y algunos caracteres especiales
      processedValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
      if (processedValue.length > 50) return;
    }

    if (name === 'direccionFacturacion') {
      // Permitir letras, números, espacios y caracteres comunes de dirección
      processedValue = value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\.,#\-]/g, '');
      if (processedValue.length > 100) return;
    }

    if (name === 'ciudadFacturacion' || name === 'estadoFacturacion' || name === 'paisFacturacion') {
      // Solo permitir letras, espacios y algunos caracteres especiales
      processedValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
      if (processedValue.length > 50) return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const validation = validateForm();
      
      if (!validation.isValid) {
        throw new Error(validation.message);
      }

      // Simular envío exitoso
      setDatosEnviados({
        ...formData,
        timestamp: new Date().toISOString(),
        status: 'success'
      });

      console.log('Formulario enviado exitosamente:', formData);
      
      return { success: true, data: formData };
      
    } catch (error) {
      console.error('Error al enviar formulario:', error);
      throw error;
    }
  };

  const limpiarFormulario = () => {
    setFormData({
      nombreCliente: "",
      emailCliente: "",
      monto: 0.01,
      numeroTarjeta: "",
      cvv: "",
      mesVencimiento: "",
      anioVencimiento: new Date().getFullYear().toString(),
      nombreTitular: "",
      nombreFacturacion: "",
      emailFacturacion: "",
      direccionFacturacion: "",
      ciudadFacturacion: "",
      estadoFacturacion: "",
      codigoPostal: "",
      paisFacturacion: "",
      telefonoFacturacion: "",
      empresaFacturacion: "",
    });
    setDatosEnviados(null);
    setStep(1);
  };

  const validateForm = () => {
    const {
      numeroTarjeta,
      cvv,
      mesVencimiento,
      anioVencimiento,
      nombreTitular,
      nombreFacturacion,
      emailFacturacion,
      direccionFacturacion,
      ciudadFacturacion,
      estadoFacturacion,
      codigoPostal,
      paisFacturacion,
      telefonoFacturacion
    } = formData;

    if (!numeroTarjeta || numeroTarjeta.replace(/\s/g, '').length < 13) {
      return { isValid: false, message: 'Número de tarjeta inválido (mínimo 13 dígitos)' };
    }

    if (!cvv || cvv.length < 3) {
      return { isValid: false, message: 'CVV es requerido (mínimo 3 dígitos)' };
    }

    if (!mesVencimiento || mesVencimiento.trim().length === 0) {
      return { isValid: false, message: 'Mes de vencimiento es requerido' };
    }

    if (!anioVencimiento || anioVencimiento.trim().length === 0) {
      return { isValid: false, message: 'Año de vencimiento es requerido' };
    }

    if (!nombreTitular || nombreTitular.trim().length < 2) {
      return { isValid: false, message: 'Nombre del titular es requerido (mínimo 2 caracteres)' };
    }

    if (!nombreFacturacion || nombreFacturacion.trim().length < 2) {
      return { isValid: false, message: 'Nombre de facturación es requerido (mínimo 2 caracteres)' };
    }

    if (!emailFacturacion || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailFacturacion)) {
      return { isValid: false, message: 'Email de facturación inválido' };
    }

    if (!direccionFacturacion || direccionFacturacion.trim().length < 5) {
      return { isValid: false, message: 'Dirección de facturación es requerida (mínimo 5 caracteres)' };
    }

    if (!ciudadFacturacion || ciudadFacturacion.trim().length < 2) {
      return { isValid: false, message: 'Ciudad es requerida' };
    }

    if (!estadoFacturacion || estadoFacturacion.trim().length < 2) {
      return { isValid: false, message: 'Estado/Provincia es requerido' };
    }

    if (!codigoPostal || codigoPostal.trim().length < 3) {
      return { isValid: false, message: 'Código postal es requerido (mínimo 3 caracteres)' };
    }

    if (!paisFacturacion || paisFacturacion.trim().length < 2) {
      return { isValid: false, message: 'País es requerido' };
    }

    if (!telefonoFacturacion || telefonoFacturacion.trim().length < 7) {
      return { isValid: false, message: 'Teléfono es requerido (mínimo 7 dígitos)' };
    }

    return { isValid: true, message: 'Formulario válido' };
  };

  // Función para procesar pago simulado y guardar orden
  const handleFakePayment = async ({ items, total }) => {
    try {
      console.log('=== HOOK PAGO ===');
      console.log('Items recibidos:', items);
      console.log('Total recibido:', total);
      console.log('Tipo de total:', typeof total);
      console.log('================');
      
      // Verificar token de autenticación
      const token = localStorage.getItem("token");
      console.log('🔑 Token encontrado:', token ? 'Sí' : 'No');
      
      if (!token) {
        throw new Error("No hay token de autenticación. Por favor, inicia sesión.");
      }

      // Formatear items correctamente
      const formattedItems = (items || []).map((item) => ({
        product: item?.product?._id || item?.product?.id || item?.product,
        quantity: parseInt(item?.quantity) || 1,
        price: parseFloat(
          item?.price ?? (item?.product && item?.product.price) ?? 0
        ),
      }));

      console.log('📦 Items formateados:', formattedItems);

      const orderData = {
        items: formattedItems,
        total: parseFloat(total),
        wompiOrderID: `FAKE_ORDER_${Date.now()}`,
        wompiStatus: "COMPLETED",
      };

      console.log('📋 Datos de orden a enviar:', orderData);

      // Enviar orden al servidor
      const url = `${API_BASE}/cart/order`;
      console.log('🌐 URL de la API:', url);
      
      console.log('🚀 Enviando petición HTTP...');
      let response;
      try {
        response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(orderData),
        });
        console.log('✅ Petición HTTP completada');
      } catch (networkError) {
        console.error('❌ Error de red:', networkError);
        throw new Error(`Error de red: ${networkError.message}`);
      }

      console.log('📡 Respuesta recibida - Status:', response.status);
      console.log('📡 Respuesta recibida - OK:', response.ok);
      console.log('📡 Respuesta recibida - Headers:', response.headers);
      
      const responseData = await response.json();
      console.log('📋 Respuesta del servidor:', { status: response.status, data: responseData });

      if (!response.ok) {
        console.error('❌ Error del servidor:', response.status, responseData);
        throw new Error(`Error del servidor (${response.status}): ${responseData.message || responseData.error || 'Error desconocido'}`);
      }

      console.log('✅ Pago procesado exitosamente');
      console.log('🔄 Retornando resultado exitoso desde handleFakePayment');
      return { success: true, data: responseData };

    } catch (error) {
      console.error('❌ Error completo en handleFakePayment:', error);
      console.error('❌ Stack trace:', error.stack);
      console.log('🔄 Retornando resultado de error desde handleFakePayment');
      return { success: false, error };
    }
  };

  return {
    formData,
    datosEnviados,
    handleChange,
    handleSubmit,
    limpiarFormulario,
    handleFakePayment,
    validateForm,
    step,
    setStep,
    formDataTarjeta,
    setFormDataTarjeta,
    accessToken,
    setAccessToken,
    // Funciones agregadas
    detectCardType,
    validateField,
    handleFieldChange,
    getFieldClass,
    calculateProgress,
  };
};

export default usePaymentFakeForm;