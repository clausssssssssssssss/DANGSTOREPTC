import { StyleSheet } from 'react-native';

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
  cardsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    justifyContent: 'space-between', 
    alignItems: 'center',
  },
  cardWrapper: {
    flex: 1,
    marginHorizontal: 4,
  },
  filtersContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  filterButton: {
    backgroundColor: '#E8E4FF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
  },
  activeFilter: {
    backgroundColor: '#8B7CF6',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  activeFilterText: {
    color: '#FFF',
  },
  totalContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
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
  },
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
  },
  ingresosTotal: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 16,
    alignItems: 'center',
  },
  ingresosTotalLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  ingresosTotalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
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
  },
  pedidosFilter: {
    fontSize: 16,
    color: '#8B7CF6',
    fontWeight: '500',
  },
  chartContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#FFF',
    borderRadius: 15,
    paddingVertical: 16,
    // Sombra opcional para darle mejor apariencia
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chartScrollContent: {
    paddingHorizontal: 16,
    minWidth: '100%', // Asegura que ocupe al menos todo el ancho disponible
  },
});

export { VentasStyles };
