import { StyleSheet } from 'react-native';

const NotificacionesStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 10,
  },

  // Header Styles
  header: {
    backgroundColor: '#8B5CF6',
    paddingTop: 60,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 15,
  },
  
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  headerButton: {
    marginLeft: 15,
  },
  
  badgeContainer: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Stats Card
  statsCard: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 10,
  },

  // Filters
  filtersContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  
  activeFilter: {
    backgroundColor: '#8B5CF6',
  },
  
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  
  activeFilterText: {
    color: 'white',
  },

  // Notifications List
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  
  notificationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
  
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  
  cardContent: {
    flex: 1,
  },
  
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  
  cardMessage: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  
  customerName: {
    fontSize: 13,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  
  modelType: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  
  cardActions: {
    alignItems: 'center',
  },
  
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8B5CF6',
    marginBottom: 8,
  },
  
  deleteButton: {
    padding: 4,
  },
  
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10B981',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  
  bottomPadding: {
    height: 20,
  },
});

export { NotificacionesStyles };
