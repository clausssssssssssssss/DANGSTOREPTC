import React, { useState, useEffect } from 'react';
import './SplashScreen.css';

const SplashScreen = ({ onComplete, userInfo, duration = 6000, logoSrc }) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [animationPhase, setAnimationPhase] = useState('entering'); // entering, loading, completing
  const [currentMessage, setCurrentMessage] = useState(0);

  const loadingSteps = [
    "Conectando con DangStore...",
    "Verificando credenciales...",
    "Cargando tu perfil...",
    "Sincronizando productos...",
    "Preparando catálogo...",
    "¡Bienvenido a DangStore!"
  ];

  const welcomeMessages = [
    "Convertimos pequeños píxeles en grandes ideas",
    "Cada llavero es elaborado a mano con precisión",
    "Dando vida a personajes que marcan tu estilo",
    "Creatividad y calidad en cada diseño artesanal",
    "Hama Beads listos o personalizados para ti",
    "Transmitimos originalidad y alegría en cada detalle"
  ];

  const pixelIcons = ['🍔', '🍟', '🌭', '🥤', '🍕', '🍗', '🥓', '🧀', '🌮', '🍿', '🥨', '🍩'];

  useEffect(() => {
    // Fase de entrada (0-1s)
    const enterTimer = setTimeout(() => {
      setAnimationPhase('loading');
    }, 1000);

    // Cambio de mensajes cada 2 segundos
    const messageTimer = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % welcomeMessages.length);
    }, 2000);

    // Progreso principal
    const increment = 100 / (duration / 50);
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          setAnimationPhase('completing');
          setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => onComplete(), 500);
          }, 800);
          return 100;
        }
        
        const newStep = Math.floor((prev / 100) * (loadingSteps.length - 1));
        setCurrentStep(newStep);
        
        return prev + increment;
      });
    }, 50);

    return () => {
      clearTimeout(enterTimer);
      clearInterval(messageTimer);
      clearInterval(progressTimer);
    };
  }, [onComplete, duration]);

  if (!isVisible) return null;

  const getUserName = () => {
    if (!userInfo) return 'Creativo';
    return userInfo.name || userInfo.nombre || userInfo.username || userInfo.email?.split('@')[0] || 'Creativo';
  };

  return (
    <div className={`splash-screen ${animationPhase}`}>
      {/* Fondo blanco con partículas */}
      <div className="splash-background">
        {/* Partículas flotantes */}
        <div className="floating-particles">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                '--delay': `${Math.random() * 4}s`,
                '--x': `${Math.random() * 100}%`,
                '--y': `${Math.random() * 100}%`,
              }}
            >
              {pixelIcons[Math.floor(Math.random() * pixelIcons.length)]}
            </div>
          ))}
        </div>
      </div>

      {/* Contenido principal */}
      <div className="splash-content">
        {/* Título principal */}
        <div className="title-section">
          <h1 className="main-title">
            Bienvenido a <span className="brand-name">DangStore</span>
          </h1>
          <p className="user-greeting">
            Hola, <span className="user-name">{getUserName()}</span>
          </p>
        </div>

        {/* Mensaje rotativo */}
        <div className="message-section">
          <div className="message-container">
            <p className="welcome-message" key={currentMessage}>
              {welcomeMessages[currentMessage]}
            </p>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="progress-section">
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${progress}%` }}
              >
                <div className="progress-shine"></div>
              </div>
            </div>
            <div className="progress-text">
              <span className="progress-percentage">{Math.round(progress)}%</span>
              <span className="progress-label">Completado</span>
            </div>
          </div>

          {/* Indicadores de pasos */}
          <div className="steps-container">
            <div className="steps-track">
              {loadingSteps.map((_, index) => (
                <div
                  key={index}
                  className={`step-indicator ${index <= currentStep ? 'active' : ''}`}
                />
              ))}
            </div>
          </div>

          {/* Estado actual */}
          <div className="current-step">
            <p className="step-text">
              {loadingSteps[currentStep]}
            </p>
          </div>
        </div>

        {/* Indicadores de carga */}
        <div className="loading-indicators">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="loading-dot"
              style={{ '--delay': `${i * 0.2}s` }}
            />
          ))}
        </div>

        {/* Texto final */}
        <div className="footer-text">
          <p>Creando tu experiencia única con llaveros de píxeles...</p>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;