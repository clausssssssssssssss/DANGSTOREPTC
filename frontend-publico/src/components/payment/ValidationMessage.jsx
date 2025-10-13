import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

const ValidationMessage = ({ type, message, show }) => {
  if (!show || !message) return null;

  const isError = type === 'error';
  const isSuccess = type === 'success';

  return (
    <div className={`${isError ? 'error-message' : 'success-message'}`}>
      {isError ? (
        <AlertCircle size={12} />
      ) : (
        <CheckCircle size={12} />
      )}
      <span>{message}</span>
    </div>
  );
};

export default ValidationMessage;

