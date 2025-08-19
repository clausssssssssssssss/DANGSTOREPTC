import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

const PasswordSection = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [loading, setLoading] = useState(false);
  const [validation, setValidation] = useState({
    currentPassword: true,
    newPassword: true,
    confirmPassword: true
  });

  const { showSuccess, showError } = useToast();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validar en tiempo real
    if (field === 'newPassword') {
      validateNewPassword(value);
    } else if (field === 'confirmPassword') {
      validateConfirmPassword(value, formData.newPassword);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validateNewPassword = (password) => {
    const isValid = password.length >= 8 && 
                   /[A-Z]/.test(password) && 
                   /[a-z]/.test(password) && 
                   /[0-9]/.test(password);
    
    setValidation(prev => ({ ...prev, newPassword: isValid }));
    return isValid;
  };

  const validateConfirmPassword = (confirmPassword, newPassword) => {
    const isValid = confirmPassword === newPassword && confirmPassword.length > 0;
    setValidation(prev => ({ ...prev, confirmPassword: isValid }));
    return isValid;
  };

  const validateForm = () => {
    const currentValid = formData.currentPassword.length > 0;
    const newValid = validateNewPassword(formData.newPassword);
    const confirmValid = validateConfirmPassword(formData.confirmPassword, formData.newPassword);

    setValidation({
      currentPassword: currentValid,
      newPassword: newValid,
      confirmPassword: confirmValid
    });

    return currentValid && newValid && confirmValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showError('Por favor, completa todos los campos correctamente');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const response = await fetch('https://dangstoreptc.onrender.com/api/profile/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cambiar la contraseña');
      }

      showSuccess('Contraseña actualizada exitosamente');
      
      // Limpiar formulario
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setValidation({
        currentPassword: true,
        newPassword: true,
        confirmPassword: true
      });

    } catch (error) {
      console.error('Error changing password:', error);
      showError(error.message || 'Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (password.length === 0) return { level: 0, text: '', color: '#e5e7eb' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const levels = [
      { text: 'Muy débil', color: '#ef4444' },
      { text: 'Débil', color: '#f97316' },
      { text: 'Regular', color: '#eab308' },
      { text: 'Buena', color: '#22c55e' },
      { text: 'Excelente', color: '#16a34a' }
    ];

    return levels[Math.min(score - 1, 4)] || { level: 0, text: '', color: '#e5e7eb' };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <div className="content-card">
      <div className="card-header">
        <div className="card-title">
          <Lock size={20} className="section-icon" />
          <h3>Cambiar Contraseña</h3>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="password-form">
        <div className="form-grid">
          {/* Contraseña actual */}
          <div className="form-field">
            <label htmlFor="currentPassword" className="form-label">
              Contraseña actual <span className="required">*</span>
            </label>
            <div className="password-input-container">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                id="currentPassword"
                value={formData.currentPassword}
                onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                className={`form-input ${!validation.currentPassword ? 'error' : ''}`}
                placeholder="Ingresa tu contraseña actual"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => togglePasswordVisibility('current')}
                title={showPasswords.current ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {!validation.currentPassword && (
              <div className="field-error">
                <AlertCircle size={14} />
                <span>La contraseña actual es requerida</span>
              </div>
            )}
          </div>

          {/* Nueva contraseña */}
          <div className="form-field">
            <label htmlFor="newPassword" className="form-label">
              Nueva contraseña <span className="required">*</span>
            </label>
            <div className="password-input-container">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                id="newPassword"
                value={formData.newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                className={`form-input ${!validation.newPassword ? 'error' : ''}`}
                placeholder="Mínimo 8 caracteres"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => togglePasswordVisibility('new')}
                title={showPasswords.new ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            {/* Indicador de fortaleza de contraseña */}
            {formData.newPassword.length > 0 && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div 
                    className="strength-fill" 
                    style={{ 
                      width: `${(passwordStrength.level + 1) * 20}%`,
                      backgroundColor: passwordStrength.color 
                    }}
                  ></div>
                </div>
                <span className="strength-text" style={{ color: passwordStrength.color }}>
                  {passwordStrength.text}
                </span>
              </div>
            )}

            {!validation.newPassword && (
              <div className="field-error">
                <AlertCircle size={14} />
                <span>La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número</span>
              </div>
            )}
          </div>

          {/* Confirmar nueva contraseña */}
          <div className="form-field">
            <label htmlFor="confirmPassword" className="form-label">
              Confirmar nueva contraseña <span className="required">*</span>
            </label>
            <div className="password-input-container">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={`form-input ${!validation.confirmPassword ? 'error' : ''}`}
                placeholder="Repite la nueva contraseña"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => togglePasswordVisibility('confirm')}
                title={showPasswords.confirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {!validation.confirmPassword && (
              <div className="field-error">
                <AlertCircle size={14} />
                <span>Las contraseñas no coinciden</span>
              </div>
            )}
          </div>
        </div>

        {/* Requisitos de contraseña */}
        <div className="password-requirements">
          <h4 className="requirements-title">
            <Shield size={16} />
            Requisitos de la nueva contraseña:
          </h4>
          <ul className="requirements-list">
            <li className={formData.newPassword.length >= 8 ? 'valid' : ''}>
              <CheckCircle size={14} />
              Mínimo 8 caracteres
            </li>
            <li className={/[A-Z]/.test(formData.newPassword) ? 'valid' : ''}>
              <CheckCircle size={14} />
              Al menos una letra mayúscula
            </li>
            <li className={/[a-z]/.test(formData.newPassword) ? 'valid' : ''}>
              <CheckCircle size={14} />
              Al menos una letra minúscula
            </li>
            <li className={/[0-9]/.test(formData.newPassword) ? 'valid' : ''}>
              <CheckCircle size={14} />
              Al menos un número
            </li>
          </ul>
        </div>

        {/* Botones de acción */}
        <div className="form-actions">
          <button
            type="submit"
            className="save-button"
            disabled={loading || !validation.currentPassword || !validation.newPassword || !validation.confirmPassword}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Actualizando...
              </>
            ) : (
              <>
                <Lock size={16} />
                Actualizar Contraseña
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PasswordSection;
