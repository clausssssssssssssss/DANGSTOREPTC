import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const VentasTable = ({ data = [] }) => {
  const defaultData = [
    {
      id: '1',
      fecha: '19/4/2025',
      estado: 'Pendiente',
      cliente: 'Ana García',
      total: '$72',
      estadoColor: '#8B7CF6'
    },
    {
      id: '2',
      fecha: '19/4/2025',
      estado: 'Confirmado',
      cliente: 'Samuel Sánchez',
      total: '$15',
      estadoColor: '#34D399'
    },
    {
      id: '3',
      fecha: '18/4/2025',
      estado: 'Pendiente',
      cliente: 'Juan Fernández',
      total: '$35',
      estadoColor: '#8B7CF6'
    },
    {
      id: '4',
      fecha: '18/4/2025',
      estado: 'Confirmado',
      cliente: 'Carlos Buendia',
      total: '$25',
      estadoColor: '#34D399'
    },
    {
      id: '5',
      fecha: '18/4/2025',
      estado: 'Confirmado',
      cliente: 'Carlos Buendia',
      total: '$25',
      estadoColor: '#8B7CF6'
    },
  ];

  const tableData = data.length > 0 ? data : defaultData;

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
      <Text style={[styles.cell, styles.clienteColumn]}>{item.cliente}</Text>
      <Text style={[styles.cell, styles.totalColumn, styles.totalText]}>{item.total}</Text>
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
        {tableData.map(item => renderRow(item))}
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
});

export default VentasTable;