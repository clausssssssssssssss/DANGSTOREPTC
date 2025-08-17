import React from 'react';
import Toast from './Toast';
import './Toast.css';

const ToastContainer = ({ toasts = [], removeToast }) => {
  // Validar que toasts sea un array
  if (!Array.isArray(toasts)) {
    return null;
  }

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
          showConfirmButton={toast.showConfirmButton}
          onConfirm={toast.onConfirm}
        />
      ))}
    </div>
  );
};

export default ToastContainer; 