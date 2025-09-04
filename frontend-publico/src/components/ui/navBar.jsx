// src/components/ui/NavBar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../cart/hook/useCart';
import { useFavorites } from '../../context/FavoritesContext';
import { useToast } from '../../hooks/useToast';
import { 
  ShoppingCart, 
  Heart, 
  User, 
  Menu, 
  X, 
  Search, 
  LogOut,
  Package,
  MessageSquare,
  Home,
  Star,
  Settings,
  Grid3X3,
  Info,
  MessageCircle
} from 'lucide-react';
import '../styles/navBar.css';
import logo from '../../assets/DANGSTORELOGOPRUEBA__1.png';

// URL del servidor local para desarrollo
const base = 'http://192.168.0.3:4000/api';

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
        const res = await fetch(`${base}/custom-orders/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
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
                         <Link to="/acerca" className="logo-link">
              <div className="logo-icon">
                <img
                  src={logo}
                  alt="Logo"
                  className="logo-image"
                />
              </div>
              <span className="logo-text">DANGSTORE</span>
            </Link>

            {/* Enlaces de navegación - Solo desktop */}
            <div className="nav-links">
              <Link 
                to="/encargo" 
                className="nav-link"
              >
                Encargo
              </Link>
              <Link 
                to="/catalogo" 
                className="nav-link"
              >
                                  Catálogo
              </Link>
              <Link 
                to="/contacto" 
                className="nav-link"
              >
                Contacto
              </Link>
              <Link 
                to="/acerca" 
                className="nav-link"
              >
                Acerca
              </Link>
            </div>

            {/* Contenedor derecho con iconos y hamburguesa */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              {/* Íconos de acción - Desktop */}
              <div className="action-icons desktop-only">
                <Link
                  to="/carrito"
                  className="icon-link"
                  aria-label="Carrito de compras"
                >
                  <ShoppingCart size={20} />
                  {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
                </Link>

                {user ? (
                  <Link
                    to="/perfil"
                    className="icon-link"
                    aria-label="Perfil de usuario"
                  >
                    <User size={20} />
                    {hasQuotes && <span className="notification-dot" />}
                  </Link>
                ) : (
                  <Link
                    to="/auth"
                    className="login-button-nav"
                    aria-label="Iniciar sesión"
                  >
                    Iniciar Sesión
                  </Link>
                )}
              </div>

              {/* Botón de Iniciar Sesión - Solo móvil */}
              {!user && (
                <div className="mobile-login-only">
                  <Link
                    to="/auth"
                    className="login-button-nav"
                    aria-label="Iniciar sesión"
                  >
                    Iniciar Sesión
                  </Link>
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
          <Link
            to="/encargo"
            className="mobile-nav-link"
            onClick={(e) => handleMobileNavClick(e, '/encargo')}
          >
            <Package className="mobile-nav-icon" size={20} />
            Encargo Personalizado
          </Link>

          <Link
            to="/catalogo"
            className="mobile-nav-link"
            onClick={(e) => handleMobileNavClick(e, '/catalogo')}
          >
            <Grid3X3 className="mobile-nav-icon" size={20} />
            Catálogo de Productos
          </Link>

          <Link
            to="/contacto"
            className="mobile-nav-link"
            onClick={(e) => handleMobileNavClick(e, '/contacto')}
          >
            <MessageCircle className="mobile-nav-icon" size={20} />
            Contacto
          </Link>

          <Link
            to="/acerca"
            className="mobile-nav-link"
            onClick={(e) => handleMobileNavClick(e, '/acerca')}
          >
            <Info className="mobile-nav-icon" size={20} />
            Acerca de Nosotros
          </Link>

          {/* Separador */}
          <div className="mobile-separator" />

          {/* Enlaces adicionales */}
          <Link
            to="/carrito"
            className="mobile-nav-link"
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
          </Link>

          {user ? (
            <Link
              to="/perfil"
              className="mobile-nav-link"
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
            </Link>
          ) : (
            <>
              <Link
                to="/auth"
                className="mobile-nav-link"
                onClick={closeMobileMenu}
              >
                <User className="mobile-nav-icon" size={20} />
                Iniciar Sesión
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}