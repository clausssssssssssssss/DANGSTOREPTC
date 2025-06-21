<<<<<<< HEAD
import React, { Suspense, ErrorBoundary } from 'react'
import AuthApp from './pages/AuthApp'
import './App.css'

/**
 * Componente de carga mientras se renderiza la aplicación
 */
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
      <p className="text-white text-lg font-medium">Cargando aplicación...</p>
    </div>
  </div>
)

/**
 * Componente de error para casos de fallo
 */
const ErrorFallback = ({ error, resetError }) => (
  <div className="min-h-screen bg-gradient-to-br from-red-400 via-red-500 to-red-600 flex items-center justify-center p-4">
    <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-red-600 text-2xl">⚠️</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Error de Aplicación</h1>
      <p className="text-gray-600 mb-4">
        Algo salió mal. Por favor, intenta recargar la página.
      </p>
      <details className="text-left mb-6">
        <summary className="cursor-pointer text-sm text-gray-500 mb-2">
          Detalles técnicos
        </summary>
        <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
          {error.message}
        </pre>
      </details>
      <button
        onClick={resetError}
        className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-xl transition-all duration-200"
      >
        Intentar de nuevo
      </button>
    </div>
  </div>
)

/**
 * Boundary de error personalizado
 */
class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error capturado por ErrorBoundary:', error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback 
          error={this.state.error} 
          resetError={this.resetError}
        />
      )
    }

    return this.props.children
  }
}

/**
 * Componente principal de la aplicación
 * Incluye manejo de errores, carga y estructura semántica
 */
function App() {
  return (
    <div className="App">
      {/* Metadatos para accesibilidad */}
      <div className="sr-only">
        <h1></h1>
        <p></p>
      </div>

      <AppErrorBoundary>
        <Suspense fallback={<LoadingSpinner />}>
          {/* Contenido principal de la aplicación */}
          <main className="w-full min-h-screen" role="main">
            <AuthApp />
          </main>
        </Suspense>
      </AppErrorBoundary>

      {/* Información de desarrollo (solo visible en desarrollo) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded text-xs">
          <p></p>
          <p> {React.version}</p>
        </div>
      )}
    </div>
  )
}

export default App
=======
<<<<<<< HEAD
import React from "react";
import { BrowserRouter as Router, Routes, Route, } from "react-router-dom";
import Nav from "./components/Navigation";

// Páginas
import iniciarSesion from './pages/iniciarSesion';
import registro from './pages/registro';
import inicio from './pages/inicio';
import perfil from './pages/perfil';
import recuperarContrasena from './pages/recuperarContrasena';
import recuperarContraseña2 from './pages/recuperarcontraseña2';
import recuperarContraseña3 from './pages/recuperarcontraseña3';
import contacto from './pages/contacto';
import catologo from './pages/catologo';
import encargoPersonalizado from './pages/encargoPersonalizado';
import carritoDeCompras from './pages/carritoDeCompras';
import metododePago from './pages/metodoDePago';


function App() { 

  return (
    <>
      <Router>
      <Routes>
        <Route path="/" element={<inicio />} />
        <Route path="/iniciarSesion" element={<iniciarSesion />} />
        <Route path="/registro" element={<registro />} />
        <Route path="/perfil" element={<perfil />} />
        
      </Routes>
      </Router>
    </>
  );
};


export default App;
=======
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from './components/Header';
import NavBar from './components/navBar';
import Footer from './components/Footer';
import ProductsPage from './components/ProductsPage';
import Catalogo from './components/Catalogojsx';
import ProductList from './components/ProductList';
import CartItem from './components/Cartitem';
import useAuth from './hooks/useAuth';
import useCart from './hooks/useCart';
import useProducts from './hooks/useProducts';
import './App.css';

function App() {
  const { user, login, logout, register } = useAuth();
  const { cart, addToCart, removeFromCart, clearCart } = useCart();
  const { products, loading, error } = useProducts();

  return (
    <Router>
      <div className="App">
        <Header user={user} onLogout={logout} />
        <NavBar cartCount={cart.length} />
        
        <main className="main-content">
          <Routes>
            {/* Página principal */}
            <Route path="/" element={<ProductsPage products={products} loading={loading} error={error} />} />
            
            {/* Catálogo */}
            <Route path="/catalogo" element={<Catalogo products={products} addToCart={addToCart} />} />
            
            {/* Lista de productos */}
            <Route path="/productos" element={<ProductList products={products} loading={loading} error={error} />} />
            
            {/* Carrito */}
            <Route 
              path="/carrito" 
              element={
                <div className="cart-container">
                  <h2>Tu Carrito</h2>
                  {cart.length === 0 ? (
                    <p>Tu carrito está vacío</p>
                  ) : (
                    cart.map(item => (
                      <CartItem 
                        key={item.id} 
                        item={item} 
                        onRemove={removeFromCart} 
                      />
                    ))
                  )}
                  <button onClick={clearCart} className="clear-cart-btn">
                    Vaciar Carrito
                  </button>
                </div>
              } 
            />
            
        
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;
>>>>>>> 6c4db560ea00ef3da40ad1034b29f8c1eb918ee1
>>>>>>> 9116ac627c39b110c673ef9f92b37ac0f797258e
