import React from "react";
import { CreditCard, User, Mail, DollarSign, HelpCircle, ArrowLeft, RotateCw } from 'react-feather';
import InputField from "../components/payment/InputField";
import Button from "../components/payment/Button";
import usePaymentForm from "../components/payment/hook/usePaymentForm";
import { formatCardNumber } from "../utils/validator";
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

              <div className="input-group">
                <label htmlFor="monto" className="input-label">
                  <DollarSign size={18} className="input-icon" />
                  Monto *
                </label>
                <InputField
                  id="monto"
                  name="monto"
                  value={formData.monto}
                  onChange={handleChangeData}
                  type="number"
                  placeholder="0.01"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="form-footer">
              <Button
                onClick={handleFirstStep}
                variant="primary"
                className="btn-primary"
                text="Continuar al Pago"
                icon="arrow-right"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="payment-process">
            <div className="summary-card">
              <h3 className="summary-title">
                <User size={18} className="summary-icon" />
                Datos Recibidos
              </h3>
              <div className="summary-details">
                <div className="detail-item">
                  <span className="detail-label">Nombre:</span>
                  <span className="detail-value">{formData.nombre}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{formData.email}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Monto:</span>
                  <span className="detail-value">${parseFloat(formData.monto || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="payment-details">
              <h3 className="payment-details-title">
                <CreditCard size={18} className="details-icon" />
                Información de Pago
              </h3>

              <div className="card-form">
                <div className="input-group">
                  <label htmlFor="numeroTarjeta" className="input-label">
                    Número de tarjeta *
                  </label>
                  <div className="card-input">
                    <CreditCard size={18} className="card-icon" />
                    <InputField
                      id="numeroTarjeta"
                      name="numeroTarjeta"
                      value={formatCardNumber(formDataTarjeta.numeroTarjeta)}
                      onChange={handleChangeTarjeta}
                      type="text"
                      placeholder="4242 4242 4242 4242"
                      required
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
                    <label className="input-label">Fecha de vencimiento *</label>
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
                    <label htmlFor="cvv" className="input-label">
                      CVV *
                      <span className="help-tooltip">
                        <HelpCircle size={16} />
                        <span className="tooltip-text">
                          El CVV son los 3 dígitos en el reverso de tu tarjeta
                        </span>
                      </span>
                    </label>
                    <InputField
                      id="cvv"
                      name="cvv"
                      value={formDataTarjeta.cvv}
                      onChange={handleChangeTarjeta}
                      type="text"
                      placeholder="123"
                      required
                    />
                  </div>
                </div>

                <div className="accepted-cards">
                  <span>Tarjetas aceptadas:</span>
                  <div className="card-brands">
                    <div className="card-brand visa">VISA</div>
                    <div className="card-brand mastercard">Mastercard</div>
                    <div className="card-brand amex">AMEX</div>
                  </div>
                </div>
              </div>

              <div className="payment-actions">
                <Button
                  onClick={() => setStep(1)}
                  variant="secondary"
                  className="btn-secondary"
                  text="Volver"
                  icon="arrow-left"
                />
                <Button
                  onClick={handleFinishPayment}
                  variant="primary"
                  className="btn-primary"
                  text="Confirmar Pago"
                  icon="credit-card"
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="payment-success">
            <div className="success-icon">
              <svg viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
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
                <span className="detail-label">Monto:</span>
                <span className="detail-value">${parseFloat(formData.monto || 0).toFixed(2)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Tarjeta:</span>
                <span className="detail-value">•••• •••• •••• {formDataTarjeta.numeroTarjeta.slice(-4)}</span>
              </div>
            </div>

            <Button
              onClick={limpiarFormulario}
              variant="primary"
              className="btn-primary"
              text="Nueva Transacción"
              icon="rotate-cw"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FormPayment;