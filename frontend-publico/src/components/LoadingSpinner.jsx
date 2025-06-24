import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = () => (
  <div className="loading-spinner">
    <div className="spinner"></div>
    <p>Cargando...</p>
  </div>
);

export default LoadingSpinner;