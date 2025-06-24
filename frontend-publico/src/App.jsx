import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useCart } from './hooks/useCart';
import { useProducts } from './hooks/useProducts';
import Header from './components/Header';
import NavBar from './components/navBar';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

// Páginas (importación lazy para mejor performance)
const Inicio = React.lazy(() => import('./pages/Inicio'));
const IniciarSesion = React.lazy(() => import('./pages/IniciarSesion'));
const Registro = React.lazy(() => import('./pages/Registro'));
const Perfil = React.lazy(() => import('./pages/Perfil'));
const RecuperarContrasena = React.lazy(() => import('./pages/RecuperarContrasena'));
const Contacto = React.lazy(() => import('./pages/Contacto'));
const Catalogo = React.lazy(() => import('./pages/Catalogo'));
const EncargoPersonalizado = React.lazy(() => import('./pages/EncargoPersonalizado'));
const CarritoDeCompras = React.lazy(() => import('./pages/CarritoDeCompras'));
const MetodoDePago = React.lazy(() => import('./pages/MetodoDePago'));

function App() {
  const { user, login, logout, register } = useAuth();
  const { cart, addToCart, removeFromCart, clearCart } = useCart();
  const { products, loading, error } = useProducts();

  return (
    <Router>
      <div className="App">
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <Header user={user} onLogout={logout} />
            <NavBar cartCount={cart.length} />
            
            <main className="main-content">
              <Routes>
                {/* Página principal */}
                <Route path="/" element={<Inicio products={products} />} />
                
                {/* Autenticación */}
                <Route path="/iniciar-sesion" element={<IniciarSesion onLogin={login} />} />
                <Route path="/registro" element={<Registro onRegister={register} />} />
                <Route path="/perfil" element={<Perfil user={user} />} />
                <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
                
                {/* Catálogo y productos */}
                <Route 
                  path="/catalogo" 
                  element={<Catalogo products={products} addToCart={addToCart} />} 
                />
                <Route 
                  path="/encargo-personalizado" 
                  element={<EncargoPersonalizado />} 
                />
                
                {/* Carrito y compras */}
                <Route 
                  path="/carrito" 
                  element={
                    <CarritoDeCompras 
                      cart={cart} 
                      removeFromCart={removeFromCart} 
                      clearCart={clearCart} 
                    />
                  } 
                />
                <Route 
                  path="/metodo-de-pago" 
                  element={<MetodoDePago cart={cart} />} 
                />
                
                {/* Contacto */}
                <Route path="/contacto" element={<Contacto />} />
              </Routes>
            </main>
            
            <Footer />
          </Suspense>
        </ErrorBoundary>
      </div>
    </Router>
  );
}

export default App;