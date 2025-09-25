import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import "../components/styles/AuthApp.css";
import "../components/styles/PixelDecorations.css";
import logoIcon from "../assets/DANGSTORELOGOPRUEBA.PNG";

// ——— imports para el login y contexto ———
import { useAuth, parseJwt } from '../hooks/useAuth.jsx';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ui/ToastContainer';
import SplashScreen from '../components/SplashScreen';

// URL del servidor local para desarrollo // agregue el link de railway 
const API_URL = 'https://dangstoreptc-production.up.railway.app/api';

const AuthApp = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();                
  const { toasts, showSuccess, showError, showInfo, removeToast } = useToast();
  const [currentView, setCurrentView] = useState('login');
  
  // ——— ESTADOS PARA EL SPLASH SCREEN ———
  const [showSplash, setShowSplash] = useState(false);
  const [userData, setUserData] = useState(null);
  
  // Estados para Login
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savedCredentials, setSavedCredentials] = useState(null);

  // Estados para Registro
  const [registerData, setRegisterData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    password: ''
  });
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  // Estados para Recuperar Contraseña
  const [forgotEmail, setForgotEmail] = useState('');
  const [isEmailSubmitted, setIsEmailSubmitted] = useState(false);

  // Estados para Código de Verificación
  const [verificationCode, setVerificationCode] = useState(['', '', '', '']);
  const lastTriedCode = useRef('');

  // Estados para Nueva Contraseña
  const [newPasswordData, setNewPasswordData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Estado para reenvío de código
  const [isResending, setIsResending] = useState(false);

  // ——— FUNCIÓN PARA MANEJAR CUANDO EL SPLASH TERMINA ———
  const handleSplashComplete = () => {
    setShowSplash(false);
    navigate('/catalogo', { replace: true });
  };

  // Funciones de navegación
  const handleNavigate = (view) => {
    setCurrentView(view);
    
    // Limpiar código de verificación cuando se navega a otra vista
    if (view !== 'verification' && view !== 'reset-password') {
      setVerificationCode(['', '', '', '']);
    }
    
    // Limpiar datos de nueva contraseña cuando se sale de reset-password
    if (view !== 'reset-password') {
      setNewPasswordData({ password: '', confirmPassword: '' });
    }
  };

  // ——— FUNCIÓN DE LOGIN ———
  const handleLogin = async () => {
    const { email, password } = loginData;
    if (!email || !password) {
      showError('Por favor completa todos los campos');
      return;
    }
    
    setLoading(true);
    
    try {
      const res = await fetch(`${API_URL}/customers/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      // Verificar si hay un token (login exitoso)
      if (data.token) {
        console.log('🔑 Login successful, token:', data.token);
        localStorage.setItem('token', data.token);
        const decoded = parseJwt(data.token);
        const user = { id: decoded.userId ?? decoded.id, name: decoded.name };
        
        setUser(user);
        console.log('👤 User set in context:', user);
        
        // ——— GUARDAR DATOS DEL USUARIO Y MOSTRAR SPLASH ———
        setUserData({
          name: decoded.name,
          email: email,
          id: decoded.userId ?? decoded.id
        });
        
        showSuccess('¡Inicio de sesión exitoso!');
        
        // Mostrar splash screen en lugar de navegar directamente
        setShowSplash(true);
        
        return;
      }
      
      // Si no hay token, es un error de credenciales
      let errorMessage = 'Credenciales incorrectas';
      if (data.message === 'Email no registrado') {
        errorMessage = 'Esta cuenta no está registrada';
      } else if (data.message === 'Invalid password' || data.message === 'Contraseña incorrecta') {
        errorMessage = 'Contraseña incorrecta';
      } else if (data.message && data.message.includes('bloqueada')) {
        errorMessage = data.message;
      } else if (data.message && data.message.includes('bloqueado')) {
        errorMessage = data.message;
      } else if (data.message) {
        errorMessage = data.message;
      }
      
      showError(errorMessage);
    } catch (err) {
      console.error('Error de red:', err);
      showError('Error de conexión. Verifica tu conexión a internet.');
    } finally {
      setLoading(false);
    }
  };

  // ——— FUNCIÓN DE REGISTRO (CON ENDPOINT CORRECTO) ———
  const handleRegister = async () => {
    const { nombre, email, telefono, password } = registerData;
    if (!nombre || !email || !telefono || !password) {
      showError('Por favor completa todos los campos');
      return;
    }
    
    setLoading(true);
    
    try {
      const res = await fetch(`${API_URL}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nombre,
          email,
          telephone: telefono,
          password
        })
      });
      const data = await res.json();
      
      if (!res.ok) {
        showError(data.message || 'Error en el registro');
      } else {
        showSuccess('¡Registro exitoso!');
        setCurrentView('login');
        setRegisterData({ nombre: '', email: '', telefono: '', password: '' });
      }
    } catch (err) {
      console.error('Error de red:', err);
      showError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // ——— FUNCIÓN PARA RECUPERAR CONTRASEÑA (CON ENDPOINTS CORRECTOS) ———
  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      showError("Por favor ingresa tu correo electrónico");
      return;
    }
    
    setLoading(true);
    
    try {
      const res = await fetch(`${API_URL}/password-recovery/send-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        showError(data.message || "Error enviando código");
        return;
      }
      
      showSuccess("Código enviado exitosamente a tu correo");
      setIsEmailSubmitted(true);
      setTimeout(() => setCurrentView("verification"), 1500);
    } catch (err) {
      console.error('Error de conexión:', err);
      showError("Error de conexión al enviar código");
    } finally {
      setLoading(false);
    }
  };

  // ——— FUNCIÓN PARA MANEJAR CAMBIO EN CÓDIGO DE VERIFICACIÓN ———
  const handleCodeChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
    
    // Auto-enfocar siguiente input
    if (value && index < 3) {
      document.getElementById(`verification-input-${index + 1}`)?.focus();
    }
  };

  // ——— FUNCIÓN PARA MANEJAR TECLAS EN CÓDIGO DE VERIFICACIÓN ———
  const handleCodeKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      document.getElementById(`verification-input-${index - 1}`)?.focus();
    }
  };

  // ——— FUNCIÓN PARA VERIFICAR CÓDIGO ———
  const handleVerifyCode = async () => {
    const code = verificationCode.join("");
    if (code.length !== 4) {
      showError("Por favor ingresa el código completo");
      return;
    }
    
    setLoading(true);
    
    try {
      const res = await fetch(`${API_URL}/password-recovery/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, code })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        showError(data.message || "Código inválido");
      } else {
        showSuccess("Código verificado correctamente");
        setCurrentView("reset-password");
      }
    } catch (err) {
      console.error('Error de conexión:', err);
      showError("Error de conexión al verificar código");
    } finally {
      setLoading(false);
    }
  };

  // ——— EFECTO PARA AUTO-VERIFICAR CUANDO SE COMPLETA EL CÓDIGO ———
  useEffect(() => {
    if (currentView === 'verification' && verificationCode.every(digit => digit !== '')) {
      handleVerifyCode();
    }
  }, [verificationCode, currentView]);

  // ——— FUNCIÓN PARA REENVIAR CÓDIGO ———
  const handleResendCode = async () => {
    if (!forgotEmail) {
      showError('No hay correo especificado');
      return;
    }
    
    setIsResending(true);
    
    try {
      const res = await fetch(`${API_URL}/password-recovery/send-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        showError(data.message || "Error al reenviar código");
      } else {
        showInfo("Código reenviado correctamente");
      }
    } catch (err) {
      console.error('Error de conexión:', err);
      showError("Error de conexión al reenviar código");
    } finally {
      setIsResending(false);
    }
  };

  // ——— FUNCIÓN PARA RESTABLECER CONTRASEÑA ———
  const handleResetPassword = async () => {
    const code = verificationCode.join("");
    const { password, confirmPassword } = newPasswordData;

    if (!password || !confirmPassword) {
      showError("Por favor completa todos los campos");
      return;
    }
    
    if (password !== confirmPassword) {
      showError("Las contraseñas no coinciden");
      return;
    }
    
    if (password.length < 6) {
      showError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    
    try {
      const res = await fetch(`${API_URL}/password-recovery/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail,       
          code,
          newPassword: password,
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        showError(data.message || "Error al cambiar contraseña");
        return;
      }
      
      showSuccess("Contraseña restablecida exitosamente");
      setCurrentView("login");
      setNewPasswordData({ password: '', confirmPassword: '' });
      setForgotEmail('');
    } catch (err) {
      console.error('Error de conexión:', err);
      showError("Error de conexión al restablecer contraseña");
    } finally {
      setLoading(false);
    }
  };

  // Validaciones para nueva contraseña
  const isPasswordValid = newPasswordData.password.length >= 6;
  const doPasswordsMatch = newPasswordData.password === newPasswordData.confirmPassword && newPasswordData.confirmPassword !== '';

  // ——— FUNCIÓN PARA FORMATEAR NÚMERO DE TELÉFONO ———
  const formatPhoneNumber = (value) => {
    const phoneNumber = value.replace(/\D/g, '');
    if (phoneNumber.length <= 8) {
      if (phoneNumber.length > 4) {
        return phoneNumber.slice(0, 4) + '-' + phoneNumber.slice(4);
      }
      return phoneNumber;
    }
    return phoneNumber.slice(0, 8);
  };

  // ——— FUNCIÓN PARA MANEJAR CAMBIO EN TELÉFONO ———
  const handlePhoneChange = (e) => {
    const formattedPhone = formatPhoneNumber(e.target.value);
    setRegisterData({...registerData, telefono: formattedPhone});
  };

  // ——— EFECTO PARA CARGAR CREDENCIALES GUARDADAS ———
  useEffect(() => {
    const saved = localStorage.getItem('savedCredentials');
    if (saved) {
      const credentials = JSON.parse(saved);
      setLoginData(credentials);
      setRememberMe(true);
      setSavedCredentials(credentials);
    }
  }, []);

  // ——— EFECTO PARA GUARDAR CREDENCIALES CUANDO RECUERDAME ESTÁ ACTIVADO ———
  useEffect(() => {
    if (rememberMe && loginData.email && loginData.password) {
      localStorage.setItem('savedCredentials', JSON.stringify(loginData));
    } else if (!rememberMe) {
      localStorage.removeItem('savedCredentials');
    }
  }, [rememberMe, loginData]);

  // ——— COMPONENTE LOGO ———
  const Logo = () => (
    <div className="auth-logo">
      <div className="logo-container">
        <img src={logoIcon} alt="DangStore Logo" className="logo-image" />
      </div>
    </div>
  );

 // ——— COMPONENTE FONDO PIXELADO COMPACTO ———
const PixelBackground = () => (
  <>
    <div className="pixel-grid"></div>
    {/* Píxeles flotantes reducidos */}
    {Array.from({ length: 8 }).map((_, i) => (
      <div
        key={`pixel-${i}`}
        className="pixel-float pixel-decoration"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${-Math.random() * 8}s`
        }}
      ></div>
    ))}
    {/* Hama beads reducidos */}
    {Array.from({ length: 5 }).map((_, i) => (
      <div
        key={`hama-${i}`}
        className="hama-bead pixel-decoration"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${-Math.random() * 6}s`
        }}
      ></div>
    ))}
  </>
);

  // ——— RENDERIZAR EL SPLASH SCREEN ———
  if (showSplash) {
    return (
      <SplashScreen 
        onComplete={handleSplashComplete}
        userInfo={userData}
        duration={5000}
        logoSrc={logoIcon}
      />
    );
  }

  // ——— FUNCIÓN PARA RENDERIZAR EL CONTENIDO DE AUTENTICACIÓN ———
  const renderAuthContent = () => {
    // Vista de Login
    if (currentView === 'login') {
      return (
        <div className="auth-card compact">
          <Logo />
          
          <h1 className="auth-title">Iniciar sesión</h1>
          <p className="auth-subtitle">Ingresa tus credenciales para acceder a tu cuenta</p>
          
          <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
            <div className="input-group">
              <label className="input-label">Correo electrónico</label>
              <input
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                className="auth-input"
                placeholder="Ingresa tu correo"
              />
            </div>
            
            <div className="input-group">
              <label className="input-label">Contraseña</label>
              <div className="password-input">
                <input
                  type={showLoginPassword ? "text" : "password"}
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  className="auth-input"
                  placeholder="Ingresa tu contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="password-toggle"
                >
                  {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <div className="remember-forgot-row">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="auth-checkbox"
                />
                <span className="checkbox-label">Recordarme</span>
              </label>
              <button
                type="button"
                onClick={() => handleNavigate('forgot-password')}
                className="forgot-link"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            
            <button
              type="button"
              onClick={handleLogin}
              className="auth-button login-button"
              disabled={loading}
            >
              {loading ? 'Cargando...' : 'Iniciar Sesión'}
            </button>
          </form>
          
          <div className="auth-link-section">
            <span>¿No tienes una cuenta? </span>
            <button 
              onClick={() => handleNavigate('register')}
              className="auth-link"
            >
              Regístrate
            </button>
          </div>
        </div>
      );
    }

    // Vista de Registro
    if (currentView === 'register') {
      return (
        <div className="auth-card compact">
          <Logo />
          
          <h1 className="auth-title">REGISTRO</h1>
          <p className="auth-subtitle">Regístrate para comenzar a utilizar nuestra plataforma</p>
          
          <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
            <div className="input-group">
              <label className="input-label">Nombre</label>
              <input
                type="text"
                value={registerData.nombre}
                onChange={(e) => setRegisterData({...registerData, nombre: e.target.value})}
                className="auth-input"
                placeholder="Ingresa tu nombre"
              />
            </div>
            
            <div className="input-group">
              <label className="input-label">Correo electrónico</label>
              <input
                type="email"
                value={registerData.email}
                onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                className="auth-input"
                placeholder="Ingresa tu correo"
              />
            </div>
            
            <div className="input-group">
              <label className="input-label">Teléfono</label>
              <input
                type="tel"
                value={registerData.telefono}
                onChange={handlePhoneChange}
                className="auth-input"
                placeholder="XXXX-XXXX"
                maxLength={9}
              />
            </div>
            
            <div className="input-group">
              <label className="input-label">Contraseña</label>
              <div className="password-input">
                <input
                  type={showRegisterPassword ? "text" : "password"}
                  value={registerData.password}
                  onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                  className="auth-input"
                  placeholder="Ingresa tu contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                  className="password-toggle"
                >
                  {showRegisterPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleRegister}
              className="auth-button login-button"
              disabled={loading}
            >
              {loading ? 'Cargando...' : 'Registrarse'}
            </button>
          </form>
          
          <div className="auth-link-section">
            <span>¿Ya tienes una cuenta? </span>
            <button 
              onClick={() => handleNavigate('login')}
              className="auth-link"
            >
              Inicia Sesión
            </button>
          </div>
        </div>
      );
    }

    // Vista de Recuperar Contraseña - Paso 1
    if (currentView === 'forgot-password') {
      return (
        <div className="auth-card compact">
          <Logo />
          
          <h1 className="auth-title">Recuperar Contraseña</h1>
          
          {!isEmailSubmitted ? (
            <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
              <div className="input-group">
                <label className="input-label">Correo electrónico:</label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="auth-input"
                  placeholder="Ingresa tu correo"
                />
              </div>
              
              <button
                type="button"
                onClick={handleForgotPassword}
                className="auth-button login-button"
                disabled={loading}
              >
                {loading ? 'Enviando...' : 'Enviar código'}
              </button>
            </form>
          ) : (
            <div className="success-state">
              <div className="success-icon">
                <span>✓</span>
              </div>
              <p className="auth-subtitle">
                Hemos enviado un código de verificación a tu correo electrónico.
              </p>
              <div className="loading-spinner"></div>
              <p style={{fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem'}}>Redirigiendo...</p>
            </div>
          )}
          
          <div className="auth-link-section">
            <button 
              onClick={() => handleNavigate('login')}
              className="back-button"
            >
              <ArrowLeft size={16} className="back-icon" />
              Regresar al Login
            </button>
          </div>
        </div>
      );
    }

    // Vista de Código de Verificación
    if (currentView === 'verification') {
      return (
        <div className="auth-card compact">
          <Logo />
          <h1 className="auth-title">Código de verificación</h1>
          <p className="auth-subtitle">Ingresa el código que recibiste en tu correo</p>
          
          <div className="verification-inputs">
            {verificationCode.map((digit, idx) => (
              <input
                key={idx}
                id={`verification-input-${idx}`}
                type="text"
                value={digit}
                maxLength={1}
                onChange={e => handleCodeChange(idx, e.target.value)}
                onKeyDown={e => handleCodeKeyDown(idx, e)}
                className="verification-input"
              />
            ))}
          </div>
          
          <button
            onClick={handleVerifyCode}
            disabled={verificationCode.join('').length !== 4 || loading}
            className="auth-button login-button"
          >
            {loading ? 'Verificando...' : 'Verificar código'}
          </button>
          
          <div className="auth-link-section">
            <button 
              onClick={handleResendCode}
              disabled={isResending}
              className="auth-link"
            >
              {isResending ? 'Reenviando...' : 'Reenviar código'}
            </button>
          </div>
        </div>
      );
    }

    // Vista de Nueva Contraseña
    if (currentView === 'reset-password') {
      return (
        <div className="auth-card compact">
          <Logo />
          
          <h1 className="auth-title">Nueva Contraseña</h1>
          <p className="auth-subtitle">Por favor ingresa y confirma tu nueva contraseña</p>
          
          <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
            <div className="input-group">
              <label className="input-label">Nueva contraseña</label>
              <div className="password-input">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPasswordData.password}
                  onChange={(e) => setNewPasswordData({...newPasswordData, password: e.target.value})}
                  className={`auth-input ${newPasswordData.password && !isPasswordValid ? 'error' : ''}`}
                  placeholder="Ingresa tu nueva contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="password-toggle"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {newPasswordData.password && !isPasswordValid && (
                <p className="error-message">La contraseña debe tener al menos 6 caracteres</p>
              )}
            </div>
            
            <div className="input-group">
              <label className="input-label">Confirmar contraseña</label>
              <div className="password-input">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={newPasswordData.confirmPassword}
                  onChange={(e) => setNewPasswordData({...newPasswordData, confirmPassword: e.target.value})}
                  className={`auth-input ${newPasswordData.confirmPassword && !doPasswordsMatch ? 'error' : ''}`}
                  placeholder="Confirma tu nueva contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="password-toggle"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {newPasswordData.confirmPassword && !doPasswordsMatch && (
                <p className="error-message">Las contraseñas no coinciden</p>
              )}
            </div>
            
            <button
              type="button"
              onClick={handleResetPassword}
              disabled={!isPasswordValid || !doPasswordsMatch || loading}
              className="auth-button login-button"
            >
              {loading ? 'Restableciendo...' : 'Restaurar contraseña'}
            </button>
          </form>
          
          {/* Indicadores de seguridad de contraseña */}
          <div className="password-requirements">
            <p className="requirements-title">Requisitos de contraseña:</p>
            <div>
              <div className={`requirement-item ${isPasswordValid ? 'valid' : 'invalid'}`}>
                <span className="requirement-icon">{isPasswordValid ? '✓' : '○'}</span>
                Al menos 6 caracteres
              </div>
              <div className={`requirement-item ${doPasswordsMatch ? 'valid' : 'invalid'}`}>
                <span className="requirement-icon">{doPasswordsMatch ? '✓' : '○'}</span>
                Las contraseñas coinciden
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Fallback por defecto
    return (
      <div className="auth-card compact">
        <div style={{textAlign: 'center', color: '#1f2937'}}>
          <h1 className="auth-title">Vista no encontrada</h1>
          <button
            onClick={() => handleNavigate('login')}
            className="auth-button login-button"
            style={{marginTop: '1rem'}}
          >
            Ir al Login
          </button>
        </div>
      </div>
    );
  };

  // ——— RENDERIZADO PRINCIPAL ———
  return (
    <>
      <div className="auth-container">
        <PixelBackground />
        {renderAuthContent()}
      </div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
};
export default AuthApp;