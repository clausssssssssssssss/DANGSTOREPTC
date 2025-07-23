import { useState } from "react";

const usePaymentForm = () => {
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
    monto: 0.01,
    urlRedirect: "https://www.ricaldone.edu.sv",
    nombre: "",
    apellido: "",
    email: "",
    ciudad: "",
    direccion: "",
    idPais: "SV",
    idRegion: "SV-SS",
    codigoPostal: "1101",
    telefono: "",
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
    setFormDataTarjeta((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const limpiarFormulario = () => {
    setFormData({
      nombreCliente: "",
      emailCliente: "",
      monto: "",
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
    console.log("Datos del formulario:", formData);
  };

  const handleFirstStep = async () => {
    alert("Generando token de acceso...");

    // 1. Obtener token del backend
    const tokenResponse = await fetch("http://localhost:3001/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new Error(`Error al obtener token: ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    setAccessToken(tokenData.access_token);

    alert("Token generado. Enviando pago...");
    setStep(2);
  };

  const handleFinishPayment = async () => {
    try {
      const formDataPayment = {
        ...formData,
        tarjetaCreditoDebido: formDataTarjeta, // Simulando que no se envía el token de tarjeta
      };

      // 2. Enviar datos de pago al backend, que se encargará de llamar a Wompi
      const paymentResponse = await fetch(
        "http://localhost:3001/api/payment3ds",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: accessToken,
            formData: formDataPayment,
          }),
        }
      );
      console.log(formData);

      if (!paymentResponse.ok) {
        const errorText = await paymentResponse.text();
        throw new Error(`Error al procesar pago: ${errorText}`);
      }

      const paymentData = await paymentResponse.json();
      alert("Pago realizado correctamente");
      console.log("Respuesta del pago:", paymentData);
    } catch (error) {
      console.error("Error en el proceso de pago:", error);
      alert(`Error: ${error.message}`);
    }
    setStep(3);

    limpiarFormulario();
  };

  return {
    formData,
    datosEnviados,
    handleChangeData,
    handleChangeTarjeta,
    formDataTarjeta,
    handleSubmit,
    limpiarFormulario,
    handleFirstStep,
    handleFinishPayment,
    step,
    setStep,
  };
};
export default usePaymentForm;
