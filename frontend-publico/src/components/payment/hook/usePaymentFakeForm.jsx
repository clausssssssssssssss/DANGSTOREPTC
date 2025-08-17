import { useState } from "react";

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
      processedValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-]/g, '');
      if (processedValue.length > 50) return;
    }

    if (name === 'empresaFacturacion') {
      // Permitir letras, números, espacios y caracteres comunes de empresa
      processedValue = value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\.,&]/g, '');
      if (processedValue.length > 80) return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  const limpiarFormulario = () => {
    setFormData({
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
    setDatosEnviados(null);
    setStep(1);
    setAccessToken(null);
    setFormDataTarjeta({
      numeroTarjeta: "",
      cvv: "",
      mesVencimiento: 0,
      anioVencimiento: 0,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validar todos los campos antes de enviar
    const validationResult = validateForm();
    if (!validationResult.isValid) {
      alert(`Error de validación: ${validationResult.message}`);
      return;
    }
    
    setDatosEnviados(formData);
  };

  // Función de validación completa del formulario
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

    // Validar número de tarjeta
    if (!numeroTarjeta || numeroTarjeta.replace(/\s/g, '').length < 13) {
      return { isValid: false, message: 'Número de tarjeta inválido (mínimo 13 dígitos)' };
    }

    // Validar CVV
    if (!cvv || cvv.length < 3) {
      return { isValid: false, message: 'CVV inválido (mínimo 3 dígitos)' };
    }

    // Validar fecha de vencimiento
    if (!mesVencimiento || !anioVencimiento) {
      return { isValid: false, message: 'Fecha de vencimiento incompleta' };
    }

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    // Solo validar que no sea muy antigua, no bloquear por año actual
    if (parseInt(anioVencimiento) < currentYear - 10) {
      return { isValid: false, message: 'El año de vencimiento es muy antiguo' };
    }
    
    // Solo validar expiración si ambos campos están completos
    if (parseInt(anioVencimiento) === currentYear && parseInt(mesVencimiento) < currentMonth) {
      return { isValid: false, message: 'La tarjeta ha expirado este mes' };
    }

    // Validar nombre del titular
    if (!nombreTitular || nombreTitular.trim().length < 2) {
      return { isValid: false, message: 'Nombre del titular es requerido (mínimo 2 caracteres)' };
    }

    // Validar información de facturación
    if (!nombreFacturacion || nombreFacturacion.trim().length < 2) {
      return { isValid: false, message: 'Nombre de facturación es requerido' };
    }

    if (!emailFacturacion) {
      return { isValid: false, message: 'Email de facturación es requerido' };
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailFacturacion)) {
      return { isValid: false, message: 'Formato de email inválido' };
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
      console.log('Iniciando handleFakePayment con:', { items, total });
      
      // Verificar token de autenticación
      const token = localStorage.getItem("token");
      
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

      console.log('Items formateados:', formattedItems);

      const orderData = {
        items: formattedItems,
        total: parseFloat(total),
        wompiOrderID: `FAKE_ORDER_${Date.now()}`,
        wompiStatus: "COMPLETED",
      };

      console.log('Datos de orden a enviar:', orderData);

      // Enviar orden al servidor
      const base = import.meta.env.VITE_API_URL || '';
      const url = `${base}/api/cart/order`;
      console.log('URL de la API:', url);
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      const responseData = await response.json();
      console.log('Respuesta del servidor:', { status: response.status, data: responseData });

      if (!response.ok) {
        throw new Error(`Error del servidor (${response.status}): ${responseData.message || responseData.error || 'Error desconocido'}`);
      }

      return { success: true, data: responseData };

    } catch (error) {
      console.error('Error completo en handleFakePayment:', error);
      return { success: false, error };
    }
  };

  return {
    formData,
    datosEnviados,
    handleChange,
    handleSubmit,
    limpiarFormulario,
    handleFakePayment, // ✅ Función que SÍ guarda la orden
    validateForm, // ✅ Función de validación
    step,
    setStep,
    formDataTarjeta,
    setFormDataTarjeta,
    accessToken,
    setAccessToken,
  };
};

export default usePaymentFakeForm;