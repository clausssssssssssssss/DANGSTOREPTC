import { useState } from 'react';

const useAlert = () => {
  const [alert, setAlert] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    showCancel: false,
    onConfirm: null,
    onCancel: null,
    confirmText: 'Aceptar',
    cancelText: 'Cancelar',
    showInput: false,
    inputPlaceholder: '',
    inputValue: '',
    onInputChange: () => {}
  });

  const showAlert = ({
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
    setAlert({
      isOpen: true,
      title,
      message,
      type,
      showCancel,
      onConfirm,
      onCancel,
      confirmText,
      cancelText,
      showInput,
      inputPlaceholder,
      inputValue,
      onInputChange
    });
  };

  const hideAlert = () => {
    setAlert(prev => ({ ...prev, isOpen: false }));
  };

  const confirm = (title, message, onConfirm, onCancel) => {
    showAlert({
      title,
      message,
      type: 'warning',
      showCancel: true,
      onConfirm,
      onCancel,
      confirmText: 'Confirmar',
      cancelText: 'Cancelar'
    });
  };

  const success = (title, message, onConfirm) => {
    showAlert({
      title,
      message,
      type: 'success',
      onConfirm,
      confirmText: 'Entendido'
    });
  };

  const error = (title, message, onConfirm) => {
    showAlert({
      title,
      message,
      type: 'error',
      onConfirm,
      confirmText: 'Entendido'
    });
  };

  const info = (title, message, onConfirm) => {
    showAlert({
      title,
      message,
      type: 'info',
      onConfirm,
      confirmText: 'Entendido'
    });
  };

  const prompt = (title, message, placeholder, onConfirm, onCancel) => {
    showAlert({
      title,
      message,
      type: 'warning',
      showCancel: true,
      showInput: true,
      inputPlaceholder: placeholder,
      inputValue: '',
      onConfirm,
      onCancel,
      confirmText: 'Enviar',
      cancelText: 'Cancelar'
    });
  };

  return {
    alert,
    showAlert,
    hideAlert,
    confirm,
    success,
    error,
    info,
    prompt
  };
};

export default useAlert;
