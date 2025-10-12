import { StyleSheet, Dimensions } from 'react-native';

// Obtener dimensiones de la pantalla para hacer diseño responsive
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Helper function para responsive sizing
const wp = (percentage) => (screenWidth * percentage) / 100;
const hp = (percentage) => (screenHeight * percentage) / 100;

const VentasStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 20,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  backButtonContainer: {
    padding: 12,
  },
  backButton: {
    fontSize: 32,
    color: '#8B5CF6',
    fontWeight: 'bold',
  },
  placeholder: {
    width: 60,
  },
  headerTitle: {
    fontSize: screenWidth < 350 ? 20 : 24,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: 20,
    paddingBottom: 20,
  },
  
  // 🎨 CARDS CONTAINER - Como antes pero mejor tamaño
  cardsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 20,
    justifyContent: 'space-between',
    alignItems: 'stretch',
  },
  
  // 🎨 CARD WRAPPER - Tamaño fijo mejorado
  cardWrapper: {
    flex: 1,
    marginHorizontal: 6,
    minWidth: (screenWidth - 64) / 3,
    maxWidth: (screenWidth - 64) / 3,
  },

  filtersContainer: {
    flexDirection: 'row',
    marginHorizontal: wp(5),
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    backgroundColor: '#E8E4FF',
    borderRadius: 20,
    paddingHorizontal: wp(4),
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  activeFilter: {
    backgroundColor: '#8B7CF6',
    shadowColor: '#8B7CF6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  filterText: {
    fontSize: screenWidth < 350 ? 12 : 14,
    color: '#666',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#FFF',
    fontWeight: '700',
  },
  
  // 🎨 TOTAL CONTAINER - Más destacado
  totalContainer: {
    marginHorizontal: wp(5),
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: wp(5),
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: screenWidth < 350 ? 13 : 14,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '600',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  totalAmount: {
    fontSize: screenWidth < 350 ? 24 : 28,
    fontWeight: '800',
    color: '#8B5CF6',
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(139, 92, 246, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  
  // 🎨 INGRESOS HEADER - Mejor organizado
  ingresosHeader: {
    marginHorizontal: wp(5),
    marginBottom: 20,
  },
  ingresosTitle: {
    fontSize: screenWidth < 350 ? 16 : 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  ingresosDate: {
    fontSize: screenWidth < 350 ? 12 : 14,
    color: '#6B7280',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  
  // 🎨 INGRESOS TOTAL - Más prominente
  ingresosTotal: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: wp(5),
    alignItems: 'center',
    shadowColor: '#8B7CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: 2,
    borderColor: '#F3F0FF',
  },
  ingresosTotalLabel: {
    fontSize: screenWidth < 350 ? 13 : 15,
    color: '#6B7280',
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  ingresosTotalAmount: {
    fontSize: screenWidth < 350 ? 22 : 26,
    fontWeight: '800',
    color: '#8B7CF6',
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(139, 92, 246, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  
  // 🎨 PEDIDOS HEADER
  pedidosHeader: {
    marginHorizontal: wp(5),
    marginBottom: 20,
  },
  pedidosTitle: {
    fontSize: screenWidth < 350 ? 16 : 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  pedidosDate: {
    fontSize: screenWidth < 350 ? 12 : 14,
    color: '#6B7280',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  pedidosFilter: {
    fontSize: screenWidth < 350 ? 14 : 16,
    color: '#8B7CF6',
    fontWeight: '700',
  },
  
  // 🎨 CHART CONTAINER - Mejor presentación
  chartContainer: {
    marginHorizontal: wp(5),
    marginBottom: 24,
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  chartScrollContent: {
    paddingHorizontal: wp(4),
    minWidth: screenWidth - wp(10),
  },
  
  // 🎨 ESTADOS DE CARGA Y ERROR
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingVertical: hp(10),
  },
  
  loadingText: {
    marginTop: 16,
    fontSize: screenWidth < 350 ? 14 : 16,
    color: '#6B7280',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: wp(6),
    paddingVertical: hp(10),
  },
  
  errorText: {
    fontSize: screenWidth < 350 ? 14 : 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
    fontWeight: '500',
  },
  
  retryButton: {
    backgroundColor: '#8B7CF6',
    paddingHorizontal: wp(8),
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: '#8B7CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    minWidth: wp(40),
    alignItems: 'center',
  },
  
  retryButtonText: {
    color: '#FFF',
    fontSize: screenWidth < 350 ? 14 : 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  
  // 🎨 ESTILOS AUXILIARES
  largeNumberText: {
    fontSize: screenWidth < 350 ? 16 : 18,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
  },
  
  compactCard: {
    minHeight: screenWidth < 380 ? 80 : 90,
    justifyContent: 'center',
  },
  
  // 🎨 SECCIÓN ESPECÍFICA - Para pantallas muy pequeñas
  smallScreenAdjustment: {
    fontSize: 12,
    padding: 12,
  },
  
  // 🎨 MEJOR SPACING
  sectionSpacing: {
    marginBottom: 24,
  },
  
  cardSpacing: {
    marginBottom: 12,
  },
});

export { VentasStyles };
