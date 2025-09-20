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
});

export { MenuStyles };
