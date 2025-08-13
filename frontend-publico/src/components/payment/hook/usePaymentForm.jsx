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
    mesVencimiento: 0,
    anioVencimiento: 0,
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
    setFormDataTarjeta((prev) => ({ ...prev, [name]: value }));
  };

  const limpiarFormulario = () => {
    setFormData({
      nombreCliente: "",
      emailCliente: "",
      monto: 0.01,
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
    setDatosEnviados(formData);
  };

  

  const handleFinishPayment = async () => {
    try {
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
      };

      console.log("📦 Enviando orden al backend:", orderData);

      const base = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${base}/api/cart/order`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify(orderData),
});

console.log("🌐 URL completa:", "http://localhost:4000/api/cart/order");
console.log("📨 Haciendo petición...");

      const responseData = await response.json();
      console.log("📨 Datos de respuesta:", responseData);

      if (!response.ok) {
        throw new Error(responseData.message || `Error del servidor: ${response.status}`);
      }

      // Volver al carrito con estado de éxito
      navigate('/carrito', { replace: true, state: { paid: true, total } });
      return responseData;
    } catch (error) {
      console.error("❌ Error en pago simulado:", error);
      alert(`Error: ${error.message}`);
      return false;
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
  };
};

export default usePaymentForm;