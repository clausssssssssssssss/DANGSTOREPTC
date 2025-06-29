import React, { useState, useEffect, useRef } from 'react'; 
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './AuthApp.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const AuthApp = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('login');
  
  // Estados para Login
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

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
  const lastTriedCode = useRef(''); // ← guarda el último código verificado

  // Estados para Nueva Contraseña
  const [newPasswordData, setNewPasswordData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Funciones de navegación
  const handleNavigate = (view) => {
    setCurrentView(view);
  };

  // Funciones de manejo de Login
  const handleLogin = async () => {
  const { email, password } = loginData;
  if (!email || !password) {
    alert('Por favor completa todos los campos');
    return;
  }
  try {
    const res = await fetch(`${API_URL}/api/customers/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.message || 'Error en el login');
    } else {
      // guardamos token y notificamos
    localStorage.setItem('token', data.token);
    navigate('/catalogo', { replace: true });    
    }
  } catch (err) {
    console.error(err);
    alert('Error de conexión');
  }
};

  // Funciones de manejo de Registro
const handleRegister = async () => {
  const { nombre, email, telefono, password } = registerData;
  if (!nombre || !email || !telefono || !password) {
    alert('Por favor completa todos los campos');
    return;
  }
  try {
    const res = await fetch(`${API_URL}/api/customers`, {
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
      alert(data.message || 'Error en el registro');
    } else {
      alert('Registro exitoso!');
       // tras registrar por primera vez, vamos a “Acerca”
      navigate('/acerca', { replace: true });
    }
  } catch (err) {
    console.error(err);
    alert('Error de conexión');
  }
};

  // Funciones de recuperación de contraseña
  // paso 1: envío del código
const handleForgotPassword = async () => {
  if (!forgotEmail) {
    alert("Por favor ingresa tu correo electrónico");
    return;
  }
  const res = await fetch(`${API_URL}/api/password-recovery/send-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: forgotEmail }),
  });
  const data = await res.json();
  if (!res.ok) {
    alert(data.message || "Error enviando código");
    return;
  }
  setIsEmailSubmitted(true);
  setTimeout(() => setCurrentView("verification"), 1500);
};




  // Funciones de código de verificación
  const handleCodeChange = (idx, val) => {
    if (val.length > 1) return;
    const copy = [...verificationCode];
    copy[idx] = val;
    setVerificationCode(copy);
    if (val && idx < 3) {
      document.getElementById(`code-${idx+1}`)?.focus();
    }
  };

  useEffect(() => {
    if (
      currentView === 'verification' &&
      verificationCode.every(digit => digit !== '')
    ) {
      handleVerifyCode();
    }
  }, [verificationCode, currentView]);


  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

const handleVerifyCode = async () => {
    const code = verificationCode.join("");
    if (code.length !== 4) {
      alert("Por favor ingresa el código completo");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/password-recovery/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, code })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Código inválido");
      } else {
        setCurrentView("reset-password");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión");
    }
  };

  const handleResendCode = () => {
    setIsResending(true);
    setTimeout(() => {
      setIsResending(false);
      console.log('Code resent');
    }, 2000);
  };

  const handleResetPassword = async () => {
  const code = verificationCode.join("");
  const { password, confirmPassword } = newPasswordData;

  if (!password || !confirmPassword) {
    alert("Por favor completa todos los campos");
    return;
  }
  if (password !== confirmPassword) {
    alert("Las contraseñas no coinciden");
    return;
  }
  if (password.length < 6) {
    alert("La contraseña debe tener al menos 6 caracteres");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/api/password-recovery/reset`, {
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
      alert(data.message || "Error al cambiar contraseña");
      return;
    }
    alert("Contraseña restablecida exitosamente");
    setCurrentView("login");
  } catch (err) {
    console.error(err);
    alert("Error de conexión");
  }
};

  // Validaciones para nueva contraseña
  const isPasswordValid = newPasswordData.password.length >= 6;
  const doPasswordsMatch = newPasswordData.password === newPasswordData.confirmPassword && newPasswordData.confirmPassword !== '';

  // Función para formatear número de teléfono
  const formatPhoneNumber = (value) => {
    // Eliminar todos los caracteres que no sean dígitos
    const phoneNumber = value.replace(/\D/g, '');
    
    // Limitar a 8 dígitos máximo
    if (phoneNumber.length <= 8) {
      // Formatear como XXXX-XXXX
      if (phoneNumber.length > 4) {
        return phoneNumber.slice(0, 4) + '-' + phoneNumber.slice(4);
      }
      return phoneNumber;
    }
    return phoneNumber.slice(0, 8);
  };

  // Función para manejar cambio en teléfono
  const handlePhoneChange = (e) => {
    const formattedPhone = formatPhoneNumber(e.target.value);
    setRegisterData({...registerData, telefono: formattedPhone});
  };

  // Componente de elementos decorativos
  const DecorativeElements = () => (
    <div className="decorative-elements">
      <div className="decorative-circle"></div>
      <div className="decorative-circle"></div>
      <div className="decorative-circle"></div>
    </div>
  );

  // Componente de Logo
  const Logo = () => (
    <div className="auth-logo">
      <div className="logo-container">
        <span className="logo-text">C</span>
      </div>
    </div>
  );

  // Vista de Login
  if (currentView === 'login') {
    return (
      <div className="auth-container">
        <DecorativeElements />
        
        <div className="auth-card">
          <Logo />
          
          <h1 className="auth-title">Iniciar sesión</h1>
          <p className="auth-subtitle">Ingresa tus credenciales para acceder a tu cuenta</p>
          
          <div className="auth-form">
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
                  {showLoginPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            <div className="remember-forgot">
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
              onClick={handleLogin}
              className="auth-button"
            >
              Iniciar Sesión
            </button>
          </div>
          
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
      </div>
    );
  }

  // Vista de Registro
  if (currentView === 'register') {
    return (
      <div className="auth-container">
        <DecorativeElements />
        
        <div className="auth-card">
          <Logo />
          
          <h1 className="auth-title">REGISTRO</h1>
          <p className="auth-subtitle">Regístrate para comenzar a utilizar nuestra plataforma</p>
          
          <div className="auth-form">
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
                  {showRegisterPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            <button
              onClick={handleRegister}
              className="auth-button"
            >
              Registrarse
            </button>
          </div>
          
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
      </div>
    );
  }

  // Vista de Recuperar Contraseña - Paso 1
  if (currentView === 'forgot-password') {
    return (
      <div className="auth-container">
        <DecorativeElements />
        
        <div className="auth-card">
          <Logo />
          
          <h1 className="auth-title">Recuperar Contraseña</h1>
          
          {!isEmailSubmitted ? (
            <div className="auth-form">
              <div className="input-group">
                <label className="input-label">Correo electrónico:</label>
                <div className="input-with-icon">
                  <span className="input-icon"></span>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="auth-input"
                    placeholder="Ingresa tu correo"
                  />
                </div>
              </div>
              
              <button
                onClick={handleForgotPassword}
                className="auth-button"
              >
                Enviar código
              </button>
            </div>
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
      </div>
    );
  }

  // Vista de Código de Verificación
  if (currentView === 'verification') {
  return (
    <div className="auth-container">
      {/* …decoración y logo… */}
      <div className="auth-card">
        <h1 className="auth-title">Código de verificación</h1>
        <div className="verification-inputs">
          {verificationCode.map((digit, idx) => (
            <input
              key={idx}
              id={`code-${idx}`}
              type="text"
              value={digit}
              maxLength={1}
              onChange={e => handleCodeChange(idx, e.target.value)}
              onKeyDown={e => handleKeyDown(idx, e)}
              className="verification-input"
            />
          ))}
        </div>
        <button
          onClick={handleVerifyCode}
          disabled={verificationCode.join('').length !== 4}
          className="auth-button"
        >
          Verificar código
        </button>
      </div>
    </div>
  )
}
  // Vista de Nueva Contraseña
  if (currentView === 'reset-password') {
    return (
      <div className="auth-container">
        <DecorativeElements />
        
        <div className="auth-card">
          <Logo />
          
          <h1 className="auth-title">Nueva Contraseña</h1>
          <p className="auth-subtitle">Por favor ingresa y confirma tu nueva contraseña</p>
          
          <div className="auth-form">
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
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {newPasswordData.confirmPassword && !doPasswordsMatch && (
                <p className="error-message">Las contraseñas no coinciden</p>
              )}
              {newPasswordData.confirmPassword && doPasswordsMatch && (
                <p className="success-message">Las contraseñas coinciden ✓</p>
              )}
            </div>
            
            <button
              onClick={handleResetPassword}
              disabled={!isPasswordValid || !doPasswordsMatch}
              className="auth-button"
            >
              Restaurar contraseña
            </button>
          </div>
          
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
      </div>
    );
  }

  // Fallback por defecto
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div style={{textAlign: 'center', color: '#1f2937'}}>
          <h1 className="auth-title">Vista no encontrada</h1>
          <button
            onClick={() => handleNavigate('login')}
            className="auth-button"
            style={{marginTop: '1rem'}}
          >
            Ir al Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthApp;