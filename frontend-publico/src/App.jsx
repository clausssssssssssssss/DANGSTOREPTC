import React, { Suspense } from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import NavBar from './components/ui/navBar'
import AuthApp from './pages/AuthApp'
import Encargo from './pages/Encargo'
import CarritoDeCompras from './pages/CarritoDeCompras'
import Catalogo from './pages/Catalogo'
import Contacto from './pages/Contacto'
import Acerca from './pages/Acerca'
import UserProfile from './pages/UserProfile'
import FormPaymentFake from './pages/formPaymentFake'
import TerminosCondiciones from './pages/TerminosCondiciones'
import { AuthProvider } from './hooks/useAuth'
import { FavoritesProvider } from './context/FavoritesContext'
import { CartProvider } from './context/CartContext'

// Importar estilos globales
import './index.css'
import './components/styles/GlobalComponents.css'
import './styles/scrollbar.css'
import './App.css'

// Spinner para carga inicial
const LoadingSpinner = () => (
  <div className="loading-spinner">
    <div className="spinner spinner-lg"></div>
    <p className="text-center text-lg font-medium mt-md">Cargando aplicación...</p>
  </div>
)

const ErrorFallback = ({ error, resetError }) => (
  <div className="error-boundary">
    <div className="error-content">
      <div className="error-icon">⚠</div>
      <h1 className="text-2xl font-bold mb-md">Error de Aplicación</h1>
      <p className="text-base mb-lg">Algo salió mal. Por favor, intenta recargar la página.</p>
      <details className="error-details">
        <summary>Detalles del error</summary>
        <pre>{error.stack || error.message}</pre>
      </details>
      <div className="error-actions">
        <button onClick={resetError} className="btn-primary">
          Reintentar
        </button>
        <button onClick={() => window.location.reload()} className="btn-secondary">
          Recargar
        </button>
      </div>
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

// Layout principal
function MainLayout() {
  return (
    <div className="App">
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}

const App = () => {
  const [authChecked, setAuthChecked] = React.useState(false)
  
  React.useEffect(() => { 
    setAuthChecked(true) 
  }, [])
  
  if (!authChecked) return <LoadingSpinner />

  return (
    <AuthProvider>
      <FavoritesProvider>
        <CartProvider>
          <AppErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <div className="App">
                <NavBar />
                <Routes>
                  <Route element={<MainLayout />}>
                    <Route path="/" element={<Acerca />} />
                    <Route path="/auth/*" element={<AuthApp />} />
                    <Route path="/encargo" element={<Encargo />} />
                    <Route path="/catalogo" element={<Catalogo />} />
                    <Route path="/carrito" element={<CarritoDeCompras />} />
                    <Route path="/form-payment" element={<FormPaymentFake />} />
                    <Route path="/contacto" element={<Contacto />} />
                    <Route path="/acerca" element={<Acerca />} />
                    <Route path="/perfil" element={<UserProfile />} />
                    <Route path="/terminos" element={<TerminosCondiciones />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Route>
                </Routes>
              </div>
            </Suspense>
          </AppErrorBoundary>
        </CartProvider>
      </FavoritesProvider>
    </AuthProvider>
  )
}

export default App
