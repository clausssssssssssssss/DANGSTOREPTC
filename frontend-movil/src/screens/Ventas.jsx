import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const Ventas = ({ navigation, route }) => {
  const period = route?.params?.period || 'week';

  const salesData = {
    week: { total: '$45,200', growth: '+12%', orders: 156 },
    day: { total: '$14,200', growth: '+8%', orders: 45 },
    month: { total: '$142,000', growth: '+15%', orders: 520 },
  };

  const currentData = salesData[period];

  const recentSales = [
    { id: 1, customer: 'Cliente A', amount: '$2,500', status: 'Completada' },
    { id: 2, customer: 'Cliente B', amount: '$1,800', status: 'Pendiente' },
    { id: 3, customer: 'Cliente C', amount: '$3,200', status: 'Completada' },
    { id: 4, customer: 'Cliente D', amount: '$950', status: 'Cancelada' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ventas</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterButtonText}>📊</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          <TouchableOpacity
            style={[styles.periodButton, period === 'day' && styles.activePeriod]}
            onPress={() => navigation.setParams({ period: 'day' })}
          >
            <Text style={[styles.periodText, period === 'day' && styles.activePeriodText]}>
              Hoy
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodButton, period === 'week' && styles.activePeriod]}
            onPress={() => navigation.setParams({ period: 'week' })}
          >
            <Text style={[styles.periodText, period === 'week' && styles.activePeriodText]}>
              Esta Semana
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodButton, period === 'month' && styles.activePeriod]}
            onPress={() => navigation.setParams({ period: 'month' })}
          >
            <Text style={[styles.periodText, period === 'month' && styles.activePeriodText]}>
              Este Mes
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sales Summary */}
        <View style={styles.summaryCard}>
          <LinearGradient
            colors={['#8B5CF6', '#A78BFA']}
            style={styles.summaryGradient}
          >
            <Text style={styles.summaryTitle}>Ventas Totales</Text>
            <Text style={styles.summaryAmount}>{currentData.total}</Text>
            <View style={styles.summaryStats}>
              <Text style={styles.growthText}>{currentData.growth}</Text>
              <Text style={styles.ordersText}>{currentData.orders} órdenes</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>156</Text>
            <Text style={styles.statLabel}>Órdenes</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>$2,890</Text>
            <Text style={styles.statLabel}>Promedio</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>98%</Text>
            <Text style={styles.statLabel}>Satisfacción</Text>
          </View>
        </View>

        {/* Recent Sales */}
        <View style={styles.recentSales}>
          <Text style={styles.sectionTitle}>Ventas Recientes</Text>
          {recentSales.map((sale) => (
            <View key={sale.id} style={styles.saleCard}>
              <View style={styles.saleInfo}>
                <Text style={styles.customerName}>{sale.customer}</Text>
                <Text style={styles.saleAmount}>{sale.amount}</Text>
              </View>
              <View style={[
                styles.statusBadge,
                { backgroundColor: sale.status === 'Completada' ? '#10B981' : 
                                 sale.status === 'Pendiente' ? '#F59E0B' : '#EF4444' }
              ]}>
                <Text style={styles.statusText}>{sale.status}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>📈 Ver Reporte</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>📋 Nueva Venta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  filterButton: {
    padding: 8,
  },
  filterButtonText: {
    fontSize: 20,
  },
  content: {
    paddingHorizontal: 20,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  activePeriod: {
    backgroundColor: '#8B5CF6',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activePeriodText: {
    color: 'white',
  },
  summaryCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  summaryGradient: {
    padding: 24,
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 16,
    color: 'white',
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  summaryStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  growthText: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: 'bold',
    marginRight: 15,
  },
  ordersText: {
    fontSize: 14,
    color: 'white',
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  recentSales: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
  },
  saleCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  saleInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  saleAmount: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  actionButton: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
});

export default Ventas;
