import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import './Toast.css';

const Toast = ({ message, type = 'info', duration = 4000, onClose, onConfirm, showConfirmButton = false }) => {
  const [isVisible, setIsVisible] = useState(true);

  // No necesitamos manejar el timeout aquí, el hook lo hace

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={18} color="#10b981" />;
      case 'error':
        return <AlertCircle size={18} color="#ef4444" />;
      case 'warning':
        return <AlertTriangle size={18} color="#fbbf24" />;
      default:
        return <Info size={18} color="#3b82f6" />;
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose(); // Eliminar inmediatamente
  };

  return (
    <div className={`toast ${type} ${isVisible ? 'show' : 'hide'}`}>
      <div className="toast-icon">
        {getIcon()}
      </div>
      <div className="toast-content">
        <p className="toast-message">{message}</p>
        {showConfirmButton && (
          <button className="toast-confirm-btn" onClick={handleConfirm}>
            Confirmar
          </button>
        )}
      </div>
    </div>
  );
};

export default Toast; 