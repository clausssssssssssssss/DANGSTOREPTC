import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import VentasTabs from '../components/Ventas/VentasTabs';
import VentasCard from '../components/Ventas/VentasCard';
import VentasChart from '../components/Ventas/VentasChart';
import VentasTable from '../components/Ventas/VentasTable';
import VentasMetasConfig from '../components/Ventas/VentasMetasConfig'; // NUEVO
import { VentasStyles } from '../components/styles/VentasStyles';
import { salesAPI } from '../services/salesReport';
import { metasService } from '../services/metasService'; // NUEVO

const Ventas = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('reporte');
  const [selectedReporte, setSelectedReporte] = useState('mensual');
  
  // NUEVO: Estado para la meta semanal
  const [metaSemanal, setMetaSemanal] = useState(50);
  
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

  // NUEVO: Cargar meta semanal al enfocar la pantalla
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 Pantalla enfocada - Cargando datos...');
      loadMetaSemanal(); // Cargar meta primero
      loadAllData();
    }, [])
  );

  // NUEVO: Función para cargar la meta semanal
  const loadMetaSemanal = async () => {
    try {
      const meta = await metasService.getMetaSemanal();
      console.log('🎯 Meta semanal cargada:', meta);
      setMetaSemanal(meta);
    } catch (error) {
      console.error('Error cargando meta semanal:', error);
      setMetaSemanal(50); // Fallback
    }
  };

  // NUEVO: Función para guardar la meta semanal
  const handleGuardarMeta = async (nuevaMeta) => {
    try {
      const metaAnterior = metaSemanal;
      const success = await metasService.setMetaSemanal(nuevaMeta);
      
      if (success) {
        await metasService.agregarAlHistorial(metaAnterior, nuevaMeta);
        setMetaSemanal(nuevaMeta);
        console.log('✅ Meta actualizada correctamente:', nuevaMeta);
        
        // Mostrar feedback al usuario
        Alert.alert(
          'Meta actualizada',
          `Tu nueva meta semanal es $${nuevaMeta.toFixed(2)}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', 'No se pudo guardar la meta. Intenta de nuevo.');
      }
    } catch (error) {
      console.error('Error guardando meta:', error);
      Alert.alert('Error', 'Ocurrió un error al guardar la meta.');
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        loadSalesData(),
        loadIncomeAndCategoryData(),
        loadLatestSales()
      ]);
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const loadIncomeAndCategoryData = async () => {
    try {
      const dateRange = getDateRange();
      console.log('📅 Consultando datos del', dateRange.start, 'al', dateRange.end);
      
      const incomePromise = salesAPI.getIncomeByDateRange(dateRange.start, dateRange.end);
      const categoryPromise = salesAPI.getSalesByCategory();
      
      const [incomeResult, allCategoriesResult] = await Promise.all([incomePromise, categoryPromise]);
      
      let incomeTotal = 0;
      if (incomeResult) {
        if (incomeResult.total !== undefined) {
          incomeTotal = parseFloat(incomeResult.total) || 0;
        } else if (incomeResult.data && incomeResult.data.total) {
          incomeTotal = parseFloat(incomeResult.data.total) || 0;
        }
      }
      
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
      
      const finalTotal = Math.max(categoryTotal, incomeTotal);
      
      setIncomeData({
        total: finalTotal,
        startDate: dateRange.startDate.toLocaleDateString('es-ES'),
        endDate: dateRange.endDate.toLocaleDateString('es-ES')
      });
      
      setCategoryData(processedCategories);
      
    } catch (err) {
      console.error('❌ Error cargando datos de ingresos/categorías:', err);
      setError('Error al cargar datos de ingresos');
      setIncomeData({ total: 0, startDate: '', endDate: '' });
      setCategoryData([]);
    }
  };

  const loadLatestSales = async () => {
    try {
      console.log('🔍 Cargando últimas ventas...');
      const data = await salesAPI.getLatestSales();
      const salesArray = Array.isArray(data) ? data : [];
      setLatestSalesData(salesArray);
    } catch (err) {
      console.error('❌ Error cargando últimas ventas:', err);
      setLatestSalesData([]);
    }
  };

  const loadSalesData = async () => {
    try {
      const data = await salesAPI.getSalesSummary();
      
      let salesInfo = {
        daily: 0,
        monthly: 0,
        annual: 0
      };
      
      if (data) {
        if (Array.isArray(data.daily) && data.daily.length > 0) {
          salesInfo.daily = parseFloat(data.daily[0].total) || 0;
        }
        if (Array.isArray(data.monthly) && data.monthly.length > 0) {
          salesInfo.monthly = parseFloat(data.monthly[0].total) || 0;
        }
        if (Array.isArray(data.yearly) && data.yearly.length > 0) {
          salesInfo.annual = parseFloat(data.yearly[0].total) || 0;
        }
      }
      
      setSalesData(salesInfo);
    } catch (err) {
      console.error('❌ Error cargando datos de ventas:', err);
      setError('Error al cargar datos de ventas');
    }
  };

  const handleTabPress = (tabId) => {
    setActiveTab(tabId);
  };

  const formatCurrency = (amount) => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return '$0.00';
    
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numAmount);
  };

  const getSelectedAmount = () => {
    switch (selectedReporte) {
      case 'diario': return salesData.daily;
      case 'mensual': return salesData.monthly;
      case 'anual': return salesData.annual;
      default: return salesData.monthly;
    }
  };

  const renderReporteContent = () => (
    <>
      <View style={VentasStyles.cardsContainer}>
        <View style={VentasStyles.cardWrapper}>
          <TouchableOpacity onPress={() => setSelectedReporte('diario')} activeOpacity={0.7}>
            <VentasCard 
              title="Ventas Diarias" 
              amount={formatCurrency(salesData.daily)}
              isActive={selectedReporte === 'diario'} 
            />
          </TouchableOpacity>
        </View>
        
        <View style={VentasStyles.cardWrapper}>
          <TouchableOpacity onPress={() => setSelectedReporte('mensual')} activeOpacity={0.7}>
            <VentasCard 
              title="Ventas Mensuales" 
              amount={formatCurrency(salesData.monthly)}
              isActive={selectedReporte === 'mensual'} 
            />
          </TouchableOpacity>
        </View>
        
        <View style={VentasStyles.cardWrapper}>
          <TouchableOpacity onPress={() => setSelectedReporte('anual')} activeOpacity={0.7}>
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
        <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={VentasStyles.chartScrollContent}>
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
            onPress={loadIncomeAndCategoryData}
            style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#007AFF', borderRadius: 6 }}
          >
            <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>Actualizar</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={VentasStyles.ingresosDate}>{incomeData.startDate} - {incomeData.endDate}</Text>
        
        <View style={VentasStyles.ingresosTotal}>
          <Text style={VentasStyles.ingresosTotalLabel}>Ingresos Totales (Últimos 30 días)</Text>
          <Text style={VentasStyles.ingresosTotalAmount}>{formatCurrency(incomeData.total)}</Text>
        </View>
      </View>
      
      <View style={VentasStyles.chartContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={VentasStyles.chartScrollContent}>
          <VentasChart tipo="ingresos" data={categoryData} />
        </ScrollView>
      </View>
    </>
  );

  const renderPedidosContent = () => (
    <>
      <View style={VentasStyles.pedidosHeader}>
        <Text style={VentasStyles.pedidosTitle}>Últimos Pedidos</Text>
        <Text style={VentasStyles.pedidosDate}>{latestSalesData.length} pedidos encontrados</Text>
      </View>
      <VentasTable data={latestSalesData} />
      <TouchableOpacity 
        style={{ margin: 20, padding: 15, backgroundColor: '#007AFF', borderRadius: 8, alignItems: 'center' }}
        onPress={loadLatestSales}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>Actualizar Pedidos</Text>
      </TouchableOpacity>
    </>
  );

  // NUEVO: Render del contenido de Metas
  const renderMetasContent = () => (
    <VentasMetasConfig 
      metaActual={metaSemanal}
      onGuardarMeta={handleGuardarMeta}
    />
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
          <Text style={{ color: 'red', textAlign: 'center', margin: 20 }}>{error}</Text>
          <TouchableOpacity 
            style={{ padding: 10, backgroundColor: '#007AFF', borderRadius: 5 }}
            onPress={loadAllData}
          >
            <Text style={{ color: 'white' }}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    switch (activeTab) {
      case 'reporte': return renderReporteContent();
      case 'ingresos': return renderIngresosContent();
      case 'pedidos': return renderPedidosContent();
      case 'metas': return renderMetasContent(); // NUEVO
      default: return renderReporteContent();
    }
  };

  return (
    <SafeAreaView style={VentasStyles.container}>
      <View style={VentasStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={VentasStyles.backButtonContainer}>
          <Text style={VentasStyles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={VentasStyles.headerTitle}>
          {activeTab === 'reporte' && 'Tus ventas'}
          {activeTab === 'ingresos' && 'Ingresos por Productos'}
          {activeTab === 'pedidos' && 'Últimos Pedidos'}
          {activeTab === 'metas' && 'Configurar Metas'}
        </Text>
        <View style={VentasStyles.placeholder} />
      </View>

      {/* ACTUALIZAR: Ahora VentasTabs debe incluir la nueva pestaña "metas" */}
      <VentasTabs activeTab={activeTab} onTabPress={handleTabPress} />

      <ScrollView style={VentasStyles.content} showsVerticalScrollIndicator={false}>
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Ventas;