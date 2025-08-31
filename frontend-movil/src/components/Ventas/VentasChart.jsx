import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

const VentasChart = () => {
  const screenWidth = Dimensions.get('window').width;
  
  const data = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Sep', 'Nov'],
    datasets: [
      {
        data: [4000, 4500, 6000, 8000, 7500, 9000, 8500, 7000, 8500],
        color: () => '#8B7CF6', // Ventas Diarias (morado)
      },
      {
        data: [3000, 3500, 5000, 7000, 6500, 8000, 7500, 6000, 7500],
        color: () => '#34D399', // Ventas Mensuales (verde)
      }
    ],
  };

  const chartConfig = {
    backgroundColor: '#FFF',
    backgroundGradientFrom: '#FFF',
    backgroundGradientTo: '#FFF',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(139, 124, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(102, 102, 102, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: '#F0F0F0',
      strokeWidth: 1,
    },
    barPercentage: 0.7,
    groupSpacing: 0.1,
  };

  return (
    <View style={styles.container}>
      <BarChart
        data={data}
        width={screenWidth - 40}
        height={220}
        chartConfig={chartConfig}
        verticalLabelRotation={0}
        showValuesOnTopOfBars={false}
        fromZero={true}
        style={styles.chart}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chart: {
    borderRadius: 16,
  },
});

export default VentasChart;