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

<<<<<<< HEAD
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
  const [errorQuotes, setErrorQuotes] = useState(null);
  const [hasQuotesFlag, setHasQuotesFlag] = useState(false);
  const [quotesFilter, setQuotesFilter] = useState('all'); // 'all', 'pending', 'completed'

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
      loadQuotes();
    }
  }, [activeSection, quotesFilter]);

  // Función para recargar las cotizaciones
  const loadQuotes = async () => {
    try {
      setLoadingQuotes(true);
      const res = await fetch(`${API_URL}/api/custom-orders/me`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (!res.ok) throw new Error(`Status ${res.status}`);
      
      const data = await res.json();
      
      // Filtrar según el estado seleccionado
      let filteredQuotes = [];
      if (quotesFilter === 'pending') {
        filteredQuotes = data.filter(o => o.status === 'quoted');
      } else if (quotesFilter === 'completed') {
        filteredQuotes = data.filter(o => o.status === 'accepted' || o.status === 'rejected');
      } else {
        filteredQuotes = data.filter(o => o.status === 'quoted' || o.status === 'accepted' || o.status === 'rejected');
      }
      
      setQuotes(filteredQuotes);
      
      if (filteredQuotes.length > 0) {
        setHasQuotesFlag(true);
      } else {
        setHasQuotesFlag(false);
      }
    } catch (err) {
      console.error('Error cargando cotizaciones:', err);
      setErrorQuotes(err.message);
    } finally {
      setLoadingQuotes(false);
    }
  };

  // Función para cambiar el filtro
  const handleFilterChange = (filter) => {
    setQuotesFilter(filter);
  };

  const handleDecision = (orderId, decision) => {
    // Primero verificar si es una cotización existente o un nuevo encargo personalizado
    const quote = quotes.find(q => q._id === orderId);
    
    if (quote && quote.status === 'quoted') {
      // Es una cotización existente, usar la API de respuesta
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
        .then((data) => {
          console.log('Respuesta del servidor:', data);
          
          // Si se aceptó, mostrar mensaje especial y redirigir al carrito
          if (decision === 'accept') {
            showSuccess('¡Has aceptado la cotización! El producto se ha agregado a tu carrito. Redirigiendo al carrito...');
            
            // Redirigir al carrito después de 2 segundos
            setTimeout(() => {
              window.location.href = '/carrito';
            }, 2000);
          } else {
            showSuccess('Has rechazado la cotización.');
          }
          
          // Recargar las cotizaciones para mostrar el estado actualizado
          loadQuotes();
        })
        .catch(err => {
          console.error('Error en handleDecision:', err);
          showError(`Error al procesar la decisión: ${err.message}`);
        });
    } else {
      // Es un encargo nuevo, crear primero y luego responder
      showWarning('Este encargo necesita ser cotizado primero por el administrador.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
            showSuccess('Sesión cerrada correctamente');
  };

=======
>>>>>>> cdc1332ee81bfe2324c033254bbafcb8a2e87ae1
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
<<<<<<< HEAD
              <div className="header-actions">
                <div className="quotes-filter">
                  <button 
                    className={`filter-btn ${quotesFilter === 'all' ? 'active' : ''}`}
                    onClick={() => handleFilterChange('all')}
                  >
                    Todas
                  </button>
                  <button 
                    className={`filter-btn ${quotesFilter === 'pending' ? 'active' : ''}`}
                    onClick={() => handleFilterChange('pending')}
                  >
                    Pendientes
                  </button>
                  <button 
                    className={`filter-btn ${quotesFilter === 'completed' ? 'active' : ''}`}
                    onClick={() => handleFilterChange('completed')}
                  >
                    Completadas
                  </button>
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
                <p>
                  {quotesFilter === 'pending' 
                    ? 'No tienes cotizaciones pendientes.'
                    : quotesFilter === 'completed'
                    ? 'No tienes cotizaciones completadas.'
                    : 'No tienes cotizaciones.'
                  }
                </p>
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
                    
                    {/* Mostrar el estado de la decisión si existe */}
                    {quote.decision && (
                      <div className="quote-decision">
                        <span className={`decision-badge ${quote.decision}`}>
                          {quote.decision === 'accept' ? '✅ Aceptado' : '❌ Rechazado'}
                        </span>
                        <span className="decision-date">
                          {new Date(quote.updatedAt || quote.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    
                    <div className="quote-price-row">
                      <span className="quote-price">${quote.price?.toFixed(2) || '0.00'}</span>
                      <div className="quote-actions">
                        {quote.status === 'quoted' ? (
                          // Si está cotizada pero sin decisión, mostrar botones de aceptar/rechazar
                          <>
                            <button
                              className="btn-quote accept"
                              onClick={() => handleDecision(quote._id, 'accept')}
                            >
                              ACEPTAR
                            </button>
                            <button
                              className="btn-quote reject"
                              onClick={() => handleDecision(quote._id, 'reject')}
                            >
                              RECHAZAR
                            </button>
                          </>
                        ) : quote.status === 'accepted' ? (
                          // Si fue aceptada, mostrar badge de aceptado
                          <span className="decision-badge accept">✅ ACEPTADO</span>
                        ) : quote.status === 'rejected' ? (
                          // Si fue rechazada, mostrar badge de rechazado
                          <span className="decision-badge reject">❌ RECHAZADO</span>
                        ) : (
                          // Estado pendiente o desconocido
                          <span className="decision-badge pending">⏳ PENDIENTE</span>
                        )}
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
=======
            </div>

            <QuotesSection setHasQuotesFlag={setHasQuotesFlag} />
>>>>>>> cdc1332ee81bfe2324c033254bbafcb8a2e87ae1
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
