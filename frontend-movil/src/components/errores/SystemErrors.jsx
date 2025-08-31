// =============================================
// DANGSTORE - SISTEMA DE PANTALLAS DE ERRORES
// =============================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Modal,
  Alert,
  Animated,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';

const { width, height } = Dimensions.get('window');

// 
// TIPOS DE ERRORES
// 
const ErrorTypes = {
  NO_INTERNET: 'NO_INTERNET',
  SERVER_ERROR: 'SERVER_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  TIMEOUT: 'TIMEOUT',
  UNAUTHORIZED: 'UNAUTHORIZED',
  MAINTENANCE: 'MAINTENANCE',
  GENERIC: 'GENERIC',
};

// 
// CONTEXTO DE ERRORES GLOBALES
// 
export const ErrorContext = React.createContext();

export function ErrorProvider({ children }) {
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    // Monitorear conexión a internet
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      if (!state.isConnected) {
        setError({
          type: ErrorTypes.NO_INTERNET,
          title: 'Sin conexión a internet',
          message: 'Verifica tu conexión y vuelve a intentar',
        });
      } else if (error?.type === ErrorTypes.NO_INTERNET) {
        setError(null);
      }
    });

    return () => unsubscribe();
  }, [error]);

  const showError = (errorConfig) => {
    setError(errorConfig);
  };

  const hideError = () => {
    setError(null);
  };

  return (
    <ErrorContext.Provider value={{ error, showError, hideError, isConnected }}>
      {children}
      {error && <ErrorScreen error={error} onClose={hideError} />}
    </ErrorContext.Provider>
  );
}

// Hook personalizado para manejar errores
export function useError() {
  const context = React.useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
}

// 
// PANTALLA PRINCIPAL DE ERRORES
// 
export function ErrorScreen({ error, onClose, onRetry }) {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getErrorConfig = (type) => {
    switch (type) {
      case ErrorTypes.NO_INTERNET:
        return {
          icon: 'wifi-outline',
          iconColor: '#FF6B6B',
          title: 'Sin conexión a internet',
          message: 'Verifica tu conexión Wi-Fi o datos móviles y vuelve a intentar.',
          primaryButton: 'Reintentar',
          secondaryButton: 'Configurar Wi-Fi',
          illustration: '📡',
        };
      case ErrorTypes.SERVER_ERROR:
        return {
          icon: 'server-outline',
          iconColor: '#FFA726',
          title: 'Error del servidor',
          message: 'Estamos experimentando problemas técnicos. Intenta nuevamente en unos minutos.',
          primaryButton: 'Reintentar',
          secondaryButton: 'Reportar problema',
          illustration: '⚠️',
        };
      case ErrorTypes.NOT_FOUND:
        return {
          icon: 'search-outline',
          iconColor: '#42A5F5',
          title: 'No encontrado',
          message: 'La página o recurso que buscas no existe o fue movido.',
          primaryButton: 'Ir al inicio',
          secondaryButton: 'Buscar',
          illustration: '🔍',
        };
      case ErrorTypes.TIMEOUT:
        return {
          icon: 'time-outline',
          iconColor: '#AB47BC',
          title: 'Tiempo agotado',
          message: 'La solicitud tardó demasiado en responder. Verifica tu conexión.',
          primaryButton: 'Reintentar',
          secondaryButton: 'Cancelar',
          illustration: '⏱️',
        };
      case ErrorTypes.UNAUTHORIZED:
        return {
          icon: 'lock-closed-outline',
          iconColor: '#EF5350',
          title: 'Acceso denegado',
          message: 'No tienes permisos para acceder a este contenido.',
          primaryButton: 'Iniciar sesión',
          secondaryButton: 'Ir atrás',
          illustration: '🔒',
        };
      case ErrorTypes.MAINTENANCE:
        return {
          icon: 'construct-outline',
          iconColor: '#66BB6A',
          title: 'Mantenimiento',
          message: 'Estamos mejorando DANGSTORE. Volveremos pronto con nuevas funciones.',
          primaryButton: 'Comprobar estado',
          secondaryButton: 'Notificarme',
          illustration: '🔧',
        };
      default:
        return {
          icon: 'alert-circle-outline',
          iconColor: '#FF6B6B',
          title: 'Algo salió mal',
          message: 'Ha ocurrido un error inesperado. Por favor, intenta nuevamente.',
          primaryButton: 'Reintentar',
          secondaryButton: 'Reportar',
          illustration: '❌',
        };
    }
  };

  const config = getErrorConfig(error.type || ErrorTypes.GENERIC);
  const finalConfig = { ...config, ...error };

  const handlePrimaryAction = () => {
    if (onRetry) {
      onRetry();
    } else {
      onClose();
    }
  };

  const handleSecondaryAction = () => {
    switch (error.type) {
      case ErrorTypes.NO_INTERNET:
        // Abrir configuración de Wi-Fi (requiere permisos especiales)
        Alert.alert('Configuración', 'Ve a Ajustes > Wi-Fi para configurar tu conexión');
        break;
      case ErrorTypes.SERVER_ERROR:
        // Reportar problema
        Alert.alert('Reportar', 'Gracias por reportar. Nuestro equipo lo revisará.');
        break;
      case ErrorTypes.UNAUTHORIZED:
        // Ir a login
        Alert.alert('Login', 'Redirigiendo a inicio de sesión...');
        break;
      default:
        onClose();
    }
  };

  return (
    <Modal visible={true} transparent animationType="fade">
      <View style={errorStyles.overlay}>
        <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.7)" />
        <SafeAreaView style={errorStyles.container}>
          <Animated.View 
            style={[
              errorStyles.errorCard,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            {/* Ilustración principal */}
            <View style={errorStyles.illustrationContainer}>
              <Text style={errorStyles.illustration}>{finalConfig.illustration}</Text>
              <View style={[errorStyles.iconContainer, { backgroundColor: finalConfig.iconColor + '20' }]}>
                <Ionicons 
                  name={finalConfig.icon} 
                  size={40} 
                  color={finalConfig.iconColor} 
                />
              </View>
            </View>

            {/* Contenido del error */}
            <View style={errorStyles.content}>
              <Text style={errorStyles.title}>{finalConfig.title}</Text>
              <Text style={errorStyles.message}>{finalConfig.message}</Text>

              {/* Código de error si existe */}
              {error.code && (
                <Text style={errorStyles.errorCode}>Código: {error.code}</Text>
              )}
            </View>

            {/* Botones de acción */}
            <View style={errorStyles.actions}>
              <TouchableOpacity 
                style={[errorStyles.primaryButton, { backgroundColor: finalConfig.iconColor }]}
                onPress={handlePrimaryAction}
                activeOpacity={0.8}
              >
                <Text style={errorStyles.primaryButtonText}>
                  {finalConfig.primaryButton}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={errorStyles.secondaryButton}
                onPress={handleSecondaryAction}
                activeOpacity={0.7}
              >
                <Text style={[errorStyles.secondaryButtonText, { color: finalConfig.iconColor }]}>
                  {finalConfig.secondaryButton}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Botón cerrar */}
            <TouchableOpacity 
              style={errorStyles.closeButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color="#999" />
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

// =============================================
// COMPONENTE DE ERROR INLINE
// =============================================
export function InlineError({ error, onRetry, style }) {
  if (!error) return null;

  return (
    <View style={[errorStyles.inlineContainer, style]}>
      <Ionicons name="alert-circle-outline" size={20} color="#FF6B6B" />
      <Text style={errorStyles.inlineText}>{error.message || 'Error'}</Text>
      {onRetry && (
        <TouchableOpacity onPress={onRetry} style={errorStyles.inlineButton}>
          <Text style={errorStyles.inlineButtonText}>Reintentar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// =============================================
// BOUNDARY DE ERRORES PARA REACT
// =============================================
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error Boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={errorStyles.boundaryContainer}>
          <View style={errorStyles.boundaryContent}>
            <Text style={errorStyles.illustration}>💥</Text>
            <Text style={errorStyles.boundaryTitle}>¡Ups! Algo salió mal</Text>
            <Text style={errorStyles.boundaryMessage}>
              La aplicación encontró un error inesperado.
            </Text>
            <TouchableOpacity 
              style={errorStyles.boundaryButton}
              onPress={() => this.setState({ hasError: false, error: null })}
            >
              <Text style={errorStyles.boundaryButtonText}>Reiniciar</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

// =============================================
// UTILIDADES PARA MANEJAR ERRORES
// =============================================
export class ErrorHandler {
  static handleApiError(error) {
    if (!error.response) {
      return {
        type: ErrorTypes.NO_INTERNET,
        title: 'Sin conexión',
        message: 'Verifica tu conexión a internet',
      };
    }

    const status = error.response.status;
    switch (status) {
      case 400:
        return {
          type: ErrorTypes.GENERIC,
          title: 'Solicitud inválida',
          message: 'Los datos enviados no son válidos',
          code: status,
        };
      case 401:
        return {
          type: ErrorTypes.UNAUTHORIZED,
          title: 'No autorizado',
          message: 'Debes iniciar sesión para continuar',
          code: status,
        };
      case 404:
        return {
          type: ErrorTypes.NOT_FOUND,
          title: 'No encontrado',
          message: 'El recurso solicitado no existe',
          code: status,
        };
      case 408:
        return {
          type: ErrorTypes.TIMEOUT,
          title: 'Tiempo agotado',
          message: 'La solicitud tardó demasiado tiempo',
          code: status,
        };
      case 500:
        return {
          type: ErrorTypes.SERVER_ERROR,
          title: 'Error del servidor',
          message: 'Problemas técnicos temporales',
          code: status,
        };
      case 503:
        return {
          type: ErrorTypes.MAINTENANCE,
          title: 'Servicio no disponible',
          message: 'El servidor está en mantenimiento',
          code: status,
        };
      default:
        return {
          type: ErrorTypes.GENERIC,
          title: 'Error',
          message: 'Ha ocurrido un error inesperado',
          code: status,
        };
    }
  }

  static async withErrorHandling(asyncFunction, errorHandler) {
    try {
      return await asyncFunction();
    } catch (error) {
      const errorConfig = this.handleApiError(error);
      if (errorHandler) {
        errorHandler(errorConfig);
      }
      throw error;
    }
  }
}

// =============================================
// EJEMPLO DE USO
// =============================================
export function ExampleErrorUsage() {
  const { showError } = useError();

  const simulateError = (type) => {
    const errorConfig = {
      type,
      timestamp: new Date().toISOString(),
    };
    showError(errorConfig);
  };

  return (
    <View style={errorStyles.exampleContainer}>
      <Text style={errorStyles.exampleTitle}>Probar Pantallas de Error</Text>
      
      <TouchableOpacity 
        style={errorStyles.testButton}
        onPress={() => simulateError(ErrorTypes.NO_INTERNET)}
      >
        <Text style={errorStyles.testButtonText}>Sin Internet</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={errorStyles.testButton}
        onPress={() => simulateError(ErrorTypes.SERVER_ERROR)}
      >
        <Text style={errorStyles.testButtonText}>Error de Servidor</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={errorStyles.testButton}
        onPress={() => simulateError(ErrorTypes.NOT_FOUND)}
      >
        <Text style={errorStyles.testButtonText}>No Encontrado</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={errorStyles.testButton}
        onPress={() => simulateError(ErrorTypes.MAINTENANCE)}
      >
        <Text style={errorStyles.testButtonText}>Mantenimiento</Text>
      </TouchableOpacity>
    </View>
  );
}

// =============================================
// ESTILOS
// =============================================
const errorStyles = StyleSheet.create({
  // Modal de error
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: width - 40,
    maxWidth: 400,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },

  // Ilustración
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  illustration: {
    fontSize: 60,
    marginBottom: 16,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Contenido
  content: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  errorCode: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    fontFamily: 'monospace',
  },

  // Botones
  actions: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Error inline
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3F3',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
    margin: 8,
  },
  inlineText: {
    flex: 1,
    color: '#D32F2F',
    fontSize: 14,
    marginLeft: 8,
  },
  inlineButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#FF6B6B',
    borderRadius: 4,
  },
  inlineButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },

  // Error Boundary
  boundaryContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  boundaryContent: {
    alignItems: 'center',
  },
  boundaryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  boundaryMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  boundaryButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  boundaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Ejemplo de uso
  exampleContainer: {
    padding: 20,
  },
  exampleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  testButton: {
    backgroundColor: '#8B5CF6',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});