import React, { Suspense } from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import NavBar from './components/ui/navBar'
import AuthApp from './pages/AuthApp'
import Encargo from './pages/Encargo'
import CarritoDeCompras from './pages/CarritoDeCompras'
import Catalogo from './pages/Catalogo'
import Contacto from './pages/Contacto'
import Acerca from './pages/Acerca'
import UserProfile from './pages/UserProfile'  // Mantenemos el import original
import './App.css'

// Componente de carga mejorado
const LoadingSpinner = () => (
  <div className="fixed inset-0 bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 flex items-center justify-center z-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
      <p className="text-white text-lg font-medium animate-pulse">Cargando aplicación...</p>
    </div>
  </div>
)

// Componente de error mejorado
const ErrorFallback = ({ error, resetError }) => (
  <div className="fixed inset-0 bg-gradient-to-br from-red-400 via-red-500 to-red-600 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-red-600 text-2xl">⚠️</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">¡Error!</h1>
      <p className="text-gray-600 mb-4">Algo salió mal. Por favor, intenta recargar la página.</p>
      
      <details className="text-left mb-6 bg-gray-50 rounded-lg p-3">
        <summary className="cursor-pointer text-sm font-medium text-gray-700">Detalles del error</summary>
        <pre className="text-xs mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-40">
          {error.stack || error.message}
        </pre>
      </details>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={resetError}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-xl transition-all"
        >
          Reintentar
        </button>
        <button
          onClick={() => window.location.reload()}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-xl transition-all"
        >
          Recargar
        </button>
      </div>
    </div>
  </div>
)

// Error Boundary mejorado
class AppErrorBoundary extends React.Component {
  state = { hasError: false, error: null }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error Boundary:', error, errorInfo)
    // Aquí podrías enviar el error a un servicio de tracking
  }
  
  resetError = () => this.setState({ hasError: false, error: null })
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} resetError={this.resetError} />
    }
    return this.props.children
  }
}

// Layout protegido mejorado
const ProtectedLayout = () => (
  <div className="flex flex-col min-h-screen">
    <NavBar />
    <main className="flex-grow p-4 md:p-6 bg-gray-50">
      <Outlet />
    </main>
    {/* Aquí podrías añadir un footer si lo necesitas */}
  </div>
)

// Componente principal App
const App = () => {
  const [authChecked, setAuthChecked] = React.useState(false)
  const [token, setToken] = React.useState(null)

  // Verificar autenticación al montar el componente
  React.useEffect(() => {
    const storedToken = localStorage.getItem('token')
    setToken(storedToken)
    setAuthChecked(true)
  }, [])

  if (!authChecked) {
    return <LoadingSpinner />
  }

  return (
    <AppErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Ruta raíz redirige a /auth o /catalogo según autenticación */}
          <Route path="/" element={
            token ? <Navigate to="/catalogo" replace /> : <Navigate to="/auth" replace />
          } />

          {/* Rutas públicas */}
          <Route path="/auth/*" element={<AuthApp />} />

          {/* Rutas protegidas */}
          <Route element={<ProtectedLayout />}>
            {token ? (
              <>
                <Route path="encargo" element={<Encargo />} />
                <Route path="catalogo" element={<Catalogo />} />
                <Route path="carrito" element={<CarritoDeCompras />} />
                <Route path="contacto" element={<Contacto />} />
                <Route path="acerca" element={<Acerca />} />
                <Route path="perfil" element={<UserProfile />} /> {/* Mantenemos la ruta 'perfil' pero usando el componente UserProfile */}
                
                {/* Redirección para rutas desconocidas */}
                <Route path="*" element={<Navigate to="/catalogo" replace />} />
              </>
            ) : (
              // Si no hay token pero se intenta acceder a ruta protegida
              <Route path="*" element={<Navigate to="/auth" replace />} />
            )}
          </Route>
        </Routes>
      </Suspense>
    </AppErrorBoundary>
  )
}

export default App