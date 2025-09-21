import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { pendientesStyles as styles } from '../components/styles/PendientesStyles';

const DateFilter = ({ activeFilter, onFilterChange }) => {
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const filters = [
    { key: 'pending', label: 'Pendientes' },
    { key: 'quoted', label: 'Cotizadas' },
    { key: 'rejected', label: 'Rechazadas' }
  ];

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getCurrentMonth = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  };

  const getCurrentYear = () => {
    return new Date().getFullYear().toString();
  };

  const handleDateFilter = (filterType) => {
    const today = getCurrentDate();
    const month = getCurrentMonth();
    const year = getCurrentYear();

    let dateFilter;
    switch (filterType) {
      case 'today':
        dateFilter = today;
        break;
      case 'month':
        dateFilter = month;
        break;
      case 'year':
        dateFilter = year;
        break;
      default:
        dateFilter = null;
    }

    onFilterChange(activeFilter, dateFilter);
    setSelectedDate(dateFilter);
    setShowDateModal(false);
  };

  const clearDateFilter = () => {
    onFilterChange(activeFilter, null);
    setSelectedDate(null);
  };

  return (
    <View style={styles.filterContainer}>
      <View style={styles.filterRow}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              activeFilter === filter.key && styles.filterButtonActive
            ]}
            onPress={() => onFilterChange(filter.key, selectedDate)}
          >
            <Text style={[
              styles.filterText,
              activeFilter === filter.key && styles.filterTextActive
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
        
        <TouchableOpacity
          style={[styles.filterButton, styles.dateFilterButton]}
          onPress={() => setShowDateModal(true)}
        >
          <Text style={[
            styles.filterText,
            selectedDate && styles.filterTextActive
          ]}>
            Fecha
          </Text>
        </TouchableOpacity>

        {selectedDate && (
          <TouchableOpacity
            style={[styles.filterButton, styles.clearFilterButton]}
            onPress={clearDateFilter}
          >
            <Text style={styles.clearFilterText}>X</Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal
        visible={showDateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDateModal(false)}
      >
        <View style={styles.dateModalOverlay}>
          <View style={styles.dateModalContent}>
            <Text style={styles.dateModalTitle}>Filtrar por fecha</Text>
            
            <TouchableOpacity
              style={styles.dateOption}
              onPress={() => handleDateFilter('today')}
            >
              <Text style={styles.dateOptionText}>Hoy</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.dateOption}
              onPress={() => handleDateFilter('month')}
            >
              <Text style={styles.dateOptionText}>Este mes</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.dateOption}
              onPress={() => handleDateFilter('year')}
            >
              <Text style={styles.dateOptionText}>Este año</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.dateOption}
              onPress={() => handleDateFilter('all')}
            >
              <Text style={styles.dateOptionText}>Todas las fechas</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.dateOption, styles.cancelDateOption]}
              onPress={() => setShowDateModal(false)}
            >
              <Text style={styles.cancelDateText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default DateFilter;