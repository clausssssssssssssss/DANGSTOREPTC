import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.jsx';
// IMPORTA bien tu hook de carrito
import { useCart } from '../cart/useCart.jsx';
import './NavBar.css';

export default function NavBar() {
  const location = useLocation();
  const { user } = useAuth();
  const userId = user?.id;

  // Pasa userId al hook
  const { cart } = useCart(userId);

  // Badget de cantidad
  const itemCount = Array.isArray(cart)
    ? cart.reduce((sum, i) => sum + i.quantity, 0)
    : 0;

  const handleSearchClick = e => {
    if (location.pathname === '/catalogo') {
      e.preventDefault();
      window.toggleCatalogFilters?.();
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-content">
          {/* Logo */}
          <NavLink to="/acerca" className="logo-link">
            <div className="logo-icon">
              <img src="src/assets/DANGSTORELOGOPRUEBA__1.png" alt="Logo" className="logo-image" />
            </div>
            <span className="logo-text">DANGSTORE</span>
          </NavLink>

          {/* Enlaces */}
          <div className="nav-links">
            <NavLink to="/encargo"  className={({isActive})=>`nav-link ${isActive?'active':''}`}>Encargo</NavLink>
            <NavLink to="/catalogo" className={({isActive})=>`nav-link ${isActive?'active':''}`}>Catálogo</NavLink>
            <NavLink to="/contacto" className={({isActive})=>`nav-link ${isActive?'active':''}`}>Contacto</NavLink>
            <NavLink to="/acerca"   className={({isActive})=>`nav-link ${isActive?'active':''}`}>Acerca</NavLink>
          </div>

          {/* Íconos de acción */}
          <div className="action-icons">
            <NavLink
              to="/catalogo"
              className={({isActive})=>`icon-link ${isActive?'active':''}`}
              onClick={handleSearchClick}
              aria-label="Buscar"
            >
              <Search size={20} />
            </NavLink>

            <NavLink
              to="/carrito"
              className={({isActive})=>`icon-link ${isActive?'active':''}`}
              aria-label="Carrito de compras"
            >
              <ShoppingCart size={20} />
              {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
            </NavLink>

            <NavLink
              to="/perfil"
              className={({isActive})=>`icon-link ${isActive?'active':''}`}
              aria-label="Perfil de usuario"
            >
              <User size={20} />
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}
