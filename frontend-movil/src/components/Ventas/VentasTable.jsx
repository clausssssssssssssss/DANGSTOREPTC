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

  // 👇 Función para determinar color del estado
  const getStatusColor = (date) => {
    const daysDiff = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 1) {
      return { color: '#34D399', status: 'Confirmado' }; // Verde para recientes
    } else {
      return { color: '#8B7CF6', status: 'Procesado' }; // Púrpura para más antiguos
    }
  };

  // 👇 Función para obtener el nombre del cliente
  const getCustomerName = (customer) => {
    if (!customer) return 'Cliente no especificado';
    
    // Si customer es un objeto (cuando el backend hace populate)
    if (typeof customer === 'object' && customer !== null) {
      return customer.name || customer.email || customer.username || 'Cliente sin nombre';
    }
    
    // Si customer es solo un string (ID)
    return customer;
  };

  // 👇 Procesar datos reales de la API
  const processedData = data.map(item => {
    const statusInfo = getStatusColor(item.date);
    return {
      id: item._id || item.id,
      fecha: formatDate(item.date),
      estado: statusInfo.status,
      cliente: getCustomerName(item.customer),
      total: formatCurrency(item.total),
      estadoColor: statusInfo.color,
      product: item.product,
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
        contentContainerStyle={styles.scrollContent}
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
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 30,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#F3F0FF',
    backgroundColor: '#FAFAFA',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerCell: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
    letterSpacing: 0.1,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
    alignItems: 'center',
    minHeight: 50,
  },
  cell: {
    fontSize: 12,
    color: '#1F2937',
    fontWeight: '500',
  },
  fechaColumn: {
    flex: 1.2,
    paddingRight: 4,
  },
  estadoColumn: {
    flex: 1.3,
    paddingRight: 4,
  },
  clienteColumn: {
    flex: 1.1,
    paddingRight: 4,
  },
  totalColumn: {
    flex: 0.9,
    textAlign: 'right',
    paddingLeft: 4,
  },
  estadoBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  estadoText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  totalText: {
    fontWeight: '700',
    color: '#8B5CF6',
    fontSize: 15,
  },
  tableBody: {
    maxHeight: 300,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 10,
  },
  emptyState: {
    padding: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default VentasTable;