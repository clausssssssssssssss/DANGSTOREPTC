import { useState } from 'react';

const usePaymentForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    monto: '0.01'
  });

  const [formDataTarjeta, setFormDataTarjeta] = useState({
    numeroTarjeta: '',
    nombreTarjeta: '',
    mesVencimiento: '',
    anioVencimiento: '',
    cvv: '123'
  });

  const handleChangeData = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChangeTarjeta = (e) => {
    const { name, value } = e.target;
    setFormDataTarjeta(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFirstStep = () => {
    if (formData.nombre && formData.email && formData.monto) {
      setStep(2);
    }
  };

  const handleFinishPayment = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setStep(3);
        resolve();
      }, 1500);
    });
  };

  const limpiarFormulario = () => {
    setFormData({
      nombre: '',
      email: '',
      monto: '0.01'
    });
    setFormDataTarjeta({
      numeroTarjeta: '',
      nombreTarjeta: '',
      mesVencimiento: '',
      anioVencimiento: '',
      cvv: '123'
    });
    setStep(1);
  };

  return {
    formData,
    handleChangeData,
    handleChangeTarjeta,
    formDataTarjeta,
    limpiarFormulario,
    handleFirstStep,
    handleFinishPayment,
    step,
    setStep
  };
};

export default usePaymentForm;