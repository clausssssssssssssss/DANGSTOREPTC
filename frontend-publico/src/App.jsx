import React, { Suspense } from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import NavBar from './components/ui/navBar'
import AuthApp from './pages/AuthApp'
import Encargo from './pages/Encargo'
//import CarritoDeCompras from './pages/CarritoDeCompras'//
import Catalogo from './pages/Catalogo'
import Contacto from './pages/Contacto'
import Acerca from './pages/Acerca'
import Perfil from './pages/Perfil'
//import MetodoDePago from './components/MetodoDePago' // Nuevo componente//
//import OrderHistory from './components/OrderHistory' // Nuevo componente//
import './App.css'
import CartPage from './pages/CartPage';


// Spinner y ErrorBoundary 
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
      <p className="text-white text-lg font-medium">Cargando aplicación...</p>
    </div>
  </div>
)

const ErrorFallback = ({ error, resetError }) => (
  <div className="min-h-screen bg-gradient-to-br from-red-400 via-red-500 to-red-600 flex items-center justify-center p-4">
    <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-red-600 text-2xl">⚠️</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Error de Aplicación</h1>
      <p className="text-gray-600 mb-4">Algo salió mal. Por favor, intenta recargar la página.</p>
      <details className="text-left mb-6">
        <summary className="cursor-pointer text-sm text-gray-500 mb-2">Detalles técnicos</summary>
        <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">{error.message}</pre>
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

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }
  resetError = () => this.setState({ hasError: false, error: null })
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} resetError={this.resetError} />
    }
    return this.props.children
  }
}

// Layout que envuelve todas las rutas privadas
function ProtectedLayout() {
  return (
    <>
      <NavBar />
      <Outlet />
    </>
  )
}

function App() {
  const token = localStorage.getItem('token')

  return (
    <AppErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* 1) Rutas de autenticación */}
          <Route path="/" element={<Navigate to="/auth" replace />} />
          <Route path="/auth/*" element={<AuthApp />} />

          {/* 2) Rutas protegidas (sólo si hay token) */}
          {token && (
            <Route element={<ProtectedLayout />}>
              <Route path="encargo" element={<Encargo />} />
              <Route path="catalogo" element={<Catalogo />} />
              {/*<Route path="carrito" element={<CarritoDeCompras />} />
              {/*<Route path="checkout" element={<MetodoDePago />} /> {/* Nueva ruta */}
              {/*<Route path="historial-pedidos" element={<OrderHistory />} /> {/* Nueva ruta */}
              <Route path="contacto" element={<Contacto />} />
              <Route path="acerca" element={<Acerca />} />
              <Route path="perfil" element={<Perfil />} />
              <Route path="/carrito" element={<CartPage />} />

              {/* fallback dentro de privadas */}
              <Route path="*" element={<Navigate to="/catalogo" replace />} />
            </Route>
          )}
<Route path="/carrito" element={<CartPage />} />
          {/* 3) Si no hay token, forzar a /auth */}
          {!token && <Route path="*" element={<Navigate to="/auth" replace />} />}
        </Routes>
      </Suspense>
    </AppErrorBoundary>
  )
}

export default App