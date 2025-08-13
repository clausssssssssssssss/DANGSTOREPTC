import React from "react";
import InputField from "../components/payment/InputField";
import Button from "../components/payment/Button";
import usePaymentForm from "../components/payment/hook/usePaymentForm";
import { formatCardNumber } from "../utils/validator";
import TitleH2 from "../components/payment/TitleH2";
import SpanText from "../components/payment/SpanText";
import CardResumen from "../components/payment/CardResumen";
import TitleH1 from "../components/payment/TitleH1";
import ProgressBar from "../components/payment/ProgressBar";
import "../components/styles/formPayment.css";

const FormPayment = () => {
  const {
    formData,
    handleChangeData,
    handleChangeTarjeta,
    formDataTarjeta,
    limpiarFormulario,
    handleFirstStep,
    handleFinishPayment,
    step,
    setStep,
  } = usePaymentForm();

  return (
    <div className="payment-page">
      <div className="payment-wrapper">
        <div className="page-header">
          <TitleH1 text="Formulario de Pago" />
          <div className="progress-wrapper">
            <ProgressBar step={step} />
          </div>
        </div>

        {step === 1 && (
          <div className="payment-card">
            <div className="section-header">
              <h2 className="section-title">Información del cliente</h2>
              <p className="section-subtitle">
                Este formulario realiza un cobro real a través de una API. Tener cuidado con los datos ingresados,
                de preferencia hacer pruebas enviando $0.01
              </p>
            </div>

            <div className="form-grid">
              <InputField id="nombre" name="nombre" value={formData.nombre} onChange={handleChangeData} type="text" label="Nombres" placeholder="Daniel Wilfredo" required />
              <InputField id="apellido" name="apellido" value={formData.apellido} onChange={handleChangeData} type="text" label="Apellidos" placeholder="Granados Hernández" required />
              <InputField id="email" name="email" value={formData.email} onChange={handleChangeData} type="email" label="Correo Electrónico" placeholder="juan@ejemplo.com" required />
              <InputField id="direccion" name="direccion" value={formData.direccion} onChange={handleChangeData} type="text" label="Dirección" placeholder="Av. Aguilares 201" required />
              <InputField id="ciudad" name="ciudad" value={formData.ciudad} onChange={handleChangeData} type="text" label="Ciudad" placeholder="San Salvador" required />
              <InputField id="telefono" name="telefono" value={formData.telefono} onChange={handleChangeData} type="text" label="Teléfono" placeholder="7777-7777" required />
              <InputField id="monto" name="monto" value={formData.monto} onChange={handleChangeData} type="number" label="Monto a Pagar" placeholder="0.00" min="0" step="0.01" required />

              <div className="actions">
                <Button onClick={handleFirstStep} variant="primary" className="btn-primary" text="Continuar con el Pago →" />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="payment-steps">
            <CardResumen formData={formData} />

            <div className="payment-card">
              <div className="section-header">
                <h2 className="section-title">Información de pago</h2>
              </div>
              <div className="form-grid">
                <InputField id="numeroTarjeta" name="numeroTarjeta" value={formatCardNumber(formDataTarjeta.numeroTarjeta)} onChange={handleChangeTarjeta} type="text" label="Número de Tarjeta" placeholder="1234 5678 9012 3456" required />

                <div className="triple-grid">
                  <InputField id="mesVencimiento" name="mesVencimiento" value={formDataTarjeta.mesVencimiento} onChange={handleChangeTarjeta} type="number" label="Mes" placeholder="MM" min="1" max="12" required />
                  <InputField id="anioVencimiento" name="anioVencimiento" value={formDataTarjeta.anioVencimiento} onChange={handleChangeTarjeta} type="number" label="Año" placeholder="YYYY" min={new Date().getFullYear()} required />
                  <InputField id="cvv" name="cvv" value={formDataTarjeta.cvv} onChange={handleChangeTarjeta} type="text" label="CVV" placeholder="123" required />
                </div>

                <div className="actions actions-duo">
                  <Button onClick={() => setStep(1)} variant="danger" className="btn-secondary" text="← Volver" />
                  <Button onClick={handleFinishPayment} variant="secondary" className="btn-primary" text="💰 Procesar Pago" />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="payment-card success-card">
            <h2 className="success-title">¡Pago Exitoso!</h2>
            <p className="success-text">Tu transacción ha sido procesada correctamente</p>
            <div className="success-box">
              <p>Monto procesado: ${parseFloat(formData?.monto || 0).toFixed(2)}</p>
            </div>
            <Button onClick={limpiarFormulario} variant="primary" className="btn-primary w-full" text="🔄 Nueva Transacción" />
          </div>
        )}
      </div>
    </div>
  );
};

export default FormPayment;
