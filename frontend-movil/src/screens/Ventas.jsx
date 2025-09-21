import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native'; // Importar para actualización automática
import VentasTabs from '../components/Ventas/VentasTabs';
import VentasCard from '../components/Ventas/VentasCard';
import VentasChart from '../components/Ventas/VentasChart';
import VentasTable from '../components/Ventas/VentasTable';
import { VentasStyles } from '../components/styles/VentasStyles';
import { salesAPI } from '../services/salesReport';

const Ventas = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('reporte');
  const [selectedReporte, setSelectedReporte] = useState('mensual');
  
  // Estados para manejar los datos de la API
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
  const [categoryData, setCategoryData] = useState([]);
  const [latestSalesData, setLatestSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // NUEVO: Función auxiliar para obtener rango de fechas de los últimos 30 días
  const getDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    const formatDate = (date) => {
      return date.toISOString().split('T')[0];
    };
    
    return {
      start: formatDate(startDate),
      end: formatDate(endDate),
      startDate: startDate,
      endDate: endDate
    };
  };

  // ACTUALIZADO: useEffect reemplazado por useFocusEffect para actualización automática
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 Pantalla enfocada - Cargando datos...');
      loadAllData();
    }, [])
  );

  // NUEVA: Función para cargar todos los datos de una vez
  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        loadSalesData(),
        loadIncomeAndCategoryData(), // Combinamos estas dos para usar el mismo rango
        loadLatestSales()
      ]);
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // ACTUALIZADA: Función combinada para cargar ingresos y categorías con el mismo rango
  const loadIncomeAndCategoryData = async () => {
    try {
      const dateRange = getDateRange();
      
      console.log('📅 Consultando datos del', dateRange.start, 'al', dateRange.end);
      
      // Cargar ingresos por rango
      const incomePromise = salesAPI.getIncomeByDateRange(dateRange.start, dateRange.end);
      
      // Cargar todas las categorías (sin filtro de fecha en el backend)
      const categoryPromise = salesAPI.getSalesByCategory();
      
      const [incomeResult, allCategoriesResult] = await Promise.all([incomePromise, categoryPromise]);
      
      console.log('💰 Datos de ingresos:', JSON.stringify(incomeResult, null, 2));
      console.log('📂 Todas las categorías:', JSON.stringify(allCategoriesResult, null, 2));
      
      // Procesar datos de ingresos
      let incomeTotal = 0;
      if (incomeResult) {
        if (incomeResult.total !== undefined) {
          incomeTotal = parseFloat(incomeResult.total) || 0;
        } else if (incomeResult.data && incomeResult.data.total) {
          incomeTotal = parseFloat(incomeResult.data.total) || 0;
        }
      }
      
      // Procesar categorías - AQUÍ ESTÁ LA CLAVE: calcular total desde las categorías
      let processedCategories = [];
      let categoryTotal = 0;
      
      if (Array.isArray(allCategoriesResult)) {
        processedCategories = allCategoriesResult.map(item => {
          const total = parseFloat(item.total || item.amount || item.monto || 0);
          categoryTotal += total;
          return {
            name: item._id || item.categoria || item.category || item.name || 'Sin categoría',
            total: total,
            count: parseInt(item.count || item.cantidad || 0)
          };
        });
      }
      
      console.log('📊 Total calculado desde categorías:', categoryTotal);
      console.log('💰 Total desde endpoint de ingresos:', incomeTotal);
      
      // IMPORTANTE: Usar el total calculado desde las categorías para mayor consistencia
      // O usar el mayor de los dos si hay discrepancia
      const finalTotal = Math.max(categoryTotal, incomeTotal);
      
      setIncomeData({
        total: finalTotal,
        startDate: dateRange.startDate.toLocaleDateString('es-ES'),
        endDate: dateRange.endDate.toLocaleDateString('es-ES')
      });
      
      setCategoryData(processedCategories);
      
      console.log('✅ Datos actualizados - Total final:', finalTotal);
      
    } catch (err) {
      console.error('❌ Error cargando datos de ingresos/categorías:', err);
      setError('Error al cargar datos de ingresos');
      setIncomeData({
        total: 0,
        startDate: '',
        endDate: ''
      });
      setCategoryData([]);
    }
  };

  // Función para cargar las últimas 10 ventas (sin cambios)
  const loadLatestSales = async () => {
    try {
      console.log('🔍 Cargando últimas ventas...');
      const data = await salesAPI.getLatestSales();
      
      console.log('🛒 Últimas ventas:', data?.length || 0, 'encontradas');
      
      const salesArray = Array.isArray(data) ? data : [];
      setLatestSalesData(salesArray);
      
    } catch (err) {
      console.error('❌ Error cargando últimas ventas:', err);
      setLatestSalesData([]);
    }
  };

  // Función para cargar resumen de ventas (sin cambios)
  const loadSalesData = async () => {
    try {
      const data = await salesAPI.getSalesSummary();
      
      console.log('📊 Datos de resumen de ventas:', JSON.stringify(data, null, 2));
      
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
      
      console.log('📊 Datos de ventas procesados:', salesInfo);
      setSalesData(salesInfo);
      
    } catch (err) {
      console.error('❌ Error cargando datos de ventas:', err);
      setError('Error al cargar datos de ventas');
    }
  };

  const handleTabPress = (tabId) => {
    setActiveTab(tabId);
  };

  // Función para formatear números como moneda
  const formatCurrency = (amount) => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) {
      console.log('⚠️ Valor inválido para formatCurrency:', amount);
      return '$0.00';
    }
    
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numAmount);
    
    return `${formatted}`;
  };

  // Función para obtener el monto según el reporte seleccionado
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

      <View style={VentasStyles.totalContainer}>
        <Text style={VentasStyles.totalLabel}>Reporte seleccionado: {selectedReporte}</Text>
        <Text style={VentasStyles.totalAmount}>{formatCurrency(getSelectedAmount())}</Text>
      </View>

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
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={VentasStyles.ingresosTitle}>Ingresos por Categorías</Text>
          <TouchableOpacity 
            onPress={() => {
              console.log('🔄 Actualizando datos manualmente...');
              loadIncomeAndCategoryData();
            }}
            style={{ 
              paddingHorizontal: 12, 
              paddingVertical: 6, 
              backgroundColor: '#007AFF', 
              borderRadius: 6,
              minWidth: 70,
              alignItems: 'center'
            }}
          >
            <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
              Actualizar
            </Text>
          </TouchableOpacity>
        </View>
        
        <Text style={VentasStyles.ingresosDate}>
          {incomeData.startDate} - {incomeData.endDate}
        </Text>
        
        <View style={VentasStyles.ingresosTotal}>
          <Text style={VentasStyles.ingresosTotalLabel}>
            Ingresos Totales (Últimos 30 días)
          </Text>
          <Text style={VentasStyles.ingresosTotalAmount}>
            {formatCurrency(incomeData.total)}
          </Text>
        </View>
        
        {/* Información adicional para debugging */}
        <Text style={{ fontSize: 10, color: '#666', textAlign: 'center', marginTop: 4 }}>
          Categorías: {categoryData.length} | Última actualización: {new Date().toLocaleTimeString()}
        </Text>
      </View>
      
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

  const renderPedidosContent = () => (
    <>
      <View style={VentasStyles.pedidosHeader}>
        <Text style={VentasStyles.pedidosTitle}>Últimos Pedidos</Text>
        <Text style={VentasStyles.pedidosDate}>
          {latestSalesData.length} pedidos encontrados
        </Text>
        <Text style={VentasStyles.pedidosFilter}>
          {latestSalesData.length > 0 ? 'Datos actualizados de la base' : 'Sin datos - mostrando ejemplo'}
        </Text>
      </View>
      
      <VentasTable data={latestSalesData} />
      
      {/* Botón de actualización manual para pedidos */}
      <TouchableOpacity 
        style={{ 
          margin: 20, 
          padding: 15, 
          backgroundColor: '#007AFF', 
          borderRadius: 8,
          alignItems: 'center'
        }}
        onPress={() => {
          console.log('🔄 Recargando últimas ventas...');
          loadLatestSales();
        }}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>
          Actualizar Pedidos
        </Text>
      </TouchableOpacity>
    </>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={[VentasStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={{ marginTop: 10, color: '#666' }}>Cargando datos...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={[VentasStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: 'red', textAlign: 'center', margin: 20 }}>
            {error}
          </Text>
          <TouchableOpacity 
            style={{ padding: 10, backgroundColor: '#007AFF', borderRadius: 5 }}
            onPress={() => {
              console.log('🔄 Reintentando cargar datos...');
              loadAllData();
            }}
          >
            <Text style={{ color: 'white' }}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      );
    }

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