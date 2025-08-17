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
    <div className="payment-page">
      <div className="payment-wrapper">
        <div className="page-header">
          <h1 className="page-title">Información de Pago</h1>
        </div>

          <div className="payment-card">
            <div className="section-header">
            <h2 className="section-title">
              <CreditCard size={24} />
              Información de Pago
            </h2>
              <p className="section-subtitle">
              <Lock size={16} />
              Completa los datos de tu tarjeta para continuar
              </p>
            </div>

          <div className="card-form">
            {/* Información de la Tarjeta */}
            <div className="form-section">
              <h3 className="section-subtitle">
                <CreditCard size={18} />
                Datos de la Tarjeta
              </h3>
              
              <InputField 
                id="numeroTarjeta" 
                name="numeroTarjeta" 
                value={formDataTarjeta.numeroTarjeta} 
                onChange={handleChangeTarjeta} 
                type="text" 
                label="Número de tarjeta" 
                placeholder="4242 4242 4242 4242" 
                maxLength="19"
                required 
              />

              <InputField 
                id="nombreTitular" 
                name="nombreTitular" 
                value={formDataTarjeta.nombreTitular} 
                onChange={handleChangeTarjeta} 
                type="text" 
                label="Nombre en la tarjeta" 
                placeholder="Como aparece en la tarjeta" 
                required 
              />

              <div className="triple-grid">
                <InputField 
                  id="mesVencimiento" 
                  name="mesVencimiento" 
                  value={formDataTarjeta.mesVencimiento} 
                  onChange={handleChangeTarjeta} 
                  type="text" 
                  label="Mes" 
                  placeholder="MM" 
                  maxLength="2"
                  required 
                />
                <InputField 
                  id="anioVencimiento" 
                  name="anioVencimiento" 
                  value={formDataTarjeta.anioVencimiento} 
                  onChange={handleChangeTarjeta} 
                  type="text" 
                  label="Año" 
                  placeholder="YYYY" 
                  maxLength="4"
                  required 
                />
                <div className="input-field">
                  <label htmlFor="cvv" className="input-label">
                    CVV <span className="required">*</span>
                    <HelpCircle size={16} className="help-icon" />
                  </label>
                  <input
                    type="text"
                    id="cvv"
                    name="cvv"
                    value={formDataTarjeta.cvv}
                    onChange={handleChangeTarjeta}
                    className="input"
                    placeholder="123"
                    maxLength="4"
                    required
                  />
              </div>
            </div>
          </div>

            {/* Información de Facturación */}
            <div className="form-section">
              <h3 className="section-subtitle">
                <Building size={18} />
                Dirección de Facturación
              </h3>
              
              <div className="double-grid">
                <InputField 
                  id="nombreFacturacion" 
                  name="nombreFacturacion" 
                  value={formDataTarjeta.nombreFacturacion || ''} 
                  onChange={handleChangeTarjeta} 
                  type="text" 
                  label="Nombre completo" 
                  placeholder="Nombre y apellidos" 
                  required 
                />
                <InputField 
                  id="emailFacturacion" 
                  name="emailFacturacion" 
                  value={formDataTarjeta.emailFacturacion || ''} 
                  onChange={handleChangeTarjeta} 
                  type="email" 
                  label="Email de facturación" 
                  placeholder="email@ejemplo.com" 
                  required 
                />
              </div>

              <InputField 
                id="direccionFacturacion" 
                name="direccionFacturacion" 
                value={formDataTarjeta.direccionFacturacion || ''} 
                onChange={handleChangeTarjeta} 
                type="text" 
                label="Dirección" 
                placeholder="Calle, número, apartamento" 
                required 
              />

                <div className="triple-grid">
                <InputField 
                  id="ciudadFacturacion" 
                  name="ciudadFacturacion" 
                  value={formDataTarjeta.ciudadFacturacion || ''} 
                  onChange={handleChangeTarjeta} 
                  type="text" 
                  label="Ciudad" 
                  placeholder="Ciudad" 
                  required 
                />
                <InputField 
                  id="estadoFacturacion" 
                  name="estadoFacturacion" 
                  value={formDataTarjeta.estadoFacturacion || ''} 
                  onChange={handleChangeTarjeta} 
                  type="text" 
                  label="Estado/Provincia" 
                  placeholder="Estado o provincia" 
                  required 
                />
                <InputField 
                  id="codigoPostal" 
                  name="codigoPostal" 
                  value={formDataTarjeta.codigoPostal || ''} 
                  onChange={handleChangeTarjeta} 
                  type="text" 
                  label="Código Postal" 
                  placeholder="Código postal" 
                  required 
                />
              </div>

              <InputField 
                id="paisFacturacion" 
                name="paisFacturacion" 
                value={formDataTarjeta.paisFacturacion || ''} 
                onChange={handleChangeTarjeta} 
                type="text" 
                label="País" 
                placeholder="País" 
                required 
              />
            </div>

            {/* Información Adicional */}
            <div className="form-section">
              <h3 className="section-subtitle">
                <Shield size={18} />
                Información Adicional
              </h3>
              
              <div className="double-grid">
                <InputField 
                  id="telefonoFacturacion" 
                  name="telefonoFacturacion" 
                  value={formDataTarjeta.telefonoFacturacion || ''} 
                  onChange={handleChangeTarjeta} 
                  type="tel" 
                  label="Teléfono" 
                  placeholder="+1 (555) 123-4567" 
                  required 
                />
                <InputField 
                  id="empresaFacturacion" 
                  name="empresaFacturacion" 
                  value={formDataTarjeta.empresaFacturacion || ''} 
                  onChange={handleChangeTarjeta} 
                  type="text" 
                  label="Empresa (opcional)" 
                  placeholder="Nombre de la empresa" 
                />
              </div>
            </div>

            <div className="accepted-cards">
              <span className="accepted-label">Tarjetas aceptadas:</span>
              <div className="card-logos">
                <div className="card-logo visa">VISA</div>
                <div className="card-logo mastercard">MASTERCARD</div>
                <div className="card-logo amex">AMEX</div>
                <div className="card-logo discover">DISCOVER</div>
              </div>
                </div>

                <div className="actions actions-duo">
              <Button 
                onClick={() => window.history.back()} 
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
          </div>
      
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default FormPayment;
