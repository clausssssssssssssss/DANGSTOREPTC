import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MenuStyles } from './styles/MenuStyles';

const PendingOrdersCard = ({ totalCount, loading, onPress }) => {
  if (loading) {
    return (
      <View style={MenuStyles.ordenesCard}>
        <Text style={MenuStyles.ordenesText}>Órdenes pendientes</Text>
        <View style={MenuStyles.ordenesRight}>
          <ActivityIndicator size="small" color="#e17055" />
          <Text style={MenuStyles.verToda}>cargando...</Text>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity style={MenuStyles.ordenesCard} onPress={onPress}>
      <Text style={MenuStyles.ordenesText}>Órdenes pendientes</Text>
      <View style={MenuStyles.ordenesRight}>
        <Text style={MenuStyles.ordenesNumber}>{totalCount}</Text>
        <Text style={MenuStyles.verToda}>ver todas</Text>
      </View>
    </TouchableOpacity>
  );
};

export default PendingOrdersCard;
