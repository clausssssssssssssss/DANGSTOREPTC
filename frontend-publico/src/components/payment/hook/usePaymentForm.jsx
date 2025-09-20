import { useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';

const usePaymentForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [datosEnviados, setDatosEnviados] = useState(null);
  const [step, setStep] = useState(1);
  const [accessToken, setAccessToken] = useState(null);

  const [formDataTarjeta, setFormDataTarjeta] = useState({
    numeroTarjeta: "",
    cvv: "",
    mesVencimiento: "",
    anioVencimiento: "",
    nombreTitular: "",
    tipoTarjeta: "visa",
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

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    direccion: "",
    ciudad: "",
    telefono: "",
    monto: 0.01,
  });

  const handleChangeData = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChangeTarjeta = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    // Validaciones específicas para cada campo
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
    }
    
    if (name === 'anioVencimiento') {
      // Solo permitir números, mínimo año actual
      processedValue = value.replace(/\D/g, '');
      const currentYear = new Date().getFullYear();
      if (processedValue < currentYear) processedValue = currentYear;
    }

    setFormDataTarjeta((prev) => ({ ...prev, [name]: processedValue }));
  };

  const detectCardType = (cardNumber) => {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    if (/^4/.test(cleanNumber)) return 'visa';
    if (/^5[1-5]/.test(cleanNumber)) return 'mastercard';
    return 'unknown';
  };

  const limpiarFormulario = () => {
    setFormData({
      nombre: "",
      apellido: "",
      email: "",
      direccion: "",
      ciudad: "",
      telefono: "",
      monto: 0.01,
    });
    setDatosEnviados(null);
    setStep(1);
    setAccessToken(null);
    setFormDataTarjeta({
      numeroTarjeta: "",
      cvv: "",
      mesVencimiento: "",
      anioVencimiento: "",
      nombreTitular: "",
      tipoTarjeta: "visa",
      // Limpiar campos de facturación
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
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setDatosEnviados(formData);
  };

  const validateCardForm = () => {
    const { numeroTarjeta, cvv, mesVencimiento, anioVencimiento, nombreTitular } = formDataTarjeta;
    
    if (!numeroTarjeta.replace(/\s/g, '').match(/^\d{16}$/)) {
      throw new Error('Número de tarjeta inválido');
    }
    
    if (!cvv.match(/^\d{3,4}$/)) {
      throw new Error('CVV inválido');
    }
    
    if (!mesVencimiento || !anioVencimiento) {
      throw new Error('Fecha de vencimiento incompleta');
    }
    
    if (!nombreTitular.trim()) {
      throw new Error('Nombre del titular es requerido');
    }

    return true;
  };

  const handleFinishPayment = async () => {
    try {
      // Validar formulario de tarjeta
      validateCardForm();

      // Verificar que tenemos token
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      // Tomar items y total provistos desde navigate state
      const { items = [], total = 0 } = location.state || {};
      if (!items.length) {
        throw new Error('No hay productos para pagar');
      }

      const formattedItems = items.map(item => ({
        product: item.product._id || item.product.id || item.product,
        quantity: parseInt(item.quantity) || 1,
        price: parseFloat(item.product?.price ?? item.price ?? 0),
      }));

      const orderData = {
        items: formattedItems,
        total: parseFloat(total),
        wompiOrderID: `FAKE_ORDER_${Date.now()}`, // ID único
        wompiStatus: "COMPLETED",
        paymentMethod: "Tarjeta de Crédito/Débito (Simulado)",
        cardLast4: formDataTarjeta.numeroTarjeta.replace(/\s/g, '').slice(-4),
        cardType: detectCardType(formDataTarjeta.numeroTarjeta),
      };

      console.log("Enviando orden al backend:", orderData);

      const base = 'https://dangstoreptc.onrender.com';
      const response = await fetch(`${base}/api/cart/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

              console.log("URL completa:", "https://dangstoreptc.onrender.com/cart/order");
              console.log("Haciendo petición...");

      const responseData = await response.json();
              console.log("Datos de respuesta:", responseData);

      if (!response.ok) {
        throw new Error(responseData.message || `Error del servidor: ${response.status}`);
      }

      // Pago exitoso - ir al paso 4 (confirmación exitosa)
      setStep(4);
      return responseData;
    } catch (error) {
              console.error("Error en pago simulado:", error);
      // El error será manejado por el componente que use este hook
      throw error;
    }
  };

  return {
    formData,
    formDataTarjeta,
    handleChangeData,
    handleChangeTarjeta,
    handleSubmit,
    limpiarFormulario,
    handleFirstStep: () => setStep(2),
    handleFinishPayment,
    step,
    setStep,
    detectCardType,
  };
};

export default usePaymentForm;