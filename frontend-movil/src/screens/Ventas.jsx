import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import VentasTabs from '../components/Ventas/VentasTabs';
import VentasCard from '../components/Ventas/VentasCard';
import VentasChart from '../components/Ventas/VentasChart';
import VentasTable from '../components/Ventas/VentasTable';
import { VentasStyles } from '../components/styles/VentasStyles';

const Ventas = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('reporte');
  const [selectedReporte, setSelectedReporte] = useState('mensual'); // 👈 Nuevo estado

  const handleTabPress = (tabId) => {
    setActiveTab(tabId);
  };

const renderReporteContent = () => (
  <>
    {/* Cards de totales */}
    <View style={VentasStyles.cardsContainer}>
      <View style={VentasStyles.cardWrapper}>
        <TouchableOpacity onPress={() => setSelectedReporte('diario')}>
          <VentasCard title="Ventas Diarias" amount="150.00" isActive={selectedReporte === 'diario'} />
        </TouchableOpacity>
      </View>
      
      <View style={VentasStyles.cardWrapper}>
        <TouchableOpacity onPress={() => setSelectedReporte('mensual')}>
          <VentasCard title="Ventas Mensuales" amount="150.00" isActive={selectedReporte === 'mensual'} />
        </TouchableOpacity>
      </View>
      
      <View style={VentasStyles.cardWrapper}>
        <TouchableOpacity onPress={() => setSelectedReporte('anual')}>
          <VentasCard title="Ventas Anuales" amount="150.00" isActive={selectedReporte === 'anual'} />
        </TouchableOpacity>
      </View>
    </View>

    {/* Filtros */}
    <View style={VentasStyles.filtersContainer}>
      <TouchableOpacity style={VentasStyles.filterButton}>
        <Text style={VentasStyles.filterText}>Categorías</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[VentasStyles.filterButton, VentasStyles.activeFilter]}>
        <Text style={[VentasStyles.filterText, VentasStyles.activeFilterText]}>Productos</Text>
      </TouchableOpacity>
    </View>

    {/* Total */}
    <View style={VentasStyles.totalContainer}>
      <Text style={VentasStyles.totalLabel}>Reporte seleccionado: {selectedReporte}</Text>
      <Text style={VentasStyles.totalAmount}>$1500</Text>
    </View>

    {/* Contenedor de la Gráfica con scroll horizontal */}
    <View style={VentasStyles.chartContainer}>
      <ScrollView 
        horizontal={true}
        showsHorizontalScrollIndicator={true}
        scrollIndicatorInsets={{ bottom: 2 }}
        contentContainerStyle={VentasStyles.chartScrollContent}
      >
        <VentasChart tipo={selectedReporte} />
      </ScrollView>
    </View>
  </>
);

  const renderIngresosContent = () => (
  <>
    <View style={VentasStyles.ingresosHeader}>
      <Text style={VentasStyles.ingresosTitle}>Ingresos por Productos</Text>
      <Text style={VentasStyles.ingresosDate}>15/05/2025 - 20/05/2025</Text>
      <View style={VentasStyles.ingresosTotal}>
        <Text style={VentasStyles.ingresosTotalLabel}>Ingresos Totales</Text>
        <Text style={VentasStyles.ingresosTotalAmount}>$0.00000</Text>
      </View>
    </View>
    
    {/* Gráfica con scroll horizontal */}
    <View style={VentasStyles.chartContainer}>
      <ScrollView 
        horizontal={true}
        showsHorizontalScrollIndicator={true}
        scrollIndicatorInsets={{ bottom: 2 }}
        contentContainerStyle={VentasStyles.chartScrollContent}
      >
        <VentasChart tipo="ingresos" />
      </ScrollView>
    </View>
  </>
);

  const renderPedidosContent = () => (
    <>
      <View style={VentasStyles.pedidosHeader}>
        <Text style={VentasStyles.pedidosTitle}>Estados</Text>
        <Text style={VentasStyles.pedidosDate}>15/05/2025 - 20/05/2025</Text>
        <Text style={VentasStyles.pedidosFilter}>Pendientes</Text>
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
    <SafeAreaView style={VentasStyles.container}>
      {/* Header */}
      <View style={VentasStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={VentasStyles.backButton}>‹</Text>
        </TouchableOpacity>
        <Text style={VentasStyles.headerTitle}>
          {activeTab === 'reporte' && 'Tus ventas'}
          {activeTab === 'ingresos' && 'Ingresos por Productos'}
          {activeTab === 'pedidos' && 'Estados'}
        </Text>
      </View>

      {/* Tabs */}
      <VentasTabs activeTab={activeTab} onTabPress={handleTabPress} />

      {/* Content */}
      <ScrollView style={VentasStyles.content} showsVerticalScrollIndicator={false}>
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
};


export default Ventas;
