// src/pages/UserProfile.jsx
import React, { useState, useEffect } from 'react';
import { Heart, ShoppingCart, User, Gift, LogOut, Lock, Menu, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import '../components/styles/UserProfile.css';
import '../components/styles/PixelDecorations.css';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ui/ToastContainer';

import PersonalDataSection from '../components/profile/PersonalDataSection';
import OrdersSection from '../components/profile/OrdersSection';
import FavoritesSection from '../components/profile/FavoritesSection';
import PasswordSection from '../components/profile/PasswordSection';
import UserSection from '../components/profile/UserSection';
import QuotesSection from '../components/profile/QuotesSection';

// URL del servidor en producción (Render)
const API_URL = 'https://dangstoreptc.onrender.com/api';

const UserProfile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toasts, showSuccess, showError, showWarning, removeToast } = useToast();
 
  const [activeSection, setActiveSection] = useState('personal');
  const [hasQuotesFlag, setHasQuotesFlag] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
 
  // Detectar si viene de otra página con una sección específica
  useEffect(() => {
    if (location.state?.activeSection) {
      setActiveSection(location.state.activeSection);
      // Limpiar el estado para que no persista en futuras navegaciones
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  // Carga inicial: revisa si hay cotizaciones con status "quoted"
  useEffect(() => {
    const fetchQuotesStatus = async () => {
      try {
        const res = await fetch(`${API_URL}/custom-orders/me`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (!res.ok) return;
        const response = await res.json();
        
        // La API devuelve { success: true, data: [...] }
        const data = response.data;
        
        // Verificar que data sea un array antes de usar .some()
        if (Array.isArray(data)) {
          // Solo mostrar notificación si hay cotizaciones pendientes de decisión
          if (data.some(o => o.status === 'quoted')) {
            setHasQuotesFlag(true);
          } else {
            setHasQuotesFlag(false);
          }
        } else {
          console.warn('API devolvió un objeto en lugar de un array:', data);
          setHasQuotesFlag(false);
        }
      } catch (err) {
        console.error('Error checking quotes status:', err);
      }
    };
    
    if (user) {
      fetchQuotesStatus();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
    showSuccess('Sesión cerrada correctamente');
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    setIsMobileMenuOpen(false); // Cerrar menú móvil al seleccionar una sección
  };

  if (!user) {
    return (
      <div className="not-authenticated-message">
        <div className="auth-container">
          <User className="auth-icon" size={80} />
          <h2>Necesitas iniciar sesión</h2>
          <p>Debes iniciar sesión para acceder a tu perfil y ver toda tu información personal.</p>
          <div className="auth-buttons">
            <button
              onClick={() => navigate('/auth/login')}
              className="login-button primary"
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => navigate('/')}
              className="login-button secondary"
            >
              Volver al Inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'personal':
        return (
          <PersonalDataSection 
            showSuccess={showSuccess}
            showError={showError}
          />
        );
      case 'orders':
        return <OrdersSection />;
      case 'favorites':
        return <FavoritesSection />;
      case 'password':
        return (
          <PasswordSection 
            showSuccess={showSuccess}
            showError={showError}
          />
        );
      case 'quotes':
        return (
          <QuotesSection 
            setHasQuotesFlag={setHasQuotesFlag}
            showSuccess={showSuccess}
            showError={showError}
            showWarning={showWarning}
          />
        );
      case 'customOrders':
        return (
          <div className="content-card">
            <div className="card-header">
              <div className="card-title">
                <ShoppingCart className="section-icon" />
                <h3>Encargos Personalizados</h3>
              </div>
            </div>
            <div className="empty-state">
              <ShoppingCart size={48} className="empty-icon" />
              <p>Gestiona tus encargos personalizados. Aquí aparecerán cuando los realices.</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="user-profile-container" style={{ position: 'relative' }}>
      {/* Mobile Header */}
      <div className="mobile-header">
        <button 
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <h2>Mi Perfil</h2>
        <div className="mobile-user-avatar">
          <User size={24} />
        </div>
      </div>

      <div className="profile-layout">
        {/* Sidebar */}
        <aside className={`profile-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <div className="sidebar-content">
            <UserSection />
            <nav className="profile-navigation">
              <button
                onClick={() => handleSectionChange('personal')}
                className={`nav-button ${activeSection === 'personal' ? 'active' : ''}`}
              >
                <User className="nav-icon" />
                <span>Mis datos</span>
              </button>
              
              <button
                onClick={() => handleSectionChange('orders')}
                className={`nav-button ${activeSection === 'orders' ? 'active' : ''}`}
              >
                <ShoppingCart className="nav-icon" />
                <span>Mis pedidos</span>
              </button>
              
              <button
                onClick={() => handleSectionChange('favorites')}
                className={`nav-button ${activeSection === 'favorites' ? 'active' : ''}`}
              >
                <Heart className="nav-icon" />
                <span>Favoritos</span>
              </button>
              
              <button
                onClick={() => handleSectionChange('password')}
                className={`nav-button ${activeSection === 'password' ? 'active' : ''}`}
              >
                <Lock className="nav-icon" />
                <span>Contraseña</span>
              </button>
              
              <button
                onClick={() => handleSectionChange('quotes')}
                className={`nav-button ${activeSection === 'quotes' ? 'active' : ''}`}
              >
                <div className="nav-content">
                  <Gift className="nav-icon" />
                  <span>Cotizaciones</span>
                </div>
                {hasQuotesFlag && <span className="notification-dot" />}
              </button>
              
              <button
                onClick={() => setShowLogoutModal(true)}
                className="nav-button logout-btn"
              >
                <LogOut className="nav-icon" />
                <span>Cerrar Sesión</span>
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="profile-main">
          {renderSection()}
        </main>
      </div>

      {/* Modal de confirmación de logout */}
      {showLogoutModal && (
        <div className="modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="logout-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <h3>¿Quieres salir de tu cuenta?</h3>
              <div className="modal-actions">
                <button 
                  className="btn-modal cancel"
                  onClick={() => setShowLogoutModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  className="btn-modal confirm"
                  onClick={handleLogout}
                >
                  Salir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default UserProfile;