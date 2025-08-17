// src/pages/UserProfile.jsx
import React, { useState, useEffect } from 'react';
import {Heart, ShoppingCart, User, Gift, LogOut, Lock}
from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import '../components/styles/UserProfile.css';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ui/ToastContainer';

import PersonalDataSection from '../components/profile/PersonalDataSection';
import OrdersSection       from '../components/profile/OrdersSection';
import FavoritesSection    from '../components/profile/FavoritesSection';
import PasswordSection     from '../components/profile/PasswordSection';
import UserSection         from '../components/profile/UserSection';

const API_URL = import.meta.env.VITE_API_URL || '';

const UserProfile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toasts, showSuccess, showError, removeToast } = useToast();

  useEffect(() => {
  }, [user]);

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

  const [activeSection, setActiveSection] = useState('personal');

  // Detectar si viene de otra página con una sección específica
  useEffect(() => {
    if (location.state?.activeSection) {
      setActiveSection(location.state.activeSection);
      // Limpiar el estado para que no persista en futuras navegaciones
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  // --- Estado para cotizaciones ---
  const [quotes, setQuotes] = useState([]);
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [errorQuotes, setErrorQuotes] = useState('');

  // --- Bandera para mostrar puntito rojo ---
  const [hasQuotesFlag, setHasQuotesFlag] = useState(false);

  // --- Estado para mostrar modal de confirmación de logout ---
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Carga inicial: revisa si hay cotizaciones con status "quoted"
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await fetch(`${API_URL}/api/custom-orders/me`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data.some(o => o.status === 'quoted')) {
          setHasQuotesFlag(true);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchAll();
  }, []);

  // Carga las cotizaciones cuando el usuario entra en esa sección
  useEffect(() => {
    if (activeSection === 'quotes') {
      setLoadingQuotes(true);
      setErrorQuotes('');
      fetch(`${API_URL}/api/custom-orders/me`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
        .then(res => {
          if (!res.ok) throw new Error(`Status ${res.status}`);
          return res.json();
        })
        .then(data => {
          // solo las cotizadas
          const quoted = data.filter(o => o.status === 'quoted');
          setQuotes(quoted);
          // si ya no quedan nuevas, quita el puntito
          if (quoted.length === 0) {
            setHasQuotesFlag(false);
          }
        })
        .catch(err => setErrorQuotes(err.message))
        .finally(() => setLoadingQuotes(false));
    }
  }, [activeSection]);

  const handleDecision = (orderId, decision) => {
    fetch(`${API_URL}/api/custom-orders/${orderId}/respond`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ decision })
    })
      .then(res => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then(() => {
        // refresca la lista y quita el puntito si ya no quedan
        setQuotes(q => {
          const remaining = q.filter(o => o._id !== orderId);
          if (remaining.length === 0) setHasQuotesFlag(false);
          return remaining;
        });
        showSuccess(decision === 'accept' ? 'Cotización aceptada' : 'Cotización rechazada');
      })
      .catch(err => {
        console.error('Error:', err);
                  showError('Error al procesar la decisión');
      });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
            showSuccess('Sesión cerrada correctamente');
  };

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
              <div className="header-actions">
                <div className="quotes-filter">
                  <button className="filter-btn active">Completadas</button>
                  <button className="filter-btn">Pendientes</button>
                </div>
              </div>
            </div>

            {loadingQuotes && (
              <div className="loading-state">
                <p>Cargando cotizaciones...</p>
              </div>
            )}
            
            {errorQuotes && (
              <div className="error-state">
                <p className="error-message">{errorQuotes}</p>
              </div>
            )}
            
            {!loadingQuotes && quotes.length === 0 && (
              <div className="empty-state">
                <Gift size={48} className="empty-icon" />
                <p>No tienes cotizaciones nuevas.</p>
              </div>
            )}

            <div className="quotes-list">
              {quotes.map(quote => (
                <div key={quote._id} className="quote-card">
                  <div className="quote-image">
                    <img 
                      src={quote.imageUrl || '/api/placeholder/80/80'} 
                      alt={quote.modelType}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="quote-placeholder" style={{display: 'none'}}>
                      <Gift size={24} />
                    </div>
                  </div>
                  <div className="quote-details">
                    <h4 className="quote-title">{quote.modelType}</h4>
                    <p className="quote-description">{quote.description}</p>
                    <div className="quote-price-row">
                      <span className="quote-price">${quote.price?.toFixed(2) || '0.00'}</span>
                      <div className="quote-actions">
                        <button
                          className="btn-quote accept"
                          onClick={() => handleDecision(quote._id, 'accept')}
                        >
                          VER DETALLES
                        </button>
                        <button
                          className="btn-quote reject"
                          onClick={() => handleDecision(quote._id, 'reject')}
                        >
                          YA ORDENAR
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
    <div className="user-profile-container">
      <div className="profile-layout">
        {/* Sidebar */}
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
                className={`nav-btn logout-btn`}
              >
                <LogOut className="nav-icon" />
                <span>Cerrar Sesión</span>
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="profile-content">
          <div className="content-wrapper">
            {renderSection()}
          </div>
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