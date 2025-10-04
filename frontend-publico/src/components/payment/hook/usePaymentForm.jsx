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
      processedValue = value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim();
      if (processedValue.length > 19) return;
    }
    
    if (name === 'cvv') {
      processedValue = value.replace(/\D/g, '');
      if (processedValue.length > 4) return;
    }
    
    if (name === 'mesVencimiento') {
      processedValue = value.replace(/\D/g, '');
      if (processedValue > 12) processedValue = 12;
      if (processedValue < 1) processedValue = 1;
    }
    
    if (name === 'anioVencimiento') {
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
      validateCardForm();

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      // 🔥 CORRECCIÓN: Manejar tanto items normales como quoteItem individual
      let items = [];
      let total = 0;

      if (location.state?.quoteItem) {
        // Es un pago de cotización individual
        console.log('🎨 Pago de cotización individual detectado');
        items = [location.state.quoteItem];
        total = location.state.quoteItem.price || 0;
      } else {
        // Es un pago normal desde el carrito
        items = location.state?.items || [];
        total = location.state?.total || 0;
      }

      if (!items.length) {
        throw new Error('No hay productos para pagar');
      }

      console.log('🔍 Items originales recibidos:', items);

      // 🔥 CORRECCIÓN CRÍTICA: Detectar el tipo de cada item
      const formattedItems = items.map(item => {
        console.log('📦 Procesando item:', item);

        // Detectar si es un producto personalizado
        const isCustom = item.type === 'custom' || 
                        item.isCustom || 
                        item.customOrder || 
                        item.item ||
                        (item.product && typeof item.product === 'object' && item.product.modelType);

        if (isCustom) {
          // Es un producto PERSONALIZADO (cotización)
          const customOrderId = item.item || 
                               item.customOrder || 
                               item.product?._id || 
                               item.product?.id || 
                               item.product;

          const itemPrice = item.price || 
                           item.product?.price || 
                           item.product?.precio || 
                           0;

          console.log('🎨 Item personalizado detectado:', {
            customOrderId,
            quantity: item.quantity,
            price: itemPrice
          });

          return {
            type: 'custom',
            item: customOrderId,
            quantity: parseInt(item.quantity) || 1,
            price: parseFloat(itemPrice),
          };
        } else {
          // Es un producto DE CATÁLOGO
          const productId = item.product?._id || 
                           item.product?.id || 
                           item.product;

          const itemPrice = item.product?.price || 
                           item.product?.precio || 
                           item.price || 
                           0;

          console.log('📦 Item de catálogo detectado:', {
            productId,
            quantity: item.quantity,
            price: itemPrice
          });

          return {
            type: 'product',
            product: productId,
            quantity: parseInt(item.quantity) || 1,
            price: parseFloat(itemPrice),
          };
        }
      });

      console.log('✅ Items formateados para enviar:', formattedItems);

      const orderData = {
        items: formattedItems,
        total: parseFloat(total),
        wompiOrderID: `FAKE_ORDER_${Date.now()}`,
        wompiStatus: "COMPLETED",
        paymentMethod: "Tarjeta de Crédito/Débito (Simulado)",
        cardLast4: formDataTarjeta.numeroTarjeta.replace(/\s/g, '').slice(-4),
        cardType: detectCardType(formDataTarjeta.numeroTarjeta),
      };

      console.log("📤 Enviando orden al backend:", orderData);

      const base = 'http://localhost:4000/api';
      const response = await fetch(`${base}/api/cart/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      console.log("🔗 URL completa:", `${base}/api/cart/order`);
      console.log("📡 Haciendo petición...");

      const responseData = await response.json();
      console.log("📋 Datos de respuesta:", responseData);

      if (!response.ok) {
        throw new Error(responseData.message || `Error del servidor: ${response.status}`);
      }

      setStep(4);
      return responseData;
    } catch (error) {
      console.error("❌ Error en pago simulado:", error);
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