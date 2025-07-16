// src/pages/UserProfile.jsx
import React, { useState, useEffect } from 'react';
import {
  Heart, ShoppingCart, User, Gift, LogOut
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';
import '../components/styles/UserProfile.css';

import PersonalDataSection from '../components/profile/PersonalDataSection';
import OrdersSection       from '../components/profile/OrdersSection';
import FavoritesSection    from '../components/profile/FavoritesSection';
import PasswordSection     from '../components/profile/PasswordSection';
import UserSection         from '../components/profile/UserSection';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const UserProfile = () => {
  const { user } = useAuth(); // 

  useEffect(() => {
    if (!user) {
      toast.warning("Debes iniciar sesión para ver tu perfil");
    }
  }, [user]); // 

  if (!user) return null; // 

  const [activeSection, setActiveSection] = useState('personal');

  // --- Estado para cotizaciones ---
  const [quotes, setQuotes]             = useState([]);
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [errorQuotes, setErrorQuotes]     = useState('');

  // --- Bandera para mostrar puntito rojo ---
  const [hasQuotesFlag, setHasQuotesFlag] = useState(false);

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
      })
      .catch(err => alert('Error: ' + err.message));
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
                <Gift />
                <h3>Cotizaciones</h3>
              </div>
            </div>

            {loadingQuotes && <p>Cargando cotizaciones…</p>}
            {errorQuotes  && <p className="error-message">{errorQuotes}</p>}
            {!loadingQuotes && quotes.length === 0 && (
              <p>No tienes cotizaciones nuevas.</p>
            )}

            {quotes.map(o => (
              <div key={o._id} className="quote-item">
                <p><strong>Encargo:</strong> {o.modelType}</p>
                <p><strong>Detalles:</strong> {o.description}</p>
                <p><strong>Precio cotizado:</strong> ${o.price.toFixed(2)}</p>
                <div className="quote-actions">
                  <button
                    className="btn btn-accept"
                    onClick={() => handleDecision(o._id, 'accept')}
                  >
                    Aceptar
                  </button>
                  <button
                    className="btn btn-reject"
                    onClick={() => handleDecision(o._id, 'reject')}
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
      case 'customOrders':
        return (
          <div className="content-card">
            <div className="card-header">
              <div className="card-title">
                <ShoppingCart />
                <h3>Encargos Personalizados</h3>
              </div>
            </div>
            <p>Gestiona tus encargos personalizados. Aquí aparecerán cuando los realices.</p>
          </div>
        );
      case 'logout':
        return (
          <div className="logout-content">
            <LogOut className="logout-icon" />
            <h2 className="logout-title">¿Seguro que deseas cerrar sesión?</h2>
            <p className="logout-subtitle">Perderás el acceso a tu cuenta en este dispositivo.</p>
            <div className="logout-actions">
              <button className="logout-button cancel" onClick={() => setActiveSection('personal')}>
                Cancelar
              </button>
              <button
                className="logout-button confirm"
                onClick={() => {
                  localStorage.removeItem('token');
                  window.location.reload();
                }}
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="user-profile-container">
      <div className="content-layout">
        <aside className="sidebar">
          <div className="sidebar-card">
            <UserSection />
            <nav className="nav-buttons">
              <button
                onClick={() => setActiveSection('personal')}
                className={`nav-button ${activeSection === 'personal' ? 'active' : ''}`}
              >
                <User className="nav-button-icon" /> Datos Personales
              </button>
              <button
                onClick={() => setActiveSection('orders')}
                className={`nav-button ${activeSection === 'orders' ? 'active' : ''}`}
              >
                <ShoppingCart className="nav-button-icon" /> Pedidos
              </button>
              <button
                onClick={() => setActiveSection('favorites')}
                className={`nav-button ${activeSection === 'favorites' ? 'active' : ''}`}
              >
                <Heart className="nav-button-icon" /> Favoritos
              </button>
              <button
                onClick={() => setActiveSection('password')}
                className={`nav-button ${activeSection === 'password' ? 'active' : ''}`}
              >
                🔒 Cambiar Contraseña
              </button>
              <button
                onClick={() => setActiveSection('quotes')}
                className={`nav-button ${activeSection === 'quotes' ? 'active' : ''}`}
              >
                <Gift className="nav-button-icon" /> Cotizaciones
                {hasQuotesFlag && <span className="notification-dot-sidebar" />}
              </button>
              <button
                onClick={() => setActiveSection('customOrders')}
                className={`nav-button ${activeSection === 'customOrders' ? 'active' : ''}`}
              >
                📦 Encargos Personalizados
              </button>
              <button
                onClick={() => setActiveSection('logout')}
                className={`nav-button logout ${activeSection === 'logout' ? 'active' : ''}`}
              >
                <LogOut className="nav-button-icon" /> Cerrar Sesión
              </button>
            </nav>
          </div>
        </aside>

        <main className="content-area">
          <div className="section-content">{renderSection()}</div>
        </main>
      </div>
    </div>
  );
};

export default UserProfile;
