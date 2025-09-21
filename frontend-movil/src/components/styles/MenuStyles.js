import { StyleSheet } from 'react-native';

const MenuStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e6e0f8',
    padding: 20,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  bell: {
    fontSize: 28,
    marginRight: 5,
  },
  hola: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#4b3ca7',
    marginTop: 10,
    marginBottom: 2,
    textAlign: 'left',
  },
  buenosDias: {
    fontSize: 16,
    color: '#7d6fc2',
    marginBottom: 18,
    textAlign: 'left',
  },
  card: {
    backgroundColor: '#d1c4e9',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },
  cardTitle: {
    color: '#6c5ce7',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  percent: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4b3ca7',
  },
  verBtn: {
    backgroundColor: '#b39ddb',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 18,
  },
  verBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statCard: {
    backgroundColor: '#b3c6f7',
    borderRadius: 14,
    padding: 14,
    width: '48%',
    alignItems: 'center',
  },
  statTitle: {
    color: '#6c5ce7',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4b3ca7',
  },
  pendientes: {
    fontWeight: 'bold',
    color: '#4b3ca7',
    fontSize: 16,
    marginTop: 10,
    marginBottom: 6,
  },
  ordenesCard: {
    backgroundColor: '#d1c4e9',
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    marginBottom: 18,
  },
  ordenesText: {
    color: '#6c5ce7',
    fontWeight: 'bold',
    fontSize: 15,
  },
  ordenesRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ordenesNumber: {
    fontWeight: 'bold',
    color: '#4b3ca7',
    fontSize: 18,
    marginRight: 6,
  },
  warning: {
    fontSize: 18,
    marginRight: 6,
  },
  verToda: {
    color: '#6c5ce7',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    fontSize: 14,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#ede7f6',
    borderRadius: 18,
    paddingVertical: 10,
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 10,
  },
  navIcon: {
    fontSize: 28,
    color: '#b39ddb',
  },
  activeNav: {
    color: '#6c5ce7',
    fontWeight: 'bold',
  },
  // Estilos para órdenes recientes
  recentOrdersContainer: {
    marginTop: 20,
  },
  recentOrdersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  recentOrdersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3436',
  },
  verTodasText: {
    fontSize: 14,
    color: '#6c5ce7',
    fontWeight: '600',
  },
  recentOrderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recentOrderInfo: {
    flex: 1,
  },
  recentOrderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3436',
    marginBottom: 4,
  },
  recentOrderDate: {
    fontSize: 12,
    color: '#636e72',
  },
  recentOrderStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentOrderStatusText: {
    fontSize: 12,
    color: '#fdcb6e',
    backgroundColor: '#fff3e0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  recentOrderArrow: {
    fontSize: 18,
    color: '#636e72',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#636e72',
  },
  emptyOrdersContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyOrdersText: {
    fontSize: 14,
    color: '#636e72',
    fontStyle: 'italic',
  },
  // Estilos para indicador de tiempo real
  titleContainer: {
    flexDirection: 'column',
  },
  realTimeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  realTimeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00b894',
    marginRight: 4,
  },
  realTimeText: {
    fontSize: 10,
    color: '#00b894',
    fontWeight: '500',
  },
});

export { MenuStyles };
