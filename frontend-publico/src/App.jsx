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