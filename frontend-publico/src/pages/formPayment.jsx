import React, { useState, useEffect } from "react";
import InputField from "../components/payment/InputField";
import Button from "../components/payment/Button";
import usePaymentForm from "../components/payment/hook/usePaymentForm";
import { useToast } from "../hooks/useToast";
import ToastContainer from "../components/ui/ToastContainer";
import { CreditCard, Lock, Shield, CheckCircle, HelpCircle, MapPin, Globe, Building } from "lucide-react";
import "../components/styles/formPayment.css";

const FormPayment = () => {
  const { toasts, showError, removeToast } = useToast();
  
  const {
    formData,
    handleChangeData,
    handleChangeTarjeta,
    formDataTarjeta,
    limpiarFormulario,
    handleFinishPayment,
    step,
    setStep,
    detectCardType,
  } = usePaymentForm();

  const [cardType, setCardType] = useState('unknown');

  // Detectar tipo de tarjeta cuando cambie el número
  useEffect(() => {
    if (formDataTarjeta.numeroTarjeta) {
      const detectedType = detectCardType(formDataTarjeta.numeroTarjeta);
      setCardType(detectedType);
    }
  }, [formDataTarjeta.numeroTarjeta, detectCardType]);

  const handlePaymentWithErrorHandling = async () => {
    try {
      await handleFinishPayment();
    } catch (error) {
      showError(`Error en el pago: ${error.message}`);
    }
  };

  return (
    <div className="payment-container">
      <div className="payment-card">
        <div className="payment-header">
          <h1 className="payment-title">
            <CreditCard size={24} className="icon-title" />
            Pago Simulado
          </h1>
          <p className="payment-subtitle">
            Completa los datos para generar una orden de prueba
          </p>
        </div>

        {step === 1 && (
          <div className="payment-form">
            <div className="form-section">
              <div className="input-group">
                <label htmlFor="nombre" className="input-label">
                  <User size={18} className="input-icon" />
                  Nombre del Cliente *
                </label>
                <InputField
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChangeData}
                  type="text"
                  placeholder="Ej: Gabriel Alexander"
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="email" className="input-label">
                  <Mail size={18} className="input-icon" />
                  Email del Cliente *
                </label>
                <InputField
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChangeData}
                  type="email"
                  placeholder="Ej: gaboquintana10@gmail.com"
                  required
                />
              </div>

              <div className="form-footer">
                <Button
                  onClick={() => setStep(2)}
                  variant="primary"
                  className="btn-primary"
                  text="Continuar al Pago"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="payment-process">
            <div className="payment-details">
              <h3 className="payment-details-title">
                <CreditCard size={18} />
                Información de Pago
              </h3>
              
              <div className="card-form">
                <div className="input-group">
                  <label htmlFor="numeroTarjeta" className="input-label">
                    Número de tarjeta *
                  </label>
                  <div className="card-input">
                    <CreditCard size={18} />
                    <InputField
                      id="numeroTarjeta"
                      name="numeroTarjeta"
                      value={formDataTarjeta.numeroTarjeta}
                      onChange={handleChangeTarjeta}
                      type="text"
                      placeholder="4242 4242 4242 4242"
                      required
                      maxLength="19"
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label htmlFor="nombreTarjeta" className="input-label">
                    Nombre en la tarjeta *
                  </label>
                  <InputField
                    id="nombreTarjeta"
                    name="nombreTarjeta"
                    value={formDataTarjeta.nombreTarjeta}
                    onChange={handleChangeTarjeta}
                    type="text"
                    placeholder="Como aparece en la tarjeta"
                    required
                  />
                </div>

                <div className="double-grid">
                  <div className="input-group">
                    <label className="input-label">
                      Fecha de vencimiento *
                    </label>
                    <div className="expiry-fields">
                      <select
                        name="mesVencimiento"
                        value={formDataTarjeta.mesVencimiento}
                        onChange={handleChangeTarjeta}
                        className="expiry-select"
                        required
                      >
                        <option value="">Mes</option>
                        {Array.from({length: 12}, (_, i) => (
                          <option key={i+1} value={String(i+1).padStart(2, '0')}>
                            {String(i+1).padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                      <select
                        name="anioVencimiento"
                        value={formDataTarjeta.anioVencimiento}
                        onChange={handleChangeTarjeta}
                        className="expiry-select"
                        required
                      >
                        <option value="">Año</option>
                        {Array.from({length: 10}, (_, i) => (
                          <option key={i} value={new Date().getFullYear() + i}>
                            {new Date().getFullYear() + i}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="input-group">
                    <div className="cvv-label-container">
                      <label htmlFor="cvv" className="input-label">
                        CVV *
                      </label>
                      <span className="help-tooltip">
                        <HelpCircle size={16} />
                        <span className="tooltip-text">
                          El CVV son los 3 dígitos en el reverso de tu tarjeta
                        </span>
                      </span>
                    </div>
                    <InputField
                      id="cvv"
                      name="cvv"
                      value={formDataTarjeta.cvv}
                      onChange={handleChangeTarjeta}
                      type="text"
                      placeholder="123"
                      required
                      maxLength="3"
                    />
                  </div>
                </div>

                <div className="accepted-cards">
                  <span>Tarjetas aceptadas:</span>
                  <div className="card-brands">
                    <div className="card-brand visa">VISA</div>
                    <div className="card-brand mastercard">MASTERCARD</div>
                  </div>
                </div>
              </div>

              <div className="payment-actions">
                <Button
                  onClick={() => setStep(1)}
                  variant="secondary"
                  className="btn-secondary"
                  text="Volver"
                />
                <Button
                  onClick={handlePaymentWithErrorHandling}
                  variant="primary"
                  className="btn-primary"
                  text="Confirmar Pago"
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="payment-success">
            <div className="success-icon">
              <CheckCircle size={32} />
            </div>
            <h2 className="success-title">¡Pago Simulado Exitoso!</h2>
            <p className="success-message">
              Esta es una simulación, no se ha realizado ningún cargo real
            </p>

            <div className="success-details">
              <div className="detail-item">
                <span className="detail-label">Nombre:</span>
                <span className="detail-value">{formData.nombre}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{formData.email}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Tarjeta:</span>
                <span className="detail-value">•••• •••• •••• {formDataTarjeta.numeroTarjeta.slice(-4)}</span>
              </div>
            </div>

            <div className="success-actions">
              <Button
                onClick={() => {
                  setStep(1);
                  limpiarFormulario();
                }}
                variant="primary"
                className="btn-primary"
                text="Nuevo Pago"
              />
            </div>
          </div>
        )}
      </div>
      
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default FormPayment;