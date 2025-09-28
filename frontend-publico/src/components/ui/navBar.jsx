import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../cart/hook/useCart';
import useCategories from '../../hooks/useCategories';
import { 
  ShoppingCart, 
  User, 
  X, 
  Package,
  Grid3X3,
  Info,
  MessageCircle,
  ChevronDown
} from 'lucide-react';
import '../styles/navBar.css';
import logo from '../../assets/DANGSTORELOGOPRUEBA__1.png';

const base = 'https://dangstoreptc-production.up.railway.app/api';

export default function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id;
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoriesDropdownOpen, setIsCategoriesDropdownOpen] = useState(false);
  const { cart } = useCart(userId);
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();
  const itemCount = Array.isArray(cart) ? cart.reduce((sum, i) => sum + i.quantity, 0) : 0;
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
        if (Array.isArray(orders) && orders.some(o => o.status === 'quoted')) {
          setHasQuotes(true);
        }
      } catch (err) {
        console.warn(err);
      }
    }
    fetchQuotes();
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleCategorySelect = (categoryName) => {
    // Navegar al catálogo con la categoría seleccionada
    navigate(`/catalogo?category=${encodeURIComponent(categoryName)}`);
    setIsCategoriesDropdownOpen(false);
  };

  const handleShowAllCategories = () => {
    navigate('/catalogo');
    setIsCategoriesDropdownOpen(false);
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-content">
            <Link to="/acerca" className="logo-link">
              <div className="logo-icon">
                <img src={logo} alt="Logo" className="logo-image" />
              </div>
              <span className="logo-text">DANGSTORE</span>
            </Link>

            <div className="nav-links">
              <div 
                className="nav-link-with-dropdown"
                onMouseEnter={() => setIsCategoriesDropdownOpen(true)}
                onMouseLeave={() => setIsCategoriesDropdownOpen(false)}
              >
                <Link to="/catalogo" className="nav-link">
                  Catálogo
                  <ChevronDown size={14} className="dropdown-icon" />
                </Link>
                
                {/* Menú desplegable de categorías */}
                {isCategoriesDropdownOpen && (
                  <div className="categories-dropdown">
                    <div className="dropdown-content">
                      <button 
                        className="dropdown-item"
                        onClick={handleShowAllCategories}
                      >
                        Todas las categorías
                      </button>
                      
                      {categoriesLoading ? (
                        <div className="dropdown-item loading">Cargando categorías...</div>
                      ) : categoriesError ? (
                        <div className="dropdown-item error">Error al cargar categorías</div>
                      ) : (
                        categories.map((category) => (
                          <button
                            key={category._id}
                            className="dropdown-item"
                            onClick={() => handleCategorySelect(category.name)}
                          >
                            {category.name}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <Link to="/encargo" className="nav-link">
                Encargo
              </Link>
              <Link to="/contacto" className="nav-link">
                Contacto
              </Link>
              <Link to="/acerca" className="nav-link">
                Sobre nosotros
              </Link>
            </div>

            <div className="navbar-right">
              <div className="action-icons desktop-only">
                <Link to="/carrito" className="icon-link" aria-label="Carrito de compras">
                  <ShoppingCart className="cart-icon" size={23} />
                  {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
                </Link>

                {user ? (
                  <Link to="/perfil" className="icon-link" aria-label="Perfil de usuario">
                    <User size={20} />
                    {hasQuotes && <span className="notification-dot" />}
                  </Link>
                ) : (
                  <Link to="/auth" className="login-button-nav" aria-label="Iniciar sesión">
                    Iniciar Sesión
                  </Link>
                )}
              </div>

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

      <div 
        className={`mobile-overlay ${isMobileMenuOpen ? 'open' : ''}`}
        onClick={closeMobileMenu}
        aria-hidden="true"
      />

      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <span className="mobile-menu-title">DANGSTORE</span>
          <button className="mobile-close-btn" onClick={closeMobileMenu} aria-label="Cerrar menú">
            <X size={20} />
          </button>
        </div>

        <div className="mobile-nav-links">
          <Link to="/catalogo" className="mobile-nav-link" onClick={closeMobileMenu}>
            <Grid3X3 className="mobile-nav-icon" size={20} />
            Catálogo de Productos
          </Link>

          <Link to="/encargo" className="mobile-nav-link" onClick={closeMobileMenu}>
            <Package className="mobile-nav-icon" size={20} />
            Encargo Personalizado
          </Link>

          <Link to="/contacto" className="mobile-nav-link" onClick={closeMobileMenu}>
            <MessageCircle className="mobile-nav-icon" size={20} />
            Contacto
          </Link>

          <Link to="/acerca" className="mobile-nav-link" onClick={closeMobileMenu}>
            <Info className="mobile-nav-icon" size={20} />
            Sobre nosotros
          </Link>

          <div className="mobile-separator" />

          <Link to="/carrito" className="mobile-nav-link" onClick={closeMobileMenu}>
            <ShoppingCart className="mobile-nav-icon" size={23} />
            Mi Carrito
            {itemCount > 0 && (
              <span className="mobile-cart-badge">
                {itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <Link to="/perfil" className="mobile-nav-link" onClick={closeMobileMenu}>
              <User className="mobile-nav-icon" size={20} />
              Mi Perfil
              {hasQuotes && <span className="mobile-notification-dot" />}
            </Link>
          ) : (
            <Link to="/auth" className="mobile-nav-link" onClick={closeMobileMenu}>
              <User className="mobile-nav-icon" size={20} />
              Iniciar Sesión
            </Link>
          )}
        </div>
      </div>
    </>
  );
}