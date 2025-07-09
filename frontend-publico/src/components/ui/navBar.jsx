import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, User } from 'lucide-react';
import './NavBar.css';

export default function NavBar() {
  const location = useLocation();

  // Función para manejar el clic en el ícono de búsqueda
  const handleSearchClick = (e) => {
    // Si estamos en la página del catálogo, activar los filtros
    if (location.pathname === '/catalogo') {
      e.preventDefault();
      // Llamar a la función global del catálogo si existe
      if (window.toggleCatalogFilters) {
        window.toggleCatalogFilters();
      }
    }
    // Si no estamos en catálogo, navegar a la página de catálogo
    // (esto se maneja automáticamente por el NavLink)
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
                alt="" 
                className="logo-image"
              />
            </div>
            <span className="logo-text">DANGSTORE</span>
          </NavLink>
          
          {/* Navigation Links */}
          <div className="nav-links">
            <NavLink 
              to="/encargo"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Encargo
            </NavLink>
            <NavLink 
              to="/catalogo"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Catálogo
            </NavLink>
            <NavLink 
              to="/contacto"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Contacto
            </NavLink>
            <NavLink 
              to="/acerca"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Acerca
            </NavLink>
          </div>
          
          {/* Action Icons */}
          <div className="action-icons">
            <NavLink 
              to="/catalogo" 
              className={({ isActive }) => `icon-link ${isActive ? 'active' : ''}`}
              aria-label="Buscar"
              onClick={handleSearchClick}
            >
              <Search size={20} />
            </NavLink>
            <NavLink 
              to="/CarritoDeCompras" 
              className={({ isActive }) => `icon-link ${isActive ? 'active' : ''}`}
              aria-label="Carrito de compras"
            >
              <ShoppingCart size={20} />
            </NavLink>
            <NavLink 
              to="/perfil" 
              className={({ isActive }) => `icon-link ${isActive ? 'active' : ''}`}
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