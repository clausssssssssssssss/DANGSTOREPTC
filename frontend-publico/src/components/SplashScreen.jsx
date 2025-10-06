// SplashScreen.jsx
import React, { useState, useEffect } from 'react';
import './SplashScreen.css';

const SplashScreen = ({ onComplete, userInfo, duration = 3000, logoSrc }) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Crear partículas flotantes
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 2,
    }));
    setParticles(newParticles);

    const increment = 100 / (duration / 50);
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
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
    return (
      userInfo.name ||
      userInfo.nombre ||
      userInfo.username ||
      userInfo.email?.split('@')[0] ||
      'Creativo'
    );
  };

  return (
    <div className="splash-screen-modern">
      {/* Partículas de fondo */}
      <div className="particles-container">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="particle"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Contenido principal */}
      <div className="splash-content-modern">
        <div className="logo-section-modern">
          <div className="logo-wrapper-modern">
            {logoSrc ? (
              <img src={logoSrc} alt="DANGSTORE Logo" className="logo-image-modern" />
            ) : (
              <div className="logo-placeholder-modern">
                <span className="logo-text-modern">DS</span>
              </div>
            )}
            <div className="logo-glow-modern"></div>
          </div>
        </div>

        <div className="title-section-modern">
          <h1 className="welcome-text-modern">Bienvenido a</h1>
          <h2 className="brand-text-modern">DANGSTORE</h2>
          <p className="subtitle-text-modern">Donde la creatividad cobra vida</p>
        </div>

        <div className="greeting-section-modern">
          <p className="user-greeting-modern">
            Hola, <span className="user-name-modern">{getUserName()}</span>
          </p>
        </div>

        <div className="progress-section-modern">
          <div className="progress-bar-modern">
            <div
              className="progress-fill-modern"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="loading-text-modern">Cargando tu experiencia...</p>
          <p className="progress-text-modern">{Math.round(progress)}%</p>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
