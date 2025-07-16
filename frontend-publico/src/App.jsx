import React, { Suspense } from 'react'
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import NavBar from './components/ui/navBar'
import AuthApp from './pages/AuthApp'
import Encargo from './pages/Encargo'
import CarritoDeCompras from './pages/CarritoDeCompras'
import Catalogo from './pages/Catalogo'
import Contacto from './pages/Contacto'
import Acerca from './pages/Acerca'
import UserProfile from './pages/UserProfile'
import { AuthProvider, useAuth } from './hooks/useAuth.jsx'
import './App.css'
import { FavoritesProvider } from './context/FavoritesContext.jsx'
// Spinner para carga inicial
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
      <p className="text-white text-lg font-medium">Cargando aplicación...</p>
    </div>
  </div>
)

// Componente que muestra el error si algo falla
const ErrorFallback = ({ error, resetError }) => (
  <div className="min-h-screen bg-gradient-to-br from-red-400 via-red-500 to-red-600 flex items-center justify-center p-4">
    <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-red-600 text-2xl">⚠</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Error de Aplicación</h1>
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

// Layout que envuelve las rutas privadas
function ProtectedLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-grow p-4 md:p-6 bg-gray-50">
        <Outlet />
      </main>
    </div>
  )
}

// redirige “/” ⇒ /auth o /catalogo
function RootRedirect() {
  const { user } = useAuth()
  return user
    ? <Navigate to="/catalogo" replace/>
    : <Navigate to="/auth" replace/>
}

// protege rutas hijas
function PrivateRoute({ children }) {
  const { user } = useAuth()
  console.log('🔒 PrivateRoute sees user:', user);
  const location = useLocation()
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace/>
  }
  return children
}

const App = () => {
  const [authChecked, setAuthChecked] = React.useState(false)
  React.useEffect(() => { setAuthChecked(true) }, [])
  if (!authChecked) return <LoadingSpinner/>

  return (
    <AuthProvider>
      <FavoritesProvider>
      <AppErrorBoundary>
        <Suspense fallback={<LoadingSpinner/>}>
          <Routes>
            {/* 1) exact "/" */}
            <Route path="/" element={<RootRedirect />} />

            {/* 2) "/auth/*" */}
            <Route path="/auth/*" element={<AuthApp />} />

            {/* 3) rutas privadas envueltas por PrivateRoute */}
            <Route element={
              <PrivateRoute>
                <ProtectedLayout/>
              </PrivateRoute>
            }>
              <Route path="encargo"  element={<Encargo />} />
              <Route path="catalogo" element={<Catalogo />} />
              <Route path="carrito"  element={<CarritoDeCompras />} />
              <Route path="contacto" element={<Contacto />} />
              <Route path="acerca"   element={<Acerca />} />
              <Route path="perfil"   element={<UserProfile />} />
            </Route>

            {/* 4) cualquier otra URL */}
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </Suspense>
      </AppErrorBoundary>
      </FavoritesProvider>
    </AuthProvider>
  )
}

export default App
