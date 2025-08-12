// src/components/ui/NavBar.jsx
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, X, Menu, Package, Grid3X3, MessageCircle, Info } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useCart } from '../../context/CartContext.jsx';
import '../styles/navbar.css';

export default function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id;
  
  // Estado para el menú móvil
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  // Cerrar menú móvil cuando cambie la ruta
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Cerrar menú móvil con tecla Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevenir scroll
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

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
      navigate('/perfil'); // Navegar directamente a perfil donde se mostrará la pantalla de login
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Función para manejar cliks en links del menú móvil
  const handleMobileNavClick = (e, route) => {
    if (!user && route === '/carrito') {
      e.preventDefault();
      navigate('/perfil'); // Navegar directamente a perfil donde se mostrará la pantalla de login
    }
    closeMobileMenu();
  };

  return (
    <>
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

            {/* Enlaces de navegación - Solo desktop */}
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
                Catalogo
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

            {/* Contenedor derecho con iconos y hamburguesa */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              {/* Íconos de acción - Desktop */}
              <div className="action-icons desktop-only">
                <NavLink
                  to="/carrito"
                  className={({ isActive }) => `icon-link ${isActive ? 'active' : ''}`}
                  aria-label="Carrito de compras"
                >
                  <ShoppingCart size={20} />
                  {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
                </NavLink>

                {user ? (
                  <NavLink
                    to="/perfil"
                    className={({ isActive }) => `icon-link ${isActive ? 'active' : ''}`}
                    aria-label="Perfil de usuario"
                  >
                    <User size={20} />
                    {hasQuotes && <span className="notification-dot" />}
                  </NavLink>
                ) : (
                  <NavLink
                    to="/auth"
                    className="login-button-nav"
                    aria-label="Iniciar sesión"
                  >
                    Iniciar Sesión
                  </NavLink>
                )}
              </div>

              {/* Botón de Iniciar Sesión - Solo móvil */}
              {!user && (
                <div className="mobile-login-only">
                  <NavLink
                    to="/auth"
                    className="login-button-nav"
                    aria-label="Iniciar sesión"
                  >
                    Iniciar Sesión
                  </NavLink>
                </div>
              )}

              {/* Botón de menú hamburguesa - Solo móvil */}
              <button
                className={`hamburger-menu ${isMobileMenuOpen ? 'open' : ''}`}
                onClick={toggleMobileMenu}
                aria-label="Abrir menú de navegación"
                aria-expanded={isMobileMenuOpen}
              >
                <span className="hamburger-line"></span>
                <span className="hamburger-line"></span>
                <span className="hamburger-line"></span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Overlay para cerrar el menú */}
      <div 
        className={`mobile-overlay ${isMobileMenuOpen ? 'open' : ''}`}
        onClick={closeMobileMenu}
        aria-hidden="true"
      />

      {/* Menú móvil */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        {/* Header del menú */}
        <div className="mobile-menu-header">
          <span className="mobile-menu-title">DANGSTORE</span>
          <button
            className="mobile-close-btn"
            onClick={closeMobileMenu}
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>

        {/* Enlaces de navegación móvil */}
        <div className="mobile-nav-links">
          <NavLink
            to="/encargo"
            className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
            onClick={(e) => handleMobileNavClick(e, '/encargo')}
          >
            <Package className="mobile-nav-icon" size={20} />
            Encargo Personalizado
          </NavLink>

          <NavLink
            to="/catalogo"
            className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
            onClick={(e) => handleMobileNavClick(e, '/catalogo')}
          >
            <Grid3X3 className="mobile-nav-icon" size={20} />
            Catálogo de Productos
          </NavLink>

          <NavLink
            to="/contacto"
            className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
            onClick={(e) => handleMobileNavClick(e, '/contacto')}
          >
            <MessageCircle className="mobile-nav-icon" size={20} />
            Contacto
          </NavLink>

          <NavLink
            to="/acerca"
            className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
            onClick={(e) => handleMobileNavClick(e, '/acerca')}
          >
            <Info className="mobile-nav-icon" size={20} />
            Acerca de Nosotros
          </NavLink>

          {/* Separador */}
          <div className="mobile-separator" />

          {/* Enlaces adicionales */}
          <NavLink
            to="/carrito"
            className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
            onClick={(e) => handleMobileNavClick(e, '/carrito')}
          >
            <ShoppingCart className="mobile-nav-icon" size={20} />
            Mi Carrito
            {itemCount > 0 && (
              <span style={{ 
                marginLeft: 'auto', 
                background: '#4DD0E1', 
                color: 'white', 
                fontSize: '12px', 
                padding: '2px 8px', 
                borderRadius: '10px',
                fontWeight: 'bold'
              }}>
                {itemCount}
              </span>
            )}
          </NavLink>

          {user ? (
            <NavLink
              to="/perfil"
              className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <User className="mobile-nav-icon" size={20} />
              Mi Perfil
              {hasQuotes && (
                <span style={{ 
                  marginLeft: 'auto', 
                  width: '8px', 
                  height: '8px', 
                  background: '#ff3b30', 
                  borderRadius: '50%' 
                }} />
              )}
            </NavLink>
          ) : (
            <>
              <NavLink
                to="/auth"
                className="mobile-nav-link"
                onClick={closeMobileMenu}
              >
                <User className="mobile-nav-icon" size={20} />
                Iniciar Sesión
              </NavLink>
            </>
          )}
        </div>
      </div>
    </>
  );
}