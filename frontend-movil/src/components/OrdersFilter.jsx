import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { pendientesStyles as styles } from '../components/styles/PendientesStyles';

const OrdersFilter = ({ activeFilter, onFilterChange }) => {
  const filters = [
    { key: 'pending', label: 'Pendientes' },
    { key: 'quoted', label: 'Cotizadas' },
    { key: 'rejected', label: 'Rechazadas' }
  ];

  return (
    <View style={styles.filterContainer}>
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter.key}
          style={[
            styles.filterButton,
            activeFilter === filter.key && styles.filterButtonActive
          ]}
          onPress={() => onFilterChange(filter.key)}
        >
          <Text style={[
            styles.filterText,
            activeFilter === filter.key && styles.filterTextActive
          ]}>
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default OrdersFilter;
