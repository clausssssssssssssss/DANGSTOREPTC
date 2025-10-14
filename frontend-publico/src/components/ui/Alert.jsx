import React from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import './Alert.css';

const Alert = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'info', 
  showCancel = false, 
  onConfirm, 
  onCancel,
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  showInput = false,
  inputPlaceholder = '',
  inputValue = '',
  onInputChange = () => {}
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="alert-icon success" />;
      case 'error':
        return <XCircle className="alert-icon error" />;
      case 'warning':
        return <AlertTriangle className="alert-icon warning" />;
      default:
        return <Info className="alert-icon info" />;
    }
  };

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    onClose();
  };

  return (
    <div className="alert-overlay" onClick={onClose}>
      <div className={`alert-modal ${type}`} onClick={(e) => e.stopPropagation()}>
        <div className="alert-header">
          {getIcon()}
          <h3 className="alert-title">{title}</h3>
        </div>
        
        <div className="alert-body">
          <p className="alert-message">{message}</p>
          {showInput && (
            <div className="alert-input-container">
              <input
                type="text"
                className="alert-input"
                placeholder={inputPlaceholder}
                value={inputValue}
                onChange={(e) => onInputChange(e.target.value)}
                autoFocus
              />
            </div>
          )}
        </div>
        
        <div className="alert-footer">
          {showCancel && (
            <button 
              className="alert-btn cancel"
              onClick={handleCancel}
            >
              {cancelText}
            </button>
          )}
          <button 
            className={`alert-btn confirm ${type}`}
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Alert;