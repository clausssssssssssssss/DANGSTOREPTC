import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';

const Pendientes = ({ navigation }) => {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const pendingOrders = [
    {
      id: 1,
      customer: 'Cliente A',
      amount: '$2,500',
      items: 5,
      date: '2024-01-15',
      status: 'Cotizada',
      priority: 'high',
    },
    {
      id: 2,
      customer: 'Cliente B',
      amount: '$1,800',
      items: 3,
      date: '2024-01-14',
      status: 'En revisión',
      priority: 'medium',
    },
    {
      id: 3,
      customer: 'Cliente C',
      amount: '$3,200',
      items: 8,
      date: '2024-01-13',
      status: 'Cotizada',
      priority: 'high',
    },
    {
      id: 4,
      customer: 'Cliente D',
      amount: '$950',
      items: 2,
      date: '2024-01-12',
      status: 'Pendiente',
      priority: 'low',
    },
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#EF4444';
      case 'medium':
        return '#F59E0B';
      case 'low':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Cotizada':
        return '#8B5CF6';
      case 'En revisión':
        return '#F59E0B';
      case 'Pendiente':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const filteredOrders = selectedFilter === 'all' 
    ? pendingOrders 
    : pendingOrders.filter(order => order.status === selectedFilter);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Órdenes Pendientes</Text>
        <TouchableOpacity>
          <Text style={styles.refreshButton}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        <TouchableOpacity
          style={[styles.filterTab, selectedFilter === 'all' && styles.activeFilterTab]}
          onPress={() => setSelectedFilter('all')}
        >
          <Text style={[styles.filterText, selectedFilter === 'all' && styles.activeFilterText]}>
            Todas ({pendingOrders.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, selectedFilter === 'Cotizada' && styles.activeFilterTab]}
          onPress={() => setSelectedFilter('Cotizada')}
        >
          <Text style={[styles.filterText, selectedFilter === 'Cotizada' && styles.activeFilterText]}>
            Cotizadas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, selectedFilter === 'En revisión' && styles.activeFilterTab]}
          onPress={() => setSelectedFilter('En revisión')}
        >
          <Text style={[styles.filterText, selectedFilter === 'En revisión' && styles.activeFilterText]}>
            En Revisión
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.ordersList}>
        {filteredOrders.map((order) => (
          <TouchableOpacity key={order.id} style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <View style={styles.orderInfo}>
                <Text style={styles.customerName}>{order.customer}</Text>
                <Text style={styles.orderDate}>{order.date}</Text>
              </View>
              <View style={styles.orderAmount}>
                <Text style={styles.amountText}>{order.amount}</Text>
                <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(order.priority) }]} />
              </View>
            </View>

            <View style={styles.orderDetails}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Productos:</Text>
                <Text style={styles.detailValue}>{order.items} items</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Estado:</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                  <Text style={styles.statusText}>{order.status}</Text>
                </View>
              </View>
            </View>

            <View style={styles.orderActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Ver Detalles</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, styles.primaryButton]}>
                <Text style={styles.primaryButtonText}>Procesar</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.summaryStats}>
          <Text style={styles.summaryText}>
            Total: {filteredOrders.length} órdenes
          </Text>
          <Text style={styles.summaryText}>
            Valor: ${filteredOrders.reduce((sum, order) => sum + parseInt(order.amount.replace('$', '').replace(',', '')), 0).toLocaleString()}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    fontSize: 24,
    color: '#8B5CF6',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  refreshButton: {
    fontSize: 20,
    color: '#8B5CF6',
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  activeFilterTab: {
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
  ordersList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  orderAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginBottom: 4,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  orderDetails: {
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  primaryButton: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  primaryButtonText: {
    color: 'white',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
});

export default Pendientes;
