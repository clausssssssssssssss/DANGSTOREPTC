import { useState, useEffect } from 'react';

export const usePaymentValidation = () => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isValidating, setIsValidating] = useState(false);

  // Validar número de tarjeta
  const validateCardNumber = (cardNumber) => {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    
    if (!cleanNumber) {
      return 'El número de tarjeta es requerido';
    }
    
    if (!/^\d+$/.test(cleanNumber)) {
      return 'El número de tarjeta solo puede contener dígitos';
    }
    
    if (cleanNumber.length < 13 || cleanNumber.length > 19) {
      return 'El número de tarjeta debe tener entre 13 y 19 dígitos';
    }
    
    // Validación Luhn
    if (!luhnCheck(cleanNumber)) {
      return 'El número de tarjeta no es válido';
    }
    
    return null;
  };

  // Algoritmo de Luhn para validar tarjetas
  const luhnCheck = (cardNumber) => {
    let sum = 0;
    let isEven = false;
    
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber.charAt(i));
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  };

  // Validar CVV
  const validateCVV = (cvv, cardType = 'unknown') => {
    if (!cvv) {
      return 'El CVV es requerido';
    }
    
    if (!/^\d+$/.test(cvv)) {
      return 'El CVV solo puede contener dígitos';
    }
    
    // Para la mayoría de tarjetas, el CVV debe ser exactamente 3 dígitos
    if (cvv.length !== 3) {
      return 'El CVV debe tener exactamente 3 dígitos';
    }
    
    return null;
  };

  // Validar fecha de vencimiento
  const validateExpiryDate = (month, year) => {
    if (!month || !year) {
      return 'La fecha de vencimiento es requerida';
    }
    
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    const expiryYear = parseInt(year);
    const expiryMonth = parseInt(month);
    
    // Validar que el mes esté en rango
    if (expiryMonth < 1 || expiryMonth > 12) {
      return 'El mes debe estar entre 1 y 12';
    }
    
    // Validar que no haya expirado
    if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
      return 'La tarjeta ha expirado';
    }
    
    // Validar que no sea muy lejano (máximo 20 años)
    if (expiryYear > currentYear + 20) {
      return 'La fecha de vencimiento no puede ser tan lejana';
    }
    
    return null;
  };

  // Validar nombre del titular
  const validateCardholderName = (name) => {
    if (!name || !name.trim()) {
      return 'El nombre del titular es requerido';
    }
    
    if (name.trim().length < 2) {
      return 'El nombre debe tener al menos 2 caracteres';
    }
    
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name.trim())) {
      return 'El nombre solo puede contener letras y espacios';
    }
    
    return null;
  };

  // Validar email
  const validateEmail = (email) => {
    if (!email) {
      return 'El email es requerido';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'El formato del email no es válido';
    }
    
    return null;
  };

  // Validar teléfono
  const validatePhone = (phone) => {
    if (!phone) {
      return 'El teléfono es requerido';
    }
    
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(phone)) {
      return 'El formato del teléfono no es válido';
    }
    
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 7 || cleanPhone.length > 15) {
      return 'El teléfono debe tener entre 7 y 15 dígitos';
    }
    
    return null;
  };

  // Detectar tipo de tarjeta
  const detectCardType = (cardNumber) => {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    
    if (/^4/.test(cleanNumber)) return 'visa';
    if (/^5[1-5]/.test(cleanNumber)) return 'mastercard';
    if (/^3[47]/.test(cleanNumber)) return 'amex';
    if (/^6/.test(cleanNumber)) return 'discover';
    
    return 'unknown';
  };

  // Formatear número de tarjeta
  const formatCardNumber = (value) => {
    const cleanValue = value.replace(/\D/g, '');
    const cardType = detectCardType(cleanValue);
    
    if (cardType === 'amex') {
      return cleanValue.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3');
    } else {
      return cleanValue.replace(/(\d{4})/g, '$1 ').trim();
    }
  };

  // Validar campo específico
  const validateField = (fieldName, value, additionalData = {}) => {
    let error = null;
    
    switch (fieldName) {
      case 'numeroTarjeta':
        error = validateCardNumber(value);
        break;
      case 'cvv':
        error = validateCVV(value, additionalData.cardType);
        break;
      case 'mesVencimiento':
      case 'anioVencimiento':
        error = validateExpiryDate(
          additionalData.month || value,
          additionalData.year || value
        );
        break;
      case 'nombreTitular':
      case 'nombreTarjeta':
        error = validateCardholderName(value);
        break;
      case 'email':
      case 'emailFacturacion':
        error = validateEmail(value);
        break;
      case 'telefono':
      case 'telefonoFacturacion':
        error = validatePhone(value);
        break;
      default:
        if (!value || !value.trim()) {
          error = 'Este campo es requerido';
        }
    }
    
    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
    
    return error === null;
  };

  // Validar todo el formulario
  const validateForm = (formData, cardType = 'unknown') => {
    setIsValidating(true);
    const newErrors = {};
    
    // Validar campos de tarjeta
    newErrors.numeroTarjeta = validateCardNumber(formData.numeroTarjeta);
    newErrors.cvv = validateCVV(formData.cvv, cardType);
    newErrors.nombreTitular = validateCardholderName(formData.nombreTitular || formData.nombreTarjeta);
    newErrors.expiryDate = validateExpiryDate(formData.mesVencimiento, formData.anioVencimiento);
    
    // Validar campos de facturación si existen
    if (formData.emailFacturacion) {
      newErrors.emailFacturacion = validateEmail(formData.emailFacturacion);
    }
    if (formData.telefonoFacturacion) {
      newErrors.telefonoFacturacion = validatePhone(formData.telefonoFacturacion);
    }
    
    // Filtrar errores nulos
    const filteredErrors = Object.fromEntries(
      Object.entries(newErrors).filter(([_, error]) => error !== null)
    );
    
    setErrors(filteredErrors);
    setIsValidating(false);
    
    return Object.keys(filteredErrors).length === 0;
  };

  // Marcar campo como tocado
  const touchField = (fieldName) => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));
  };

  // Limpiar errores
  const clearErrors = () => {
    setErrors({});
    setTouched({});
  };

  // Obtener estado de validación de un campo
  const getFieldValidationState = (fieldName) => {
    const hasError = errors[fieldName];
    const isTouched = touched[fieldName];
    
    if (!isTouched) return 'pristine';
    if (hasError) return 'error';
    return 'success';
  };

  return {
    errors,
    touched,
    isValidating,
    validateField,
    validateForm,
    touchField,
    clearErrors,
    getFieldValidationState,
    detectCardType,
    formatCardNumber,
    validateCardNumber,
    validateCVV,
    validateExpiryDate,
    validateCardholderName,
    validateEmail,
    validatePhone
  };
};
