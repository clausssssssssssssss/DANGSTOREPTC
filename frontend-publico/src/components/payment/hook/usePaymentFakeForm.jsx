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
    nombreCliente: "",
    emailCliente: "",
    monto: 0.01,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

  // Función para procesar pago simulado y guardar orden
  const handleFakePayment = async ({ items, total }) => {
    try {
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

      const orderData = {
        items: formattedItems,
        total: parseFloat(total),
        wompiOrderID: `FAKE_ORDER_${Date.now()}`,
        wompiStatus: "COMPLETED",
      };

      // Enviar orden al servidor
      const base = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${base}/api/cart/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || `Error del servidor: ${response.status}`);
      }

      return { success: true, data: responseData };

    } catch (error) {
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
    step,
    setStep,
    formDataTarjeta,
    setFormDataTarjeta,
    accessToken,
    setAccessToken,
  };
};

export default usePaymentFakeForm;