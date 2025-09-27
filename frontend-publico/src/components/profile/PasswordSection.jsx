import React, { useState } from 'react';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

// URL del servidor local para desarrollo
const API_BASE = 'https://dangstoreptc-production.up.railway.app/api';

const PasswordSection = ({ showSuccess, showError }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!currentPassword.trim()) {
      newErrors.currentPassword = 'La contraseña actual es requerida';
    }

    if (!newPassword.trim()) {
      newErrors.newPassword = 'La nueva contraseña es requerida';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'La nueva contraseña debe tener al menos 6 caracteres';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirma tu nueva contraseña';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const response = await fetch(`${API_BASE}/profile/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Contraseña actual incorrecta');
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cambiar la contraseña');
      }

      showSuccess('¡Contraseña actualizada exitosamente!');
      
      // Limpiar formulario y salir del modo edición
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsEditing(false);
      
    } catch (error) {
      console.error('Error changing password:', error);
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrors({});
    setIsEditing(false);
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

  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <div className="content-card">
      <div className="card-header">
        <div className="card-title">
          <Lock size={20} className="section-icon" />
          <h3>Cambiar Contraseña</h3>
        </div>
        {!isEditing ? (
          <button className="edit-button" onClick={() => setIsEditing(true)}>
            <Lock size={16} /> Cambiar
          </button>
        ) : (
          <div className="edit-actions">
            <button className="cancel-button" onClick={handleCancel}>
              Cancelar
            </button>
            <button 
              className="save-button" 
              onClick={handleSubmit} 
              disabled={loading || errors.currentPassword || errors.newPassword || errors.confirmPassword}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Actualizando...
                </>
              ) : (
                <>
                  <Lock size={16} />
                  Guardar
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {isEditing && (
        <form onSubmit={handleSubmit} className="password-form">
          <div className="form-grid">
            {/* Contraseña actual */}
            <div className="form-field">
              <label htmlFor="currentPassword" className="form-label">
                Contraseña actual <span className="required">*</span>
              </label>
              <div className="password-input-container">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={`form-input ${errors.currentPassword ? 'error' : ''}`}
                  placeholder="Ingresa tu contraseña actual"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  title={showCurrentPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.currentPassword && (
                <div className="field-error">
                  <AlertCircle size={14} />
                  <span>{errors.currentPassword}</span>
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
                  type={showNewPassword ? 'text' : 'password'}
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`form-input ${errors.newPassword ? 'error' : ''}`}
                  placeholder="Mínimo 8 caracteres"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  title={showNewPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {/* Indicador de fortaleza de contraseña */}
              {newPassword.length > 0 && (
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

              {errors.newPassword && (
                <div className="field-error">
                  <AlertCircle size={14} />
                  <span>{errors.newPassword}</span>
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
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder="Repite la nueva contraseña"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  title={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <div className="field-error">
                  <AlertCircle size={14} />
                  <span>{errors.confirmPassword}</span>
                </div>
              )}
            </div>
          </div>

        </form>
      )}

      {!isEditing && (
        <div className="password-info-section">
          <div className="edit-hint">
            <Lock size={16} />
            <span>Haz clic en "Cambiar" para modificar tu contraseña de forma segura.</span>
          </div>
          
          {/* Mostrar requisitos siempre */}
          <div className="password-requirements">
            <h4 className="requirements-title">
              <Lock size={16} />
              Requisitos de la nueva contraseña:
            </h4>
            <ul className="requirements-list">
              <li>
                <CheckCircle size={14} />
                Mínimo 8 caracteres
              </li>
              <li>
                <CheckCircle size={14} />
                Al menos una letra mayúscula
              </li>
              <li>
                <CheckCircle size={14} />
                Al menos una letra minúscula
              </li>
              <li>
                <CheckCircle size={14} />
                Al menos un número
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordSection;
