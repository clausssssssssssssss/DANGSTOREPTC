import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import InputField from "../components/payment/InputField";
import Button from "../components/payment/Button";
import "../components/styles/formPayment.css";
import { useCart } from "../context/CartContext";

const FormPaymentFake = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart, getTotal } = useCart();
  const [step, setStep] = useState(1);
  const totalFromCart = location.state?.total || getTotal();
  
  const [formData, setFormData] = useState({
    nombre: "",
    email: ""
  });
  const [formDataTarjeta, setFormDataTarjeta] = useState({
    numeroTarjeta: "",
    nombreTarjeta: "",
    mesVencimiento: "",
    anioVencimiento: "",
    cvv: ""
  });
  const [errors, setErrors] = useState({});

  const formatCardNumber = (value) => {
    if (!value) return '';
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    }
    return v;
  };

  const handleChangeData = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleChangeTarjeta = (e) => {
    const { name, value } = e.target;
    
    if (name === 'numeroTarjeta') {
      const numericValue = value.replace(/[^0-9]/g, '').slice(0, 16);
      setFormDataTarjeta({
        ...formDataTarjeta,
        [name]: numericValue
      });
    } else if (name === 'cvv') {
      const numericValue = value.replace(/[^0-9]/g, '').slice(0, 3);
      setFormDataTarjeta({
        ...formDataTarjeta,
        [name]: numericValue
      });
    } else {
      setFormDataTarjeta({
        ...formDataTarjeta,
        [name]: value
      });
    }
  };

  const validateFirstStep = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = "Nombre es requerido";
    if (!formData.email.trim()) {
      newErrors.email = "Email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email no válido";
    }
    
    if (Object.keys(newErrors).length === 0) {
      setErrors({});
      setStep(2);
    } else {
      setErrors(newErrors);
    }
  };

  const validateSecondStep = () => {
    const newErrors = {};
    const cardNumber = formDataTarjeta.numeroTarjeta.replace(/\s/g, '');
    
    if (!cardNumber || cardNumber.length !== 16) {
      newErrors.numeroTarjeta = "Se requieren exactamente 16 dígitos";
    }
    if (!formDataTarjeta.nombreTarjeta.trim()) {
      newErrors.nombreTarjeta = "Nombre en tarjeta es requerido";
    }
    if (!formDataTarjeta.mesVencimiento) {
      newErrors.mesVencimiento = "Mes requerido";
    }
    if (!formDataTarjeta.anioVencimiento) {
      newErrors.anioVencimiento = "Año requerido";
    }
    if (!formDataTarjeta.cvv || formDataTarjeta.cvv.length !== 3) {
      newErrors.cvv = "Se requieren exactamente 3 dígitos";
    }
    
    if (Object.keys(newErrors).length === 0) {
      setErrors({});
      handleFinishPayment();
    } else {
      setErrors(newErrors);
    }
  };

  const handleFinishPayment = () => {
    clearCart();
    setStep(3);
  };

  const icons = {
    creditCard: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
        <line x1="1" y1="10" x2="23" y2="10"></line>
      </svg>
    ),
    user: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    ),
    mail: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
        <polyline points="22,6 12,13 2,6"></polyline>
      </svg>
    ),
    helpCircle: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
        <line x1="12" y1="17" x2="12" y2="17"></line>
      </svg>
    ),
    arrowLeft: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
      </svg>
    ),
    check: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    ),
    shoppingBag: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <path d="M16 10a4 4 0 0 1-8 0"></path>
      </svg>
    ),
    home: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
    )
  };

  return (
    <div className="payment-container">
      <div className="payment-card">
        {step === 1 && (
          <>
            <div className="payment-header">
              <h1 className="payment-title">
                {icons.creditCard}
                Pago Simulado
              </h1>
              <p className="payment-subtitle">
                Completa los datos para generar una orden de prueba
              </p>
              
              <div className="payment-total">
                <span>Total a pagar:</span>
                <span className="total-amount">${totalFromCart.toFixed(2)}</span>
              </div>
            </div>

            <div className="payment-form" autoComplete="off">
              <div className="form-section">
                <div className="input-group">
                  <label htmlFor="nombre" className="input-label">
                    {icons.user}
                    Nombre del Cliente
                    <span className="required-field">*</span>
                  </label>
                  <InputField
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChangeData}
                    type="text"
                    placeholder="Nombre completo"
                    required
                    error={errors.nombre}
                    autoComplete="off"
                  />
                  {errors.nombre && <span className="error-message">{errors.nombre}</span>}
                </div>

                <div className="input-group">
                  <label htmlFor="email" className="input-label">
                    {icons.mail}
                    Email del Cliente
                    <span className="required-field">*</span>
                  </label>
                  <InputField
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChangeData}
                    type="email"
                    placeholder="correo@ejemplo.com"
                    required
                    error={errors.email}
                    autoComplete="off"
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>
              </div>

              <div className="form-footer">
                <Button
                  onClick={validateFirstStep}
                  variant="primary"
                  className="btn-primary"
                  text="Continuar al Pago"
                />
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <div className="payment-process">
            <div className="payment-details">
              <h3 className="payment-details-title">
                {icons.creditCard}
                Información de Pago
              </h3>
              
              <div className="payment-summary">
                <div className="summary-total">
                  <span>Total a pagar:</span>
                  <span className="total-amount">${totalFromCart.toFixed(2)}</span>
                </div>
              </div>

              <div className="card-form" autoComplete="off">
                <div className="input-group">
                  <label htmlFor="numeroTarjeta" className="input-label">
                    Número de tarjeta
                    <span className="required-field">*</span>
                  </label>
                  <div className="card-input">
                    {icons.creditCard}
                    <InputField
                      id="numeroTarjeta"
                      name="numeroTarjeta"
                      value={formatCardNumber(formDataTarjeta.numeroTarjeta)}
                      onChange={handleChangeTarjeta}
                      type="text"
                      placeholder="4242 4242 4242 4242"
                      required
                      maxLength="19"
                      error={errors.numeroTarjeta}
                      autoComplete="cc-number"
                      inputMode="numeric"
                    />
                  </div>
                  {errors.numeroTarjeta && <span className="error-message">{errors.numeroTarjeta}</span>}
                </div>

                <div className="input-group">
                  <label htmlFor="nombreTarjeta" className="input-label">
                    Nombre en la tarjeta
                    <span className="required-field">*</span>
                  </label>
                  <InputField
                    id="nombreTarjeta"
                    name="nombreTarjeta"
                    value={formDataTarjeta.nombreTarjeta}
                    onChange={handleChangeTarjeta}
                    type="text"
                    placeholder="Como aparece en la tarjeta"
                    required
                    error={errors.nombreTarjeta}
                    autoComplete="cc-name"
                  />
                  {errors.nombreTarjeta && <span className="error-message">{errors.nombreTarjeta}</span>}
                </div>

                <div className="double-grid">
                  <div className="input-group">
                    <label className="input-label">
                      Fecha de vencimiento
                      <span className="required-field">*</span>
                    </label>
                    <div className="expiry-fields">
                      <select
                        name="mesVencimiento"
                        value={formDataTarjeta.mesVencimiento}
                        onChange={handleChangeTarjeta}
                        className={`expiry-select ${errors.mesVencimiento ? 'error' : ''}`}
                        required
                        autoComplete="cc-exp-month"
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
                        className={`expiry-select ${errors.anioVencimiento ? 'error' : ''}`}
                        required
                        autoComplete="cc-exp-year"
                      >
                        <option value="">Año</option>
                        {Array.from({length: 10}, (_, i) => (
                          <option key={i} value={new Date().getFullYear() + i}>
                            {new Date().getFullYear() + i}
                          </option>
                        ))}
                      </select>
                    </div>
                    {(errors.mesVencimiento || errors.anioVencimiento) && (
                      <span className="error-message">
                        {errors.mesVencimiento || errors.anioVencimiento}
                      </span>
                    )}
                  </div>

                  <div className="input-group">
                    <div className="cvv-label-container">
                      <label htmlFor="cvv" className="input-label">
                        CVV
                        <span className="required-field">*</span>
                      </label>
                      <span className="help-tooltip">
                        {icons.helpCircle}
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
                      error={errors.cvv}
                      autoComplete="off"
                      inputMode="numeric"
                    />
                    {errors.cvv && <span className="error-message">{errors.cvv}</span>}
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
                  icon={icons.arrowLeft}
                />
                <Button
                  onClick={validateSecondStep}
                  variant="primary"
                  className="btn-primary"
                  text="Confirmar Pago"
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <motion.div
            className="payment-success"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className="success-icon"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 20 }}
            >
              {icons.check}
            </motion.div>
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
              <div className="detail-item">
                <span className="detail-label">Total:</span>
                <span className="detail-value">${totalFromCart.toFixed(2)}</span>
              </div>
            </div>

            <div className="success-actions">
              <Button
                onClick={() => navigate('/catalogo')}
                variant="primary"
                className="btn-primary"
                text="Seguir Comprando"
                icon={icons.shoppingBag}
              />
              <Button
                onClick={() => navigate('/')}
                variant="secondary"
                className="btn-secondary"
                text="Volver al Inicio"
                icon={icons.home}
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FormPaymentFake;