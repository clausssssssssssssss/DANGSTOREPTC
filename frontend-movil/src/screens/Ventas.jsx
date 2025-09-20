import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import VentasTabs from '../components/Ventas/VentasTabs';
import VentasCard from '../components/Ventas/VentasCard';
import VentasChart from '../components/Ventas/VentasChart';
import VentasTable from '../components/Ventas/VentasTable';
import { VentasStyles } from '../components/styles/VentasStyles';
import { salesAPI } from '../services/salesReport'; // 👈 Importar tu API

const Ventas = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('reporte');
  const [selectedReporte, setSelectedReporte] = useState('mensual');
  
  // 👇 Estados para manejar los datos de la API
  const [salesData, setSalesData] = useState({
    daily: 0,
    monthly: 0,
    annual: 0
  });
  const [incomeData, setIncomeData] = useState({
    total: 0,
    startDate: '',
    endDate: ''
  });
  const [categoryData, setCategoryData] = useState([]); // datos por categorías
  const [latestSalesData, setLatestSalesData] = useState([]); // 👈 NUEVO: últimas 10 ventas
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 👇 useEffect para cargar datos cuando se monta el componente
  useEffect(() => {
    loadSalesData();
    loadIncomeData();
    loadCategoryData();
    loadLatestSales(); // 👈 NUEVO: cargar últimas ventas
  }, []);

  // 👇 NUEVA: Función para cargar las últimas 10 ventas
  const loadLatestSales = async () => {
    try {
      console.log('🔍 Iniciando carga de últimas ventas...');
      console.log('🔍 URL de API:', `${process.env.EXPO_PUBLIC_API_URL || "https://dangstoreptc.onrender.com/api"}/sales/latest`);
      
      const data = await salesAPI.getLatestSales();
      
      // 🔍 DEBUGGING MEJORADO: Ver datos de las últimas ventas
      console.log('🛒 Respuesta completa de últimas ventas:', data);
      console.log('🛒 Tipo de respuesta:', typeof data);
      console.log('🛒 Es array?', Array.isArray(data));
      console.log('🛒 Cantidad de ventas:', data?.length || 0);
      
      if (Array.isArray(data) && data.length > 0) {
        console.log('🛒 Primera venta completa:', JSON.stringify(data[0], null, 2));
        console.log('🛒 Campos disponibles:', Object.keys(data[0] || {}));
      }
      
      // Asegurarse de que sea un array
      const salesArray = Array.isArray(data) ? data : [];
      console.log('🛒 Array final para setLatestSalesData:', salesArray.length, 'items');
      
      setLatestSalesData(salesArray);
      
    } catch (err) {
      console.error('❌ Error cargando últimas ventas:', err);
      console.error('❌ Stack trace:', err.stack);
      setLatestSalesData([]); // Array vacío en caso de error
    }
  };

  // 👇 Función para cargar resumen de ventas (sin cambios)
  const loadSalesData = async () => {
    try {
      setLoading(true);
      const data = await salesAPI.getSalesSummary();
      
      console.log('📊 Datos completos de getSalesSummary:', JSON.stringify(data, null, 2));
      
      let salesInfo = {
        daily: 0,
        monthly: 0,
        annual: 0
      };
      
      if (data) {
        if (Array.isArray(data.daily) && data.daily.length > 0) {
          const latestDay = data.daily[0];
          salesInfo.daily = parseFloat(latestDay.total) || 0;
        }
        
        if (Array.isArray(data.monthly) && data.monthly.length > 0) {
          const latestMonth = data.monthly[0];
          salesInfo.monthly = parseFloat(latestMonth.total) || 0;
        }
        
        if (Array.isArray(data.yearly) && data.yearly.length > 0) {
          const latestYear = data.yearly[0];
          salesInfo.annual = parseFloat(latestYear.total) || 0;
        }
      }
      
      console.log('📊 Datos procesados:', salesInfo);
      setSalesData(salesInfo);
      setError(null);
    } catch (err) {
      console.error('❌ Error cargando datos de ventas:', err);
      setError('Error al cargar datos de ventas');
    } finally {
      setLoading(false);
    }
  };

  // 👇 Función para cargar datos de ingresos (sin cambios)
  const loadIncomeData = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      const formatDate = (date) => {
        return date.toISOString().split('T')[0];
      };
      
      const data = await salesAPI.getIncomeByDateRange(
        formatDate(startDate), 
        formatDate(endDate)
      );
      
      console.log('💰 Datos de ingresos completos:', JSON.stringify(data, null, 2));
      
      let total = 0;
      
      if (data) {
        if (data.total !== undefined) {
          total = parseFloat(data.total) || 0;
        } else if (data.data && data.data.total) {
          total = parseFloat(data.data.total) || 0;
        } else if (data.income) {
          total = parseFloat(data.income) || 0;
        } else if (data.ingresos) {
          total = parseFloat(data.ingresos) || 0;
        } else if (Array.isArray(data)) {
          total = data.reduce((sum, item) => {
            return sum + (parseFloat(item.monto || item.amount || item.total || 0));
          }, 0);
        }
      }
      
      console.log('💰 Total procesado:', total);
      
      setIncomeData({
        total: total,
        startDate: startDate.toLocaleDateString('es-ES'),
        endDate: endDate.toLocaleDateString('es-ES')
      });
      
    } catch (err) {
      console.error('❌ Error cargando datos de ingresos:', err);
      setError('Error al cargar datos de ingresos');
    }
  };

  // 👇 Función para cargar datos por categorías (sin cambios)
  const loadCategoryData = async () => {
    try {
      const data = await salesAPI.getSalesByCategory();
      
      console.log('📂 Datos por categorías completos:', JSON.stringify(data, null, 2));
      
      let categories = [];
      if (Array.isArray(data)) {
        categories = data.map(item => ({
          name: item.categoria || item.category || item.name || 'Sin categoría',
          total: parseFloat(item.total || item.amount || item.monto || 0),
          count: parseInt(item.count || item.cantidad || 0)
        }));
      } else if (data && typeof data === 'object') {
        categories = Object.entries(data).map(([key, value]) => ({
          name: key,
          total: parseFloat(value) || 0,
          count: 0
        }));
      }
      
      console.log('📂 Categorías procesadas:', categories);
      setCategoryData(categories);
      
    } catch (err) {
      console.error('❌ Error cargando datos de categorías:', err);
      setCategoryData([]);
    }
  };

  const handleTabPress = (tabId) => {
    setActiveTab(tabId);
  };

  // 👇 Función para formatear números como moneda (sin cambios)
  const formatCurrency = (amount) => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) {
      console.log('⚠️ Valor inválido para formatCurrency:', amount, 'tipo:', typeof amount);
      return '$0.00';
    }
    
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numAmount);
    
    return `${formatted}`;
  };

  // 👇 Función para obtener el monto según el reporte seleccionado (sin cambios)
  const getSelectedAmount = () => {
    switch (selectedReporte) {
      case 'diario':
        return salesData.daily;
      case 'mensual':
        return salesData.monthly;
      case 'anual':
        return salesData.annual;
      default:
        return salesData.monthly;
    }
  };

  const renderReporteContent = () => (
    <>
      <View style={VentasStyles.cardsContainer}>
        <View style={VentasStyles.cardWrapper}>
          <TouchableOpacity 
            onPress={() => setSelectedReporte('diario')}
            activeOpacity={0.7}
          >
            <VentasCard 
              title="Ventas Diarias" 
              amount={formatCurrency(salesData.daily)}
              isActive={selectedReporte === 'diario'} 
            />
          </TouchableOpacity>
        </View>
        
        <View style={VentasStyles.cardWrapper}>
          <TouchableOpacity 
            onPress={() => setSelectedReporte('mensual')}
            activeOpacity={0.7}
          >
            <VentasCard 
              title="Ventas Mensuales" 
              amount={formatCurrency(salesData.monthly)}
              isActive={selectedReporte === 'mensual'} 
            />
          </TouchableOpacity>
        </View>
        
        <View style={VentasStyles.cardWrapper}>
          <TouchableOpacity 
            onPress={() => setSelectedReporte('anual')}
            activeOpacity={0.7}
          >
            <VentasCard 
              title="Ventas Anuales" 
              amount={formatCurrency(salesData.annual)}
              isActive={selectedReporte === 'anual'} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Total simplificado */}
      <View style={VentasStyles.totalContainer}>
        <Text style={VentasStyles.totalLabel}>Reporte seleccionado: {selectedReporte}</Text>
        <Text style={VentasStyles.totalAmount}>{formatCurrency(getSelectedAmount())}</Text>
      </View>

      {/* Contenedor de la Gráfica con scroll horizontal */}
      <View style={VentasStyles.chartContainer}>
        <ScrollView 
          horizontal={true}
          showsHorizontalScrollIndicator={true}
          scrollIndicatorInsets={{ bottom: 2 }}
          contentContainerStyle={VentasStyles.chartScrollContent}
        >
          <VentasChart tipo={selectedReporte} data={salesData} />
        </ScrollView>
      </View>
    </>
  );

  const renderIngresosContent = () => (
    <>
      <View style={VentasStyles.ingresosHeader}>
        <Text style={VentasStyles.ingresosTitle}>Ingresos por Categorías</Text>
        <Text style={VentasStyles.ingresosDate}>
          {incomeData.startDate} - {incomeData.endDate}
        </Text>
        <View style={VentasStyles.ingresosTotal}>
          <Text style={VentasStyles.ingresosTotalLabel}>Ingresos Totales (Últimos 30 días)</Text>
          <Text style={VentasStyles.ingresosTotalAmount}>
            {formatCurrency(incomeData.total)}
          </Text>
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
          <VentasChart tipo="ingresos" data={categoryData} />
        </ScrollView>
      </View>
    </>
  );

  // 👇 ACTUALIZADO: Pasar los datos reales a VentasTable
  const renderPedidosContent = () => (
    <>
      <View style={VentasStyles.pedidosHeader}>
        <Text style={VentasStyles.pedidosTitle}>Últimos Pedidos</Text>
        <Text style={VentasStyles.pedidosDate}>
          {latestSalesData.length} pedidos encontrados
        </Text>
        <Text style={VentasStyles.pedidosFilter}>
          {latestSalesData.length > 0 ? 'Datos de la base de datos' : 'Sin datos reales - mostrando ejemplo'}
        </Text>
      </View>
      {/* 👇 IMPORTANTE: Pasar los datos reales a VentasTable */}
      <VentasTable data={latestSalesData} />
      
      {/* 👇 Botón para recargar datos manualmente */}
      {__DEV__ && (
        <TouchableOpacity 
          style={{ 
            margin: 20, 
            padding: 15, 
            backgroundColor: '#007AFF', 
            borderRadius: 8,
            alignItems: 'center'
          }}
          onPress={loadLatestSales}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>
            🔄 Recargar Últimas Ventas (Debug)
          </Text>
        </TouchableOpacity>
      )}
    </>
  );

  const renderContent = () => {
    // 👇 Mostrar loading mientras cargan los datos
    if (loading) {
      return (
        <View style={[VentasStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={{ marginTop: 10, color: '#666' }}>Cargando datos...</Text>
        </View>
      );
    }

    // 👇 Mostrar error si hay problemas
    if (error) {
      return (
        <View style={[VentasStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: 'red', textAlign: 'center', margin: 20 }}>
            {error}
          </Text>
          <TouchableOpacity 
            style={{ padding: 10, backgroundColor: '#007AFF', borderRadius: 5 }}
            onPress={() => {
              loadSalesData();
              loadIncomeData();
              loadCategoryData();
              loadLatestSales(); // 👈 AGREGADO: recargar últimas ventas también
            }}
          >
            <Text style={{ color: 'white' }}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // 👇 Renderizar contenido según tab activo
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
          {activeTab === 'pedidos' && 'Últimos Pedidos'}
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