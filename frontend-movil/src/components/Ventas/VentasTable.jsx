import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const VentasTable = ({ data = [] }) => {
  // 👇 Función para formatear fecha
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  // 👇 Función para formatear moneda
  const formatCurrency = (amount) => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return '$0.00';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(numAmount);
  };

  // 👇 Función para determinar color del estado (puedes ajustar según tu lógica)
  const getStatusColor = (date) => {
    // Por ahora todos los pedidos serán "Confirmado" (verde)
    // Puedes agregar lógica más compleja aquí si tienes un campo de estado en tu modelo
    const daysDiff = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 1) {
      return { color: '#34D399', status: 'Confirmado' }; // Verde para recientes
    } else {
      return { color: '#8B7CF6', status: 'Procesado' }; // Púrpura para más antiguos
    }
  };

  // 👇 Procesar datos reales de la API
  const processedData = data.map(item => {
    const statusInfo = getStatusColor(item.date);
    return {
      id: item._id || item.id,
      fecha: formatDate(item.date),
      estado: statusInfo.status,
      cliente: item.customer || 'Cliente no especificado',
      total: formatCurrency(item.total),
      estadoColor: statusInfo.color,
      product: item.product, // Información adicional que podrías usar
      category: item.category
    };
  });

  // 👇 Datos por defecto solo si no hay datos reales
  const defaultData = [
    {
      id: '1',
      fecha: '19/4/2025',
      estado: 'Pendiente',
      cliente: 'Ana García',
      total: '$72.00',
      estadoColor: '#8B7CF6'
    },
    {
      id: '2',
      fecha: '19/4/2025',
      estado: 'Confirmado',
      cliente: 'Samuel Sánchez',
      total: '$15.00',
      estadoColor: '#34D399'
    },
    {
      id: '3',
      fecha: '18/4/2025',
      estado: 'Pendiente',
      cliente: 'Juan Fernández',
      total: '$35.00',
      estadoColor: '#8B7CF6'
    },
    {
      id: '4',
      fecha: '18/4/2025',
      estado: 'Confirmado',
      cliente: 'Carlos Buendia',
      total: '$25.00',
      estadoColor: '#34D399'
    },
    {
      id: '5',
      fecha: '18/4/2025',
      estado: 'Confirmado',
      cliente: 'Carlos Buendia',
      total: '$25.00',
      estadoColor: '#8B7CF6'
    },
  ];

  // 👇 Usar datos reales si están disponibles, si no usar datos por defecto
  const tableData = processedData.length > 0 ? processedData : defaultData;

  const renderHeader = () => (
    <View style={styles.headerRow}>
      <Text style={[styles.headerCell, styles.fechaColumn]}>Fecha</Text>
      <Text style={[styles.headerCell, styles.estadoColumn]}>Estado</Text>
      <Text style={[styles.headerCell, styles.clienteColumn]}>Cliente</Text>
      <Text style={[styles.headerCell, styles.totalColumn]}>Total</Text>
    </View>
  );

  const renderRow = (item) => (
    <View key={item.id} style={styles.row}>
      <Text style={[styles.cell, styles.fechaColumn]}>{item.fecha}</Text>
      <View style={[styles.cell, styles.estadoColumn]}>
        <View style={[styles.estadoBadge, { backgroundColor: item.estadoColor }]}>
          <Text style={styles.estadoText}>{item.estado}</Text>
        </View>
      </View>
      <Text style={[styles.cell, styles.clienteColumn]} numberOfLines={1}>
        {item.cliente}
      </Text>
      <Text style={[styles.cell, styles.totalColumn, styles.totalText]}>
        {item.total}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      <ScrollView 
        style={styles.tableBody}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
      >
        {tableData.length > 0 ? (
          tableData.map(item => renderRow(item))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No hay pedidos para mostrar</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerCell: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F8F8',
    alignItems: 'center',
  },
  cell: {
    fontSize: 14,
    color: '#333',
  },
  fechaColumn: {
    flex: 1.2,
  },
  estadoColumn: {
    flex: 1.3,
  },
  clienteColumn: {
    flex: 1.8,
  },
  totalColumn: {
    flex: 1,
    textAlign: 'right',
  },
  estadoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  estadoText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
  },
  totalText: {
    fontWeight: '600',
  },
  tableBody: {
    maxHeight: 250, // Altura fija del contenedor de scroll
    backgroundColor: '#FFF',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    color: '#666',
    fontSize: 16,
    fontStyle: 'italic',
  },
});

export default VentasTable;