// src/pages/UserProfile.jsx
import React, { useState, useEffect } from 'react';
import { Heart, ShoppingCart, User, Gift, LogOut, Lock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import '../components/styles/UserProfile.css';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ui/ToastContainer';

import PersonalDataSection from '../components/profile/PersonalDataSection';
import OrdersSection from '../components/profile/OrdersSection';
import FavoritesSection from '../components/profile/FavoritesSection';
import PasswordSection from '../components/profile/PasswordSection';
import UserSection from '../components/profile/UserSection';

const API_URL = import.meta.env.VITE_API_URL || '';

const UserProfile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toasts, showSuccess, showError, showWarning, removeToast } = useToast();

  const [activeSection, setActiveSection] = useState('personal');
  const [hasQuotesFlag, setHasQuotesFlag] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // --- Estado para cotizaciones ---
  const [quotes, setQuotes] = useState([]);
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [errorQuotes, setErrorQuotes] = useState(null);
  const [quotesFilter, setQuotesFilter] = useState('all'); // 'all', 'pending', 'completed'

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
    const fetchAll = async () => {
      try {
        const res = await fetch(`${API_URL}/api/custom-orders/me`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (!res.ok) return;
        const data = await res.json();
        // Solo mostrar notificación si hay cotizaciones pendientes de decisión
        if (data.some(o => o.status === 'quoted')) {
          setHasQuotesFlag(true);
        } else {
          setHasQuotesFlag(false);
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
       
       // Actualizar el estado de notificación basado en cotizaciones pendientes
       if (filteredQuotes.some(q => q.status === 'quoted')) {
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

  const handleDecision = async (orderId, decision) => {
    console.log('🚀 === INICIO handleDecision ===');
    console.log('📝 Parámetros:', { orderId, decision });
    
    try {
      // Primero verificar si es una cotización existente o un nuevo encargo personalizado
      const quote = quotes.find(q => q._id === orderId);
      console.log('🔍 Cotización encontrada:', quote);
      
      if (!quote) {
        console.log('❌ No se encontró la cotización en el estado local');
        showError('No se pudo encontrar la cotización');
        return;
      }
      
      if (quote.status === 'quoted') {
        console.log('✅ Es una cotización existente, procesando decisión...');
        
        // Mostrar loading state
        showSuccess('Procesando tu decisión...');
        
        const response = await fetch(`${API_URL}/api/custom-orders/${orderId}/respond`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ decision })
        });
        
        console.log('📡 Respuesta del servidor:', response.status, response.statusText);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Error del servidor:', errorText);
          
          let errorMessage = 'Error del servidor';
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch (e) {
            console.log('No se pudo parsear el error como JSON');
          }
          
          throw new Error(`${response.status}: ${errorMessage}`);
        }
        
        const data = await response.json();
        console.log('✅ Respuesta exitosa del servidor:', data);
        
        // Si se aceptó, mostrar mensaje especial y redirigir al carrito
        if (decision === 'accept') {
          console.log('✅ Cotización aceptada, redirigiendo al carrito...');
          showSuccess('¡Has aceptado la cotización! El producto se ha agregado a tu carrito. Redirigiendo al carrito...');
          
          // Redirigir directamente al carrito después de 2 segundos
          setTimeout(() => {
            console.log('🚀 Navegando a /carrito...');
            navigate('/carrito');
          }, 2000);
        } else {
          showSuccess('Has rechazado la cotización.');
        }
        
        // Recargar las cotizaciones para mostrar el estado actualizado
        console.log('🔄 Recargando cotizaciones...');
        await loadQuotes();
        
      } else {
        console.log('❌ Estado de cotización no válido:', quote.status);
        showWarning('Este encargo necesita ser cotizado primero por el administrador.');
      }
      
    } catch (err) {
      console.error('❌ Error en handleDecision:', err);
      console.error('❌ Stack trace:', err.stack);
      
      let errorMessage = 'Error al procesar la decisión';
      if (err.message) {
        errorMessage += `: ${err.message}`;
      }
      
      showError(errorMessage);
    } finally {
      console.log('🏁 === FIN handleDecision ===');
    }
  };

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
                <Gift size={20} className="section-icon" />
                <h3>Mis Cotizaciones</h3>
              </div>
              <div className="quotes-summary">
                <span className="quotes-count">
                  <Gift size={16} />
                  {quotes.length} cotización{quotes.length !== 1 ? 'es' : ''}
                </span>
              </div>
            </div>

            {/* Filtros */}
            <div className="quotes-filters">
              <button 
                className={`filter-button ${quotesFilter === 'all' ? 'active' : ''}`}
                onClick={() => handleFilterChange('all')}
              >
                Todas
              </button>
              <button 
                className={`filter-button ${quotesFilter === 'pending' ? 'active' : ''}`}
                onClick={() => handleFilterChange('pending')}
              >
                Pendientes
              </button>
              <button 
                className={`filter-button ${quotesFilter === 'completed' ? 'active' : ''}`}
                onClick={() => handleFilterChange('completed')}
              >
                Completadas
              </button>
            </div>

            {loadingQuotes && (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Cargando cotizaciones...</p>
              </div>
            )}
            
            {errorQuotes && (
              <div className="error-state">
                <div className="error-icon">⚠️</div>
                <h4>Error al cargar cotizaciones</h4>
                <p>{errorQuotes}</p>
                <button onClick={() => loadQuotes()} className="retry-button">
                  Reintentar
                </button>
              </div>
            )}
            
            {!loadingQuotes && quotes.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">🎁</div>
                <h4>
                  {quotesFilter === 'pending' 
                    ? 'No tienes cotizaciones pendientes'
                    : quotesFilter === 'completed'
                    ? 'No tienes cotizaciones completadas'
                    : 'No tienes cotizaciones'
                  }
                </h4>
                <p>
                  {quotesFilter === 'pending' 
                    ? 'Cuando tengas cotizaciones pendientes aparecerán aquí para que puedas aceptarlas o rechazarlas.'
                    : quotesFilter === 'completed'
                    ? 'Las cotizaciones que hayas aceptado o rechazado aparecerán aquí como historial.'
                    : 'Los encargos personalizados que envíes serán cotizados por nuestro equipo y aparecerán aquí.'
                  }
                </p>
              </div>
            )}

            {!loadingQuotes && quotes.length > 0 && (
              <div className="quotes-grid">
                {quotes.map(quote => (
                  <div key={quote._id} className="quote-card">
                    {/* Imagen del encargo */}
                    <div className="quote-image">
                      {quote.imageUrl ? (
                        <img 
                          src={quote.imageUrl} 
                          alt={quote.modelType}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className="quote-image-placeholder"
                        style={{display: quote.imageUrl ? 'none' : 'flex'}}
                      >
                        <Gift size={32} />
                        <span>{quote.modelType}</span>
                      </div>
                    </div>

                    {/* Información del encargo */}
                    <div className="quote-info">
                      <h4 className="quote-title">{quote.modelType}</h4>
                      
                      {quote.description && (
                        <p className="quote-description">
                          {quote.description.length > 60 
                            ? `${quote.description.substring(0, 60)}...` 
                            : quote.description
                          }
                        </p>
                      )}
                      
                      {quote.price && (
                        <div className="quote-price">
                          <span className="price-label">Precio cotizado:</span>
                          <span className="price-value">${quote.price.toFixed(2)}</span>
                        </div>
                      )}
                      
                      {quote.comment && (
                        <div className="quote-comment">
                          <span className="comment-label">Comentario:</span>
                          <span className="comment-value">{quote.comment}</span>
                        </div>
                      )}
                    </div>

                    {/* Estado y acciones */}
                    <div className="quote-status">
                      {quote.decision ? (
                        // Cotización con decisión tomada
                        <div className="quote-decision">
                          <span className={`decision-badge ${quote.decision}`}>
                            {quote.decision === 'accept' ? '✅ ACEPTADO' : '❌ RECHAZADO'}
                          </span>
                          <span className="decision-date">
                            {new Date(quote.updatedAt || quote.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ) : quote.status === 'quoted' ? (
                        // Cotización pendiente de decisión
                        <div className="quote-actions">
                          <button
                            className="action-button accept-button"
                            onClick={() => handleDecision(quote._id, 'accept')}
                          >
                            ACEPTAR
                          </button>
                          <button
                            className="action-button reject-button"
                            onClick={() => handleDecision(quote._id, 'reject')}
                          >
                            RECHAZAR
                          </button>
                        </div>
                      ) : (
                        // Estado pendiente
                        <div className="quote-status-badge">
                          <span className={`status-badge ${quote.status}`}>
                            {quote.status === 'pending' ? '⏳ PENDIENTE' : '📋 EN REVISIÓN'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                className={`nav-button ${activeSection === 'personal' ? 'active' : ''}`}
              >
                <User className="nav-icon" />
                <span>Mis datos</span>
              </button>
              
              <button
                onClick={() => setActiveSection('orders')}
                className={`nav-button ${activeSection === 'orders' ? 'active' : ''}`}
              >
                <ShoppingCart className="nav-icon" />
                <span>Mis pedidos</span>
              </button>
              
              <button
                onClick={() => setActiveSection('favorites')}
                className={`nav-button ${activeSection === 'favorites' ? 'active' : ''}`}
              >
                <Heart className="nav-icon" />
                <span>Favoritos</span>
              </button>
              
              <button
                onClick={() => setActiveSection('password')}
                className={`nav-button ${activeSection === 'password' ? 'active' : ''}`}
              >
                <Lock className="nav-icon" />
                <span>Contraseña</span>
              </button>
              
              <button
                onClick={() => setActiveSection('quotes')}
                className={`nav-button ${activeSection === 'quotes' ? 'active' : ''}`}
              >
                <Gift className="nav-icon" />
                <span>Cotizaciones</span>
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
