import React, { useState, useEffect } from "react";
import InputField from "../components/payment/InputField";
import Button from "../components/payment/Button";
import DeliveryPointSelector from "../components/payment/DeliveryPointSelector";
import usePaymentForm from "../components/payment/hook/usePaymentForm";
import { usePaymentValidation } from "../hooks/usePaymentValidation";
import { useToast } from "../hooks/useToast";
import ToastContainer from "../components/ui/ToastContainer";
import { CreditCard, User, Mail, HelpCircle, CheckCircle, MapPin, ShoppingCart } from "lucide-react";
import "../components/styles/formPayment.css";
import "../components/styles/formPaymentFake.css";
import "../components/styles/PixelDecorations.css";

const FormPayment = () => {
  const { toasts, showError, showWarning, removeToast } = useToast();
  
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

  const {
    errors,
    validateField,
    validateForm,
    touchField,
    clearErrors,
    getFieldValidationState,
    formatCardNumber,
    detectCardType: detectCardTypeValidation
  } = usePaymentValidation();

  const [cardType, setCardType] = useState('unknown');
  const [selectedDeliveryPoint, setSelectedDeliveryPoint] = useState(null);
  const [deliveryPoints, setDeliveryPoints] = useState([]);

  // Handler mejorado para cambios en campos con validación
  const handleFieldChange = (fieldName, value, additionalData = {}) => {
    // Actualizar el formulario
    handleChangeTarjeta({
      target: {
        name: fieldName,
        value: value
      }
    });

    // Validar el campo en tiempo real
    if (fieldName === 'numeroTarjeta') {
      const formattedValue = formatCardNumber(value);
      const detectedType = detectCardTypeValidation(formattedValue);
      setCardType(detectedType);
      
      validateField(fieldName, formattedValue, { cardType: detectedType });
    } else if (fieldName === 'cvv') {
      // Solo permitir números y limitar a 3 dígitos máximo
      const numericValue = value.replace(/\D/g, '').slice(0, 3);
      
      // Forzar la actualización del valor si es diferente
      handleChangeTarjeta({
        target: {
          name: fieldName,
          value: numericValue
        }
      });
      
      // Validar el CVV - solo permitir exactamente 3 dígitos
      const cvvValue = numericValue.slice(0, 3);
      validateField(fieldName, cvvValue, { cardType });
    } else if (fieldName === 'mesVencimiento' || fieldName === 'anioVencimiento') {
      // Actualizar el estado primero
      handleChangeTarjeta({
        target: {
          name: fieldName,
          value: value
        }
      });
      
      // Validar la fecha completa después de actualizar el estado
      setTimeout(() => {
        const currentFormData = formDataTarjeta;
        validateField('expiryDate', value, {
          month: fieldName === 'mesVencimiento' ? value : currentFormData.mesVencimiento,
          year: fieldName === 'anioVencimiento' ? value : currentFormData.anioVencimiento
        });
      }, 0);
    } else {
      validateField(fieldName, value, additionalData);
    }
  };

  // Handler para blur (cuando el usuario sale del campo)
  const handleFieldBlur = (fieldName) => {
    touchField(fieldName);
  };

  // Detectar tipo de tarjeta cuando cambie el número
  useEffect(() => {
    if (formDataTarjeta.numeroTarjeta) {
      const detectedType = detectCardTypeValidation(formDataTarjeta.numeroTarjeta);
      setCardType(detectedType);
    }
  }, [formDataTarjeta.numeroTarjeta, detectCardTypeValidation]);

  // Cargar puntos de entrega al montar el componente
  useEffect(() => {
    const fetchDeliveryPoints = async () => {
      try {
        const response = await fetch('https://dangstoreptc-production.up.railway.app/api/delivery-points');
        const data = await response.json();
        
        if (data.success) {
          setDeliveryPoints(data.deliveryPoints || []);
        }
      } catch (error) {
        console.error('Error fetching delivery points:', error);
      }
    };

    fetchDeliveryPoints();
  }, []);

  const handlePaymentWithErrorHandling = async () => {
    try {
      if (!selectedDeliveryPoint) {
        showWarning('Por favor selecciona un punto de entrega');
        return;
      }
      await handleFinishPayment(selectedDeliveryPoint._id);
    } catch (error) {
      showError(`Error en el pago: ${error.message}`);
    }
  };
  
  const handleSelectDeliveryPoint = (pointId) => {
    // Buscar el punto completo por ID
    const point = deliveryPoints.find(p => p._id === pointId);
    setSelectedDeliveryPoint(point);
  };
  
  // Validar que todos los campos del paso actual estén llenos
  const validateCurrentStep = () => {
    if (step === 1) {
      // Validar datos de la tarjeta
      const { numeroTarjeta, nombreTarjeta, mesVencimiento, anioVencimiento, cvv } = formDataTarjeta;
      
      // Verificar si algún campo está vacío
      const camposFaltantes = [];
      const camposConError = [];
      
      // Validar número de tarjeta
      if (!numeroTarjeta || numeroTarjeta.trim() === '') {
        camposFaltantes.push('número de tarjeta');
      } else if (numeroTarjeta.replace(/\s/g, '').length < 13) {
        camposConError.push('número de tarjeta (mínimo 13 dígitos)');
      }
      
      // Validar nombre del titular
      if (!nombreTarjeta || nombreTarjeta.trim() === '') {
        camposFaltantes.push('nombre del titular');
      } else if (nombreTarjeta.trim().length < 2) {
        camposConError.push('nombre del titular (mínimo 2 caracteres)');
      }
      
      // Validar mes
      if (!mesVencimiento || mesVencimiento.trim() === '') {
        camposFaltantes.push('mes de vencimiento');
      } else {
        const month = parseInt(mesVencimiento);
        if (month < 1 || month > 12) {
          camposConError.push('mes de vencimiento (1-12)');
        }
      }
      
      // Validar año
      if (!anioVencimiento || anioVencimiento.trim() === '') {
        camposFaltantes.push('año de vencimiento');
      } else {
        const year = parseInt(anioVencimiento);
        const currentYear = new Date().getFullYear();
        if (year < currentYear) {
          camposConError.push('año de vencimiento (no puede ser anterior al actual)');
        }
      }
      
      // Validar CVV
      if (!cvv || cvv.trim() === '') {
        camposFaltantes.push('CVV');
      } else if (cvv.length !== 3) {
        camposConError.push('CVV (debe tener exactamente 3 dígitos)');
      }
      
      // Mostrar mensaje de error apropiado
      if (camposFaltantes.length > 0) {
        showError(`Completa los siguientes campos: ${camposFaltantes.join(', ')}`);
        return false;
      }
      
      if (camposConError.length > 0) {
        showError(`Corrige los siguientes campos: ${camposConError.join(', ')}`);
        return false;
      }
      
      // Validar que la fecha no haya expirado
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      const expiryYear = parseInt(anioVencimiento);
      const expiryMonth = parseInt(mesVencimiento);
      
      if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
        showError('La tarjeta ha expirado');
        return false;
      }
      
      return true;
    }
    
    if (step === 2) {
      if (!selectedDeliveryPoint) {
        showError('Debes seleccionar un punto de entrega para continuar');
        return false;
      }
      return true;
    }
    
    return true;
  };

  const continueToNextStep = () => {
    // Validar el paso actual antes de continuar
    const isValid = validateCurrentStep();
    
    if (isValid) {
      if (step === 1) {
        setStep(2);
      } else if (step === 2) {
        setStep(3);
      }
      // Limpiar errores al avanzar exitosamente
      clearErrors();
    }
    // Si no es válido, validateCurrentStep ya mostró el error
  };

  const continueToConfirmation = () => {
    continueToNextStep();
  };

  return (
    <div className="payment-container" style={{ position: 'relative' }}>
      {/* Decoraciones pixeladas */}
      <div className="pixel-decoration" style={{ top: '10%', left: '4%' }}>
        <div className="pixel-float" style={{ top: '0px', left: '0px' }}></div>
        <div className="hama-bead" style={{ top: '30px', left: '25px' }}></div>
        <div className="pixel-float" style={{ top: '60px', left: '8px' }}></div>
      </div>
      
      <div className="pixel-decoration" style={{ top: '20%', right: '6%' }}>
        <div className="hama-bead" style={{ top: '0px', left: '0px' }}></div>
        <div className="pixel-float" style={{ top: '40px', left: '18px' }}></div>
      </div>
      
      <div className="pixel-decoration" style={{ bottom: '25%', left: '12%' }}>
        <div className="pixel-float" style={{ top: '0px', left: '0px' }}></div>
        <div className="hama-bead" style={{ top: '35px', left: '20px' }}></div>
        <div className="pixel-float" style={{ top: '70px', left: '5px' }}></div>
      </div>

      <div className="pixel-decoration" style={{ top: '65%', right: '18%' }}>
        <div className="hama-bead" style={{ top: '0px', left: '0px' }}></div>
        <div className="pixel-float" style={{ top: '30px', left: '15px' }}></div>
      </div>

      <div className="pixel-grid"></div>
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
                <div className="card-input">
                  <CreditCard size={18} className="card-icon" />
                  <InputField
                    id="numeroTarjeta"
                    name="numeroTarjeta"
                    value={formDataTarjeta.numeroTarjeta}
                    onChange={(e) => handleFieldChange('numeroTarjeta', e.target.value)}
                    onBlur={() => handleFieldBlur('numeroTarjeta')}
                    type="text"
                    placeholder="4242 4242 4242 4242"
                    label="Número de tarjeta"
                    required
                    maxLength="19"
                    error={errors.numeroTarjeta}
                    validationState={getFieldValidationState('numeroTarjeta')}
                    autoComplete="cc-number"
                  />
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
                      <div className="input-field">
                        <select
                          name="mesVencimiento"
                          value={formDataTarjeta.mesVencimiento}
                          onChange={(e) => handleFieldChange('mesVencimiento', e.target.value)}
                          onBlur={() => handleFieldBlur('mesVencimiento')}
                          className={`expiry-select ${errors.mesVencimiento || errors.expiryDate ? 'error' : ''}`}
                          required
                        >
                          <option value="">MM</option>
                          {Array.from({length: 12}, (_, i) => (
                            <option key={i+1} value={String(i+1).padStart(2, '0')}>
                              {String(i+1).padStart(2, '0')}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="input-field">
                        <select
                          name="anioVencimiento"
                          value={formDataTarjeta.anioVencimiento}
                          onChange={(e) => handleFieldChange('anioVencimiento', e.target.value)}
                          onBlur={() => handleFieldBlur('anioVencimiento')}
                          className={`expiry-select ${errors.anioVencimiento || errors.expiryDate ? 'error' : ''}`}
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
                    {(errors.mesVencimiento || errors.anioVencimiento || errors.expiryDate) && (
                      <div className="field-error">
                        {errors.mesVencimiento || errors.anioVencimiento || errors.expiryDate}
                      </div>
                    )}
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
                      onChange={(e) => handleFieldChange('cvv', e.target.value)}
                      onBlur={() => handleFieldBlur('cvv')}
                      type="text"
                      placeholder="123"
                      label=""
                      required
                      maxLength="3"
                      error={errors.cvv}
                      validationState={getFieldValidationState('cvv')}
                      autoComplete="cc-csc"
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
                    onClick={continueToNextStep}
                    variant="primary"
                    className="btn-primary"
                    text="Continuar a Punto de Entrega"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PASO 2: PUNTO DE ENTREGA */}
        {step === 2 && (
          <div className="payment-form">
            <div className="form-section">
              <h3 className="section-title">
                <MapPin size={18} className="input-icon" />
                Punto de Entrega
              </h3>
              <p className="section-subtitle">
                Selecciona dónde deseas recoger tu pedido
              </p>
              
              <div className="billing-form">
                <DeliveryPointSelector 
                  selectedDeliveryPoint={selectedDeliveryPoint?._id}
                  onDeliveryPointChange={handleSelectDeliveryPoint}
                />

                <div className="form-footer">
                  <Button
                    onClick={() => setStep(1)}
                    variant="secondary"
                    className="btn-secondary"
                    text="Volver a Tarjeta"
                  />
                  <Button
                    onClick={continueToNextStep}
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
                  <h4>Punto de Entrega</h4>
                  {selectedDeliveryPoint ? (
                    <>
                      <p><strong>{selectedDeliveryPoint.nombre}</strong></p>
                      <p>{selectedDeliveryPoint.direccion}</p>
                      <p>{selectedDeliveryPoint.horarioAtencion}</p>
                    </>
                  ) : (
                    <p>No seleccionado</p>
                  )}
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
                <span className="detail-label">Punto de Entrega:</span>
                <span className="detail-value">{selectedDeliveryPoint?.nombre || 'No seleccionado'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Dirección:</span>
                <span className="detail-value">{selectedDeliveryPoint?.direccion || '-'}</span>
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
