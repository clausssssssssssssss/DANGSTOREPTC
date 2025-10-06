import React, { useState, useEffect } from 'react';
import './SplashScreen.css';

const SplashScreen = ({ onComplete, userInfo, duration = 3000, logoSrc }) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Progreso simple
    const increment = 100 / (duration / 50);
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => onComplete(), 300);
          }, 500);
          return 100;
        }
        return prev + increment;
      });
    }, 50);

    return () => {
      clearInterval(progressTimer);
    };
  }, [onComplete, duration]);

  if (!isVisible) return null;

  const getUserName = () => {
    if (!userInfo) return 'Creativo';
    return userInfo.name || userInfo.nombre || userInfo.username || userInfo.email?.split('@')[0] || 'Creativo';
  };

  return (
    <div className="splash-screen-simple">
      <div className="splash-content-simple">
        {/* Logo */}
        <div className="logo-section-simple">
          {logoSrc ? (
            <img 
              src={logoSrc} 
              alt="DANGSTORE Logo" 
              className="logo-image-simple"
            />
          ) : (
            <div className="logo-placeholder-simple">
              <span className="logo-text-simple">DS</span>
            </div>
          )}
        </div>

        {/* Título */}
        <div className="title-section-simple">
          <h1 className="main-title-simple">
            Bienvenido a <span className="brand-name-simple">DANGSTORE</span>
          </h1>
          <p className="user-greeting-simple">
            Hola, <span className="user-name-simple">{getUserName()}</span>
          </p>
        </div>

        {/* Barra de progreso simple */}
        <div className="progress-section-simple">
          <div className="progress-bar-simple">
            <div 
              className="progress-fill-simple"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="loading-text-simple">
            Cargando tu experiencia...
          </p>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;