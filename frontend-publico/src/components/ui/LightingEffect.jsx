import React from 'react';
import './LightingEffect.css';

const LightingEffect = () => {
  return (
    <div className="lighting-container">
      <div className="lighting-line">
        <div className="lighting-dot lighting-dot-1"></div>
        <div className="lighting-dot lighting-dot-2"></div>
        <div className="lighting-dot lighting-dot-3"></div>
        <div className="lighting-dot lighting-dot-4"></div>
        <div className="lighting-dot lighting-dot-5"></div>
        <div className="lighting-dot lighting-dot-6"></div>
        <div className="lighting-dot lighting-dot-7"></div>
        <div className="lighting-dot lighting-dot-8"></div>
      </div>
      {/* Línea de fondo más visible */}
      <div className="lighting-background"></div>
    </div>
  );
};

export default LightingEffect;
