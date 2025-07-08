import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Search, ShoppingCart, User } from 'lucide-react';
import './NavBar.css';

export default function NavBar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-content">
          
          {/* Logo */}
          <NavLink to="/acerca" className="logo-link">
          <div className="logo-icon">
  <img 
    src="src/assets/DANGSTORELOGOPRUEBA__1.png" // o la ruta donde tengas tu logo
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
            <NavLink to="/catalogo" className="icon-link" aria-label="Buscar">
              <Search size={20} />
            </NavLink>
            <NavLink to="/CarritoDeCompras" className="icon-link" aria-label="Carrito de compras">
              <ShoppingCart size={20} />
            </NavLink>
            <NavLink to="/perfil" className="icon-link" aria-label="Perfil de usuario">
              <User size={20} />
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}