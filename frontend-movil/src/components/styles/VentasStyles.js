import { StyleSheet, Dimensions } from 'react-native';

// Obtener dimensiones de la pantalla para hacer diseño responsive
const { width: screenWidth } = Dimensions.get('window');

const VentasStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8B7CF6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    fontSize: 24,
    color: '#FFF',
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  content: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 20,
  },
  
  // 🔧 MEJORADO: Container de cards más robusto
  cardsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16, // Reducido para más espacio
    marginBottom: 20,
    justifyContent: 'space-between',
    alignItems: 'stretch', // Cambio de 'center' a 'stretch' para altura uniforme
  },
  
  // 🔧 MEJORADO: Card wrapper más flexible
  cardWrapper: {
    flex: 1,
    marginHorizontal: 6, // Espacio uniforme entre cards
    minWidth: (screenWidth - 64) / 3, // Ancho mínimo calculado: (ancho pantalla - margenes) / 3 cards
    maxWidth: (screenWidth - 64) / 3, // Ancho máximo igual al mínimo para consistencia
  },
  
  // 🆕 NUEVO: Estilos adicionales para cards responsive
  cardWrapperSmall: {
    // Para números pequeños - más compacto
    minHeight: 80,
  },
  
  cardWrapperLarge: {
    // Para números grandes - más espacio
    minHeight: 100,
  },

  filtersContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    flexWrap: 'wrap', // 🔧 AGREGADO: Permite que los filtros se envuelvan si no caben
  },
  filterButton: {
    backgroundColor: '#E8E4FF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    marginBottom: 8, // 🔧 AGREGADO: Espacio vertical para cuando se envuelven
  },
  activeFilter: {
    backgroundColor: '#8B7CF6',
    // 🔧 AGREGADO: Mejor feedback visual
    shadowColor: '#8B7CF6',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500', // 🔧 AGREGADO: Mejor legibilidad
  },
  activeFilterText: {
    color: '#FFF',
    fontWeight: '600', // 🔧 AGREGADO: Más énfasis cuando activo
  },
  
  totalContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#fdf9f9ff', // 🔧 AGREGADO: Fondo para destacar
    borderRadius: 15,
    padding: 16,
    // 🔧 AGREGADO: Sombra sutil
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2.84,
    elevation: 2,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    // 🔧 AGREGADO: Ajuste automático de tamaño de fuente para números grandes
    flexShrink: 1, // Permite que el texto se encoja si es necesario
  },
  
  // 🔧 MEJORADO: Header de ingresos más limpio
  ingresosHeader: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  ingresosTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  ingresosDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    fontStyle: 'italic', // 🔧 AGREGADO: Estilo más elegante para fecha
  },
  
  // 🔧 MEJORADO: Container de total de ingresos más prominente
  ingresosTotal: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20, // Aumentado de 16 a 20
    alignItems: 'center',
    // 🔧 AGREGADO: Sombra más pronunciada
    shadowColor: '#8B7CF6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6.84,
    elevation: 8,
    // 🔧 AGREGADO: Borde sutil
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  ingresosTotalLabel: {
    fontSize: 15, // Aumentado ligeramente
    color: '#666',
    marginBottom: 8,
    textAlign: 'center', // 🔧 AGREGADO: Centrado
    fontWeight: '500',
  },
  ingresosTotalAmount: {
    fontSize: 24, // Aumentado de 20 a 24
    fontWeight: 'bold',
    color: '#8B7CF6', // 🔧 CAMBIADO: Color del tema en lugar de negro
    textAlign: 'center',
  },
  
  pedidosHeader: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  pedidosTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  pedidosDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    fontStyle: 'italic', // 🔧 AGREGADO: Consistencia con ingresosDate
  },
  pedidosFilter: {
    fontSize: 16,
    color: '#8B7CF6',
    fontWeight: '600', // 🔧 CAMBIADO: de '500' a '600' para mayor énfasis
  },
  
  // 🔧 MEJORADO: Container de chart más robusto
  chartContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#FFF',
    borderRadius: 15,
    paddingVertical: 16,
    // 🔧 MEJORADO: Mejor sombra
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 4.84,
    elevation: 6,
    // 🔧 AGREGADO: Borde sutil
    borderWidth: 1,
    borderColor: '#F5F5F5',
  },
  chartScrollContent: {
    paddingHorizontal: 16,
    minWidth: screenWidth - 40, // 🔧 MEJORADO: Basado en ancho real de pantalla
  },
  
  // 🆕 NUEVOS: Estilos para casos especiales
  
  // Para cuando los números son muy grandes
  largeNumberText: {
    fontSize: 18, // Más pequeño que el normal
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  
  // Para cards con números muy grandes
  compactCard: {
    minHeight: 90,
    justifyContent: 'center',
  },
  
  // Loading state
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  
  // Error state
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 20,
  },
  
  errorText: {
    fontSize: 16,
    color: '#E74C3C',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  
  retryButton: {
    backgroundColor: '#8B7CF6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#8B7CF6',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // 🆕 RESPONSIVE: Estilos para pantallas pequeñas
  '@media (max-width: 350)': {
    cardsContainer: {
      flexDirection: 'column',
    },
    cardWrapper: {
      marginBottom: 12,
      marginHorizontal: 0,
    },
    totalAmount: {
      fontSize: 20,
    },
    ingresosTotalAmount: {
      fontSize: 20,
    },
  },
});

export { VentasStyles };