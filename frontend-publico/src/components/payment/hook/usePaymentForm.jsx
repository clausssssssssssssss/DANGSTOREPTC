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

  

  const handleFakePayment = async ({ items, total }) => {
    try {
      // Verificar que tenemos token
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      // Formatear items correctamente
      const formattedItems = items.map(item => {
        console.log("Procesando item:", item);
        
        return {
          product: item.product._id || item.product.id || item.product,
          quantity: parseInt(item.quantity) || 1,
          price: parseFloat(item.price || item.product.price || 0),
        };
      });

      const orderData = {
        items: formattedItems,
        total: parseFloat(total),
        wompiOrderID: `FAKE_ORDER_${Date.now()}`, // ID único
        wompiStatus: "COMPLETED",
      };

      console.log("📦 Enviando orden al backend:", orderData);

      const response = await fetch("http://localhost:4000/api/cart/order", {
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

      alert("✅ Pago simulado y orden guardada con éxito");
      return responseData; // Retornar la orden creada
    } catch (error) {
      console.error("❌ Error en pago simulado:", error);
      alert(`Error: ${error.message}`);
      return false;
    }
  };

  return {
    formData,
    datosEnviados,
    handleChange,
    handleSubmit,
    limpiarFormulario,
    handleFakePayment,
    step,
    setStep,
  };
};

export default usePaymentFakeForm;