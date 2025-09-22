import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import "../components/styles/AuthApp.css";  
import logoIcon from "../assets/DANGSTORELOGOPRUEBA.PNG";
import fondoDangStore from "../assets/FondoDangStore.jpg";

// ——— imports para el login y contexto ———
import { useAuth, parseJwt } from '../hooks/useAuth.jsx';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ui/ToastContainer';
import SplashScreen from '../components/SplashScreen';

// URL del servidor
const API_URL = "http://192.168.0.9:4000/api";

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

  // Cargar credenciales guardadas al iniciar
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const storedCredentials = localStorage.getItem('savedCredentials');
        if (storedCredentials) {
          const credentials = JSON.parse(storedCredentials);
          setSavedCredentials(credentials);
          setLoginData({
            email: credentials.email,
            password: ''
          });
          setRememberMe(true);
        }
      } catch (error) {
        console.error('Error loading stored credentials:', error);
      }
    };

    loadStoredData();
  }, []);

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

  // ——— FUNCIÓN DE LOGIN MODIFICADA PARA MOSTRAR SPLASH ———
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
        
        // Guardar credenciales si "Recordarme" está activado
        if (rememberMe) {
          localStorage.setItem('savedCredentials', JSON.stringify({ email }));
        } else {
          localStorage.removeItem('savedCredentials');
        }
        
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
        errorMessage = data.message; // Mantener mensaje de cuenta bloqueada
      } else if (data.message && data.message.includes('bloqueado')) {
        errorMessage = data.message; // Mantener mensaje de usuario bloqueado
      } else if (data.message) {
        // Si hay un mensaje del servidor, usarlo
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

  // Resto del código (handleRegister, handleForgotPassword, etc.) se mantiene igual
  // [El resto de las funciones permanecen sin cambios]

  // ——— RENDERIZAR EL SPLASH SCREEN FUERA DE TODOS LOS CONTENEDORES ———
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

  };

  // ——— RENDERIZADO PRINCIPAL ———
  return (
    <>
      <div 
        className="auth-container"
        style={{
          backgroundImage: `url(${fondoDangStore})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      >
        {renderAuthContent()}
      </div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
};

export default AuthApp;