import React, { useState, useEffect } from "react";
import InputField from "../components/payment/InputField";
import Button from "../components/payment/Button";
import usePaymentForm from "../components/payment/hook/usePaymentForm";
import { useToast } from "../hooks/useToast";
import ToastContainer from "../components/ui/ToastContainer";
import { CreditCard, User, Mail, HelpCircle, CheckCircle, MapPin, ShoppingCart } from "lucide-react";
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
            Pago Simulado con Tarjeta
          </h1>
          <p className="payment-subtitle">
            Completa los datos para generar una orden de prueba
          </p>
        </div>

        {/* PASO 1: DATOS DE LA TARJETA */}
        {step === 1 && (
          <div className="payment-form">
            <div className="form-section">
              <h3 className="section-title">
                <CreditCard size={18} className="input-icon" />
                Datos de la Tarjeta
              </h3>
              <p className="section-subtitle">
                Completa los datos de tu tarjeta para la simulación
              </p>
              
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
                        <option value="">MM</option>
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
                        <option value="">AAAA</option>
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

                <div className="form-footer">
                  <Button
                    onClick={() => setStep(2)}
                    variant="primary"
                    className="btn-primary"
                    text="Continuar a Facturación"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PASO 2: DIRECCIÓN DE FACTURACIÓN */}
        {step === 2 && (
          <div className="payment-form">
            <div className="form-section">
              <h3 className="section-title">
                <MapPin size={18} className="input-icon" />
                Dirección de Facturación
              </h3>
              <p className="section-subtitle">
                Completa tu información de facturación
              </p>
              
              <div className="billing-form">
                <div className="input-group">
                  <label htmlFor="nombreFacturacion" className="input-label">
                    Nombre completo *
                  </label>
                  <InputField
                    id="nombreFacturacion"
                    name="nombreFacturacion"
                    value={formDataTarjeta.nombreFacturacion}
                    onChange={handleChangeTarjeta}
                    type="text"
                    placeholder="Nombre y apellidos"
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="emailFacturacion" className="input-label">
                    Email de facturación *
                  </label>
                  <InputField
                    id="emailFacturacion"
                    name="emailFacturacion"
                    value={formDataTarjeta.emailFacturacion}
                    onChange={handleChangeTarjeta}
                    type="email"
                    placeholder="email@ejemplo.com"
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="telefonoFacturacion" className="input-label">
                    Teléfono *
                  </label>
                  <InputField
                    id="telefonoFacturacion"
                    name="telefonoFacturacion"
                    value={formDataTarjeta.telefonoFacturacion}
                    onChange={handleChangeTarjeta}
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="direccionFacturacion" className="input-label">
                    Dirección *
                  </label>
                  <InputField
                    id="direccionFacturacion"
                    name="direccionFacturacion"
                    value={formDataTarjeta.direccionFacturacion}
                    onChange={handleChangeTarjeta}
                    type="text"
                    placeholder="Calle, número, apartamento"
                    required
                  />
                </div>

                <div className="triple-grid">
                  <div className="input-group">
                    <label htmlFor="ciudadFacturacion" className="input-label">
                      Ciudad *
                    </label>
                    <InputField
                      id="ciudadFacturacion"
                      name="ciudadFacturacion"
                      value={formDataTarjeta.ciudadFacturacion}
                      onChange={handleChangeTarjeta}
                      type="text"
                      placeholder="Ciudad"
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor="estadoFacturacion" className="input-label">
                      Estado/Provincia *
                    </label>
                    <InputField
                      id="estadoFacturacion"
                      name="estadoFacturacion"
                      value={formDataTarjeta.estadoFacturacion}
                      onChange={handleChangeTarjeta}
                      type="text"
                      placeholder="Estado o provincia"
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor="codigoPostal" className="input-label">
                      Código Postal *
                    </label>
                    <InputField
                      id="codigoPostal"
                      name="codigoPostal"
                      value={formDataTarjeta.codigoPostal}
                      onChange={handleChangeTarjeta}
                      type="text"
                      placeholder="Código postal"
                      required
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label htmlFor="paisFacturacion" className="input-label">
                    País *
                  </label>
                  <InputField
                    id="paisFacturacion"
                    name="paisFacturacion"
                    value={formDataTarjeta.paisFacturacion}
                    onChange={handleChangeTarjeta}
                    type="text"
                    placeholder="País"
                    required
                  />
              </div>

                <div className="form-footer">
                <Button
                  onClick={() => setStep(1)}
                  variant="secondary"
                  className="btn-secondary"
                    text="Volver a Tarjeta"
                  />
                  <Button
                    onClick={() => setStep(3)}
                    variant="primary"
                    className="btn-primary"
                    text="Continuar a Confirmación"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PASO 3: CONFIRMACIÓN Y PAGO */}
        {step === 3 && (
          <div className="payment-form">
            <div className="form-section">
              <h3 className="section-title">
                <CheckCircle size={18} className="input-icon" />
                Confirmar Pago
              </h3>
              <p className="section-subtitle">
                Revisa los datos antes de confirmar
              </p>
              
              <div className="confirmation-details">
                <div className="detail-section">
                  <h4>Datos de la Tarjeta</h4>
                  <p>•••• •••• •••• {formDataTarjeta.numeroTarjeta.slice(-4)}</p>
                  <p>{formDataTarjeta.nombreTarjeta}</p>
                </div>

                <div className="detail-section">
                  <h4>Dirección de Facturación</h4>
                  <p>{formDataTarjeta.nombreFacturacion}</p>
                  <p>{formDataTarjeta.direccionFacturacion}</p>
                  <p>{formDataTarjeta.ciudadFacturacion}, {formDataTarjeta.estadoFacturacion} {formDataTarjeta.codigoPostal}</p>
                  <p>{formDataTarjeta.paisFacturacion}</p>
                </div>

                <div className="form-footer">
                  <Button
                    onClick={() => setStep(2)}
                    variant="secondary"
                    className="btn-secondary"
                    text="Volver a Facturación"
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
          </div>
        )}

        {/* PASO 4: PAGO EXITOSO */}
        {step === 4 && (
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
                <span className="detail-label">Tarjeta:</span>
                <span className="detail-value">•••• •••• •••• {formDataTarjeta.numeroTarjeta.slice(-4)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Nombre:</span>
                <span className="detail-value">{formDataTarjeta.nombreFacturacion}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{formDataTarjeta.emailFacturacion}</span>
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
