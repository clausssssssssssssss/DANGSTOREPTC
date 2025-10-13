import React from 'react';
import Alert from './ui/Alert';

const LimitAlert = ({ 
  type, 
  title, 
  message, 
  onClose, 
  show = true
}) => {

  const getAlertType = () => {
    switch (type) {
      case 'order_limit':
        return 'error';
      case 'stock_limit':
        return 'warning';
      default:
        return 'info';
    }
  };

  return (
    <div className="limit-alert-container">
      <Alert 
        isOpen={show}
        onClose={onClose}
        title={title}
        message={message}
        type={getAlertType()}
        showCancel={false}
        confirmText="Entendido"
      />
    </div>
  );
};

export default LimitAlert;
