import React, { useState, useEffect } from 'react';

const SplashScreen = ({ onComplete, userInfo, duration = 5000, logoSrc }) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [logoExploded, setLogoExploded] = useState(false);
  const [currentMotivation, setCurrentMotivation] = useState(0);
  const [showElements, setShowElements] = useState({
    logo: false,
    title: false,
    subtitle: false,
    progressBar: false,
    steps: false
  });

  const loadingSteps = [
    "Conectando con DangStore...",
    "Verificando credenciales...",
    "Cargando tu perfil...",
    "Sincronizando productos...",
    "Preparando catálogo de llaveros...",
    "¡Bienvenido a DangStore!"
  ];

  const motivationalPhrases = [
    "Convertimos pequeños píxeles en grandes ideas ✨",
    "Cada llavero es elaborado a mano con precisión 🎨",
    "Dando vida a personajes que marcan tu estilo único 🌟",
    "Creatividad y calidad en cada diseño artesanal 💎",
    "Hama Beads listos o personalizados para ti 🎯",
    "Transmitimos originalidad y alegría en cada detalle 🌈"
  ];

  const pixelIcons = ['🎮', '👾', '🕹️', '⭐', '💎', '🌟', '✨', '🎨', '🔥', '💫'];

  useEffect(() => {
    // Materialización secuencial de elementos
    const materializeSequence = async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      setShowElements(prev => ({ ...prev, logo: true }));
      
      await new Promise(resolve => setTimeout(resolve, 500));
      setLogoExploded(true);
      
      await new Promise(resolve => setTimeout(resolve, 400));
      setShowElements(prev => ({ ...prev, title: true }));
      
      await new Promise(resolve => setTimeout(resolve, 300));
      setShowElements(prev => ({ ...prev, subtitle: true }));
      
      await new Promise(resolve => setTimeout(resolve, 400));
      setShowElements(prev => ({ ...prev, progressBar: true }));
      
      await new Promise(resolve => setTimeout(resolve, 200));
      setShowElements(prev => ({ ...prev, steps: true }));
    };

    materializeSequence();

    // Cambio de frases motivacionales
    const motivationTimer = setInterval(() => {
      setCurrentMotivation(prev => (prev + 1) % motivationalPhrases.length);
    }, 3000);

    // Progreso principal
    const increment = 100 / (duration / 80);
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => onComplete(), 600);
          }, 1000);
          return 100;
        }
        
        const newStep = Math.floor((prev / 100) * (loadingSteps.length - 1));
        setCurrentStep(newStep);
        
        return prev + increment;
      });
    }, 80);

    return () => {
      clearInterval(motivationTimer);
      clearInterval(progressTimer);
    };
  }, [onComplete, duration]);

  if (!isVisible) return null;

  const getUserName = () => {
    if (!userInfo) return 'Creativo';
    return userInfo.name || userInfo.nombre || userInfo.username || userInfo.email?.split('@')[0] || 'Creativo';
  };

  return (
    <div 
      className={`fixed top-0 left-0 w-full h-full z-50 flex items-center justify-center transition-all duration-700 ${progress >= 100 ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999
      }}
    >
      {/* Fondo con gradiente suave y píxeles flotantes */}
      <div 
        className="absolute inset-0" 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 15%, #ddd6fe 30%, #c4b5fd 45%, #a78bfa 60%, #8b5cf6 75%, #7c3aed 90%, #6d28d9 100%)',
          overflow: 'hidden'
        }}
      >
        {/* Efectos de luz ambiental */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full animate-pulse" style={{
          background: 'radial-gradient(circle, rgba(196,181,253,0.4) 0%, rgba(196,181,253,0.2) 50%, transparent 100%)',
          filter: 'blur(60px)'
        }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full animate-pulse" style={{
          background: 'radial-gradient(circle, rgba(221,214,254,0.4) 0%, rgba(221,214,254,0.2) 50%, transparent 100%)',
          filter: 'blur(60px)',
          animationDelay: '1s'
        }}></div>
        
        {/* Píxeles flotantes temáticos */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute text-2xl animate-float-pixel"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${4 + Math.random() * 4}s`,
                filter: 'drop-shadow(0 0 8px rgba(196,181,253,0.6))'
              }}
            >
              {pixelIcons[Math.floor(Math.random() * pixelIcons.length)]}
            </div>
          ))}
        </div>

        {/* Partículas de explosión del logo */}
        {logoExploded && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 animate-explode-particle"
                style={{
                  left: '50%',
                  top: '50%',
                  background: `hsl(${250 + Math.random() * 60}, 70%, 70%)`,
                  animationDelay: `${Math.random() * 0.5}s`,
                  animationDuration: '2s',
                  transform: `translate(-50%, -50%) rotate(${Math.random() * 360}deg)`
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 text-center p-8 max-w-lg mx-4">
        {/* Logo con efecto de materialización */}
        <div className={`mb-8 transform transition-all duration-1000 ${showElements.logo ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
          <div className="w-32 h-32 mx-auto mb-6 rounded-full p-1 shadow-2xl animate-glow hologram-effect" style={{
            background: 'linear-gradient(135deg, #c4b5fd, #a78bfa, #8b5cf6)',
            boxShadow: '0 25px 50px -12px rgba(196, 181, 253, 0.3), 0 0 30px rgba(196, 181, 253, 0.2)'
          }}>
            <div className="w-full h-full rounded-full flex items-center justify-center overflow-hidden" style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(196,181,253,0.3)'
            }}>
              {logoSrc ? (
                <img 
                  src={logoSrc} 
                  alt="DangStore Logo" 
                  className="w-20 h-20 rounded-full object-cover"
                  style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }}
                />
              ) : (
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-4xl" style={{
                  background: 'linear-gradient(135deg, #ddd6fe, #8b5cf6)',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  🎨
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Título con efecto de materialización */}
        <div className={`mb-8 transition-all duration-1000 ${showElements.title ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h1 className="text-4xl font-bold mb-3 drop-shadow-lg hologram-text" style={{ color: '#6d28d9' }}>
            ¡Bienvenido a DangStore!
          </h1>
          <div className={`text-xl font-medium transition-all duration-1000 delay-300 ${showElements.subtitle ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ color: '#7c3aed' }}>
            Hola, <span className="font-semibold" style={{ color: '#6d28d9' }}>{getUserName()}</span>
          </div>
        </div>

        {/* Frases motivacionales rotativas */}
        <div className="mb-8 h-16 flex items-center justify-center">
          <div className="text-center transition-all duration-500" key={currentMotivation}>
            <p className="text-sm font-medium animate-fade-slide hologram-text" style={{ color: '#8b5cf6' }}>
              {motivationalPhrases[currentMotivation]}
            </p>
          </div>
        </div>

        {/* Barra de progreso con efectos visuales */}
        <div className={`mb-8 transition-all duration-1000 ${showElements.progressBar ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {/* Barras que saltan con el progreso */}
          <div className="flex justify-center space-x-1 mb-4">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="w-2 bg-gradient-to-t from-purple-400 to-purple-600 rounded-t transition-all duration-300"
                style={{
                  height: `${Math.max(4, (progress / 100) * 40 + Math.sin((progress / 100) * Math.PI * 4 + i * 0.5) * 8)}px`,
                  boxShadow: '0 0 10px rgba(196,181,253,0.5)'
                }}
              />
            ))}
          </div>

          {/* Barra principal */}
          <div className="w-full rounded-full h-4 mb-4 overflow-hidden border-2" style={{
            background: 'rgba(196,181,253,0.2)',
            backdropFilter: 'blur(10px)',
            borderColor: 'rgba(196,181,253,0.3)'
          }}>
            <div 
              className="h-full rounded-full transition-all duration-300 ease-out shadow-lg relative overflow-hidden"
              style={{ 
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #c4b5fd, #a78bfa, #8b5cf6)',
                boxShadow: '0 4px 20px rgba(196,181,253,0.4)'
              }}
            >
              <div className="absolute inset-0 animate-shine" style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)'
              }}></div>
            </div>
          </div>
          
          <div className="flex justify-between items-center text-sm font-medium mb-2" style={{ color: '#7c3aed' }}>
            <span>{Math.round(progress)}% completado</span>
            <span className="text-xs opacity-75">DangStore</span>
          </div>

          {/* Mini indicadores de pasos */}
          <div className="flex space-x-1 mb-4">
            {loadingSteps.map((_, index) => (
              <div
                key={index}
                className="h-1 flex-1 rounded-full transition-all duration-500"
                style={{
                  background: index <= currentStep 
                    ? 'linear-gradient(90deg, #a78bfa, #8b5cf6)' 
                    : 'rgba(196,181,253,0.3)'
                }}
              />
            ))}
          </div>
        </div>

        {/* Estado actual con materialización */}
        <div className={`min-h-[40px] mb-6 transition-all duration-1000 ${showElements.steps ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="rounded-xl px-6 py-3 border-2 hologram-box" style={{
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(15px)',
            borderColor: 'rgba(196,181,253,0.3)'
          }}>
            <p className="font-medium animate-pulse-subtle" style={{ color: '#6d28d9' }}>
              {loadingSteps[currentStep]}
            </p>
          </div>
        </div>

        {/* Indicadores de carga píxel-style */}
        <div className="flex justify-center space-x-2 mb-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="w-4 h-4 rounded animate-bounce-pixel"
              style={{ 
                background: 'linear-gradient(135deg, #c4b5fd, #8b5cf6)',
                boxShadow: '0 0 15px rgba(196,181,253,0.6)',
                animationDelay: `${i * 0.2}s`
              }}
            />
          ))}
        </div>

        {/* Texto adicional temático */}
        <div className="text-xs animate-fade-in" style={{ 
          animationDelay: '2s',
          color: '#a78bfa'
        }}>
          Creando tu experiencia única con llaveros de píxeles...
        </div>
      </div>

      {/* Estilos CSS expandidos */}
      <style jsx global>{`
        body.splash-active {
          overflow: hidden;
        }
        
        /* Efectos holográficos */
        .hologram-effect {
          position: relative;
        }
        
        .hologram-effect::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%);
          border-radius: inherit;
          animation: hologram-sweep 3s linear infinite;
        }
        
        .hologram-text {
          text-shadow: 0 0 10px rgba(196,181,253,0.5), 0 0 20px rgba(196,181,253,0.3);
        }
        
        .hologram-box {
          position: relative;
          overflow: hidden;
        }
        
        .hologram-box::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%);
          animation: hologram-rotate 4s linear infinite;
        }
        
        /* Animaciones de partículas */
        @keyframes explode-particle {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) translate(200px, 0) scale(0);
            opacity: 0;
          }
        }
        
        @keyframes float-pixel {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg) scale(1); 
            opacity: 0.7;
          }
          25% { 
            transform: translateY(-15px) rotate(90deg) scale(1.1); 
            opacity: 1;
          }
          50% { 
            transform: translateY(-8px) rotate(180deg) scale(0.9); 
            opacity: 0.8;
          }
          75% { 
            transform: translateY(-20px) rotate(270deg) scale(1.05); 
            opacity: 1;
          }
        }
        
        @keyframes bounce-pixel {
          0%, 20%, 50%, 80%, 100% { 
            transform: translateY(0) scale(1) rotate(0deg); 
          }
          40% { 
            transform: translateY(-8px) scale(1.1) rotate(180deg); 
          }
          60% { 
            transform: translateY(-4px) scale(1.05) rotate(360deg); 
          }
        }
        
        @keyframes fade-slide {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          20%, 80% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(-10px);
          }
        }
        
        @keyframes hologram-sweep {
          0% { transform: translateX(-100%) rotate(45deg); }
          100% { transform: translateX(100%) rotate(45deg); }
        }
        
        @keyframes hologram-rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes glow {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(196,181,253,0.3), 0 0 40px rgba(196,181,253,0.2); 
          }
          50% { 
            box-shadow: 0 0 30px rgba(196,181,253,0.4), 0 0 60px rgba(196,181,253,0.3); 
          }
        }
        
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-explode-particle {
          animation: explode-particle linear forwards;
        }
        
        .animate-float-pixel {
          animation: float-pixel linear infinite;
        }
        
        .animate-bounce-pixel {
          animation: bounce-pixel 1.8s ease-in-out infinite;
        }
        
        .animate-fade-slide {
          animation: fade-slide 3s ease-in-out;
        }
        
        .animate-glow {
          animation: glow 3s ease-in-out infinite;
        }
        
        .animate-shine {
          animation: shine 2.5s ease-in-out infinite;
        }
        
        .animate-pulse-subtle {
          animation: pulse-subtle 2.5s ease-in-out infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;