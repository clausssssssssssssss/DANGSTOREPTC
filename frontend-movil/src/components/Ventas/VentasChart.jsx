import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text, ActivityIndicator } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { salesAPI } from '../../services/salesReport'; // Usando tu estructura de servicios

const VentasChart = ({ tipo = 'mensual' }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const screenWidth = Dimensions.get('window').width;

  // Función para formatear datos del backend a formato de gráfica
  const formatDataForChart = (data, tipo) => {
    let labels = [];
    let values = [];

    switch (tipo) {
      case 'diario':
        // Formatear datos diarios
        data.daily?.slice(0, 10).reverse().forEach(item => {
          labels.push(`${item._id.day}/${item._id.month}`);
          values.push(item.total);
        });
        break;

      case 'mensual':
        // Formatear datos mensuales
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
                     'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        data.monthly?.slice(0, 12).reverse().forEach(item => {
          labels.push(meses[item._id.month - 1]);
          values.push(item.total);
        });
        break;

      case 'anual':
        // Formatear datos anuales
        data.yearly?.slice(0, 7).reverse().forEach(item => {
          labels.push(item._id.year.toString());
          values.push(item.total);
        });
        break;

      case 'ingresos':
        // Para ingresos por categoría, necesitamos llamar a otro endpoint
        break;

      default:
        labels = ['Sin datos'];
        values = [0];
    }

    return {
      labels: labels.length > 0 ? labels : ['Sin datos'],
      datasets: [{
        data: values.length > 0 ? values : [0],
        color: () => tipo === 'ingresos' ? '#34D399' : '#8B7CF6',
      }]
    };
  };

  // Función para obtener datos de ingresos por categoría
  const fetchIncomeData = async () => {
    try {
      const response = await salesAPI.getSalesByCategory();
      const labels = response.map(item => item._id.slice(0, 6)); // Primeras 6 letras
      const values = response.map(item => item.total);
      
      return {
        labels,
        datasets: [{
          data: values,
          color: () => '#34D399',
        }]
      };
    } catch (error) {
      console.error('Error fetching income data:', error);
      return null;
    }
  };

  // Cargar datos cuando cambie el tipo
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        if (tipo === 'ingresos') {
          // Para ingresos, obtener datos por categoría
          const data = await fetchIncomeData();
          setChartData(data);
        } else {
          // Para ventas diarias, mensuales y anuales
          const response = await salesAPI.getSalesSummary();
          const formattedData = formatDataForChart(response, tipo);
          setChartData(formattedData);
        }
      } catch (err) {
        setError(err.message);
        console.error('Error loading chart data:', err);
        // Datos de fallback en caso de error
        setChartData({
          labels: ['Error'],
          datasets: [{ data: [0], color: () => '#8B7CF6' }]
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [tipo]);

  // Función para obtener título dinámico
  const getChartTitle = () => {
    switch (tipo) {
      case 'diario': return 'Ventas por Día';
      case 'mensual': return 'Ventas por Mes';
      case 'anual': return 'Ventas por Año';
      case 'ingresos': return 'Ingresos por Categoría';
      default: return 'Ventas';
    }
  };

  // Calcular ancho dinámico
  const numberOfBars = chartData?.labels?.length || 1;
  const minBarWidth = 40;
  const calculatedWidth = Math.max(screenWidth - 40, numberOfBars * minBarWidth + 100);

  const chartConfig = {
    backgroundColor: '#FFF',
    backgroundGradientFrom: '#FFF',
    backgroundGradientTo: '#FFF',
    decimalPlaces: 0,
    color: (opacity = 1) => {
      if (tipo === 'ingresos') {
        return `rgba(52, 211, 153, ${opacity})`;
      }
      return `rgba(139, 124, 246, ${opacity})`;
    },
    labelColor: (opacity = 1) => `rgba(102, 102, 102, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: '#F0F0F0',
      strokeWidth: 1,
    },
    propsForLabels: {
      fontSize: 11,
      fontWeight: '500',
    },
    barPercentage: 0.7,
    fillShadowGradient: tipo === 'ingresos' ? '#34D399' : '#8B7CF6',
    fillShadowGradientOpacity: 0.8,
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#8B7CF6" />
        <Text style={styles.loadingText}>Cargando datos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Error al cargar datos</Text>
        <Text style={styles.errorDetail}>{error}</Text>
      </View>
    );
  }

  if (!chartData) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.noDataText}>No hay datos disponibles</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.chartTitle}>{getChartTitle()}</Text>
      <BarChart
        data={chartData}
        width={calculatedWidth}
        height={280}
        chartConfig={chartConfig}
        verticalLabelRotation={tipo === 'diario' ? 30 : 0}
        showValuesOnTopOfBars={false}
        fromZero={true}
        style={styles.chart}
        segments={4}
        withInnerLines={true}
        withOuterLines={false}
        withHorizontalLines={true}
        withVerticalLines={false}
        yAxisLabel="$"
        yAxisSuffix=""
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 10,
    marginVertical: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 320,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  chart: {
    borderRadius: 16,
    marginVertical: 8,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B6B',
    textAlign: 'center',
  },
  errorDetail: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
    textAlign: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default VentasChart;