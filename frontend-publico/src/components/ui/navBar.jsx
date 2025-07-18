// src/components/ui/NavBar.jsx
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useCart } from '../cart/hook/useCart.jsx';
import './NavBar.css';

export default function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id;

  // Carrito
  const { cart } = useCart(userId);
  const itemCount = Array.isArray(cart)
    ? cart.reduce((sum, i) => sum + i.quantity, 0)
    : 0;

  // Estado para saber si hay cotizaciones "quoted"
  const [hasQuotes, setHasQuotes] = useState(false);

  useEffect(() => {
    async function fetchQuotes() {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/custom-orders/me`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) return;
        const orders = await res.json();
        if (orders.some(o => o.status === 'quoted')) {
          setHasQuotes(true);
        }
      } catch (err) {
        // console.warn(err);
      }
    }
    fetchQuotes();
  }, []);

  const handleSearchClick = e => {
    if (location.pathname === '/catalogo') {
      e.preventDefault();
      window.toggleCatalogFilters?.();
    }
  };

  // Evita acceso si no está logueado
  const handleProtectedClick = (e, route) => {
    if (!user) {
      e.preventDefault();
      navigate('/auth');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-content">
          {/* Logo */}
          <NavLink to="/acerca" className="logo-link">
            <div className="logo-icon">
              <img
                src="src/assets/DANGSTORELOGOPRUEBA__1.png"
                alt="Logo"
                className="logo-image"
              />
            </div>
            <span className="logo-text">DANGSTORE</span>
          </NavLink>

          {/* Enlaces */}
          <div className="nav-links">
            <NavLink to="/encargo"  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Encargo
            </NavLink>
            <NavLink to="/catalogo" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Catá logo
            </NavLink>
            <NavLink to="/contacto" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Contacto
            </NavLink>
            <NavLink to="/acerca" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Acerca
            </NavLink>
          </div>

          {/* Íconos de acción */}
          <div className="action-icons">
            <NavLink
              to="/catalogo"
              className={({ isActive }) => `icon-link ${isActive ? 'active' : ''}`}
              onClick={handleSearchClick}
              aria-label="Buscar"
            >
              <Search size={20} />
            </NavLink>

            <NavLink
              to="/carrito"
              className={({ isActive }) => `icon-link ${isActive ? 'active' : ''}`}
              aria-label="Carrito de compras"
            >
              <ShoppingCart size={20} />
              {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
            </NavLink>

            <NavLink
              to="/perfil"
              onClick={(e) => handleProtectedClick(e, '/perfil')}
              className={({ isActive }) => `icon-link ${isActive ? 'active' : ''}`}
              aria-label="Perfil de usuario"
            >
              <User size={20} />
              {hasQuotes && <span className="notification-dot" />}
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}
