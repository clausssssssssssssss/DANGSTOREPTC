// src/pages/UserProfile.jsx
import React, { useState, useEffect } from 'react';
import { Heart, ShoppingCart, User, Gift, LogOut, Lock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';
import { useNavigate, useLocation } from 'react-router-dom';
import '../components/styles/UserProfile.css';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ui/ToastContainer';

import PersonalDataSection from '../components/profile/PersonalDataSection';
import OrdersSection from '../components/profile/OrdersSection';
import FavoritesSection from '../components/profile/FavoritesSection';
import PasswordSection from '../components/profile/PasswordSection';
import UserSection from '../components/profile/UserSection';
import QuotesSection from '../components/profile/QuotesSection';

const UserProfile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toasts, showSuccess, showError, removeToast } = useToast();

  const [activeSection, setActiveSection] = useState('personal');
  const [hasQuotesFlag, setHasQuotesFlag] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Detectar si viene de otra página con sección específica
  useEffect(() => {
    if (location.state?.activeSection) {
      setActiveSection(location.state.activeSection);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
    showSuccess('Sesión cerrada correctamente');
  };

  if (!user) {
    return (
      <div className="not-authenticated-message">
        <div className="auth-container">
          <User className="auth-icon" size={80} />
          <h2>Necesitas iniciar sesión</h2>
          <p>Debes iniciar sesión para acceder a tu perfil y ver toda tu información personal.</p>
          <div className="auth-buttons">
            <button onClick={() => navigate('/auth/login')} className="login-button primary">
              Iniciar Sesión
            </button>
            <button onClick={() => navigate('/')} className="login-button secondary">
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
        return <PersonalDataSection />;
      case 'orders':
        return <OrdersSection />;
      case 'favorites':
        return <FavoritesSection />;
      case 'password':
        return <PasswordSection />;
      case 'quotes':
        return (
          <div className="content-card">
            <div className="card-header">
              <div className="card-title">
                <Gift className="section-icon" />
                <h3>Mis cotizaciones</h3>
              </div>
            </div>

            <QuotesSection setHasQuotesFlag={setHasQuotesFlag} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="user-profile-container">
      <div className="profile-layout">
        <aside className="profile-sidebar">
          <div className="sidebar-content">
            <UserSection />
            <nav className="profile-navigation">
              <button
                onClick={() => setActiveSection('personal')}
                className={`nav-btn ${activeSection === 'personal' ? 'active' : ''}`}
              >
                <User className="nav-icon" />
                <span>Mis datos</span>
              </button>

              <button
                onClick={() => setActiveSection('orders')}
                className={`nav-btn ${activeSection === 'orders' ? 'active' : ''}`}
              >
                <ShoppingCart className="nav-icon" />
                <span>Mis pedidos</span>
              </button>

              <button
                onClick={() => setActiveSection('favorites')}
                className={`nav-btn ${activeSection === 'favorites' ? 'active' : ''}`}
              >
                <Heart className="nav-icon" />
                <span>Favoritos</span>
              </button>

              <button
                onClick={() => setActiveSection('password')}
                className={`nav-btn ${activeSection === 'password' ? 'active' : ''}`}
              >
                <Lock className="nav-icon" />
                <span>Contraseña</span>
              </button>

              <button
                onClick={() => setActiveSection('quotes')}
                className={`nav-btn ${activeSection === 'quotes' ? 'active' : ''}`}
              >
                <Gift className="nav-icon" />
                <span>Cotizaciones</span>
                {hasQuotesFlag && <span className="notification-dot" />}
              </button>

              <button
                onClick={() => setShowLogoutModal(true)}
                className="nav-btn logout-btn"
              >
                <LogOut className="nav-icon" />
                <span>Cerrar Sesión</span>
              </button>
            </nav>
          </div>
        </aside>

        <main className="profile-content">
          <div className="content-wrapper">{renderSection()}</div>
        </main>
      </div>

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
                <button className="btn-modal confirm" onClick={handleLogout}>
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
