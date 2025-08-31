import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import VentasTabs from '../components/Ventas/VentasTabs';
import VentasCard from '../components/Ventas/VentasCard';
import VentasChart from '../components/Ventas/VentasChart';
import VentasTable from '../components/Ventas/VentasTable';

const Ventas = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('reporte');

  const handleTabPress = (tabId) => {
    setActiveTab(tabId);
  };

  const renderReporteContent = () => (
    <>
      {/* Cards de totales */}
      <View style={styles.cardsContainer}>
        <VentasCard title="Ventas Diarias" amount="150.00" />
        <VentasCard title="Ventas Mensuales" amount="150.00" isActive={true} />
        <VentasCard title="Ventas Anuales" amount="150.00" />
      </View>

      {/* Filtros */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>Categorías</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterButton, styles.activeFilter]}>
          <Text style={[styles.filterText, styles.activeFilterText]}>Productos</Text>
        </TouchableOpacity>
      </View>

      {/* Total */}
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Ventas Diarias</Text>
        <Text style={styles.totalLabel}>Ventas Mensuales</Text>
        <Text style={styles.totalAmount}>$1500000</Text>
      </View>

      {/* Gráfica */}
      <VentasChart />
    </>
  );

  const renderIngresosContent = () => (
    <>
      <View style={styles.ingresosHeader}>
        <Text style={styles.ingresosTitle}>Ingresos por Productos</Text>
        <Text style={styles.ingresosDate}>15/05/2025 - 20/05/2025</Text>
        <View style={styles.ingresosTotal}>
          <Text style={styles.ingresosTotalLabel}>Ingresos Totales</Text>
          <Text style={styles.ingresosTotalAmount}>$0.00000</Text>
        </View>
      </View>
      <VentasChart />
    </>
  );

  const renderPedidosContent = () => (
    <>
      <View style={styles.pedidosHeader}>
        <Text style={styles.pedidosTitle}>Estados</Text>
        <Text style={styles.pedidosDate}>15/05/2025 - 20/05/2025</Text>
        <Text style={styles.pedidosFilter}>Pendientes</Text>
      </View>
      <VentasTable />
    </>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'reporte':
        return renderReporteContent();
      case 'ingresos':
        return renderIngresosContent();
      case 'pedidos':
        return renderPedidosContent();
      default:
        return renderReporteContent();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {activeTab === 'reporte' && 'Tus ventas'}
          {activeTab === 'ingresos' && 'Ingresos por Productos'}
          {activeTab === 'pedidos' && 'Estados'}
        </Text>
      </View>

      {/* Tabs */}
      <VentasTabs activeTab={activeTab} onTabPress={handleTabPress} />

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
});

export default Ventas;