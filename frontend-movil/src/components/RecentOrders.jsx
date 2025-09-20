import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MenuStyles } from './styles/MenuStyles';

const RecentOrders = ({ orders, loading, onOrderPress, onViewAll }) => {
  if (loading) {
    return (
      <View style={MenuStyles.recentOrdersContainer}>
        <Text style={MenuStyles.recentOrdersTitle}>Pendientes de Cotizar</Text>
        <View style={MenuStyles.loadingContainer}>
          <ActivityIndicator size="small" color="#8B5CF6" />
          <Text style={MenuStyles.loadingText}>Cargando...</Text>
        </View>
      </View>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <View style={MenuStyles.recentOrdersContainer}>
        <Text style={MenuStyles.recentOrdersTitle}>Pendientes de Cotizar</Text>
        <View style={MenuStyles.emptyOrdersContainer}>
          <Text style={MenuStyles.emptyOrdersText}>No hay órdenes pendientes de cotización</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={MenuStyles.recentOrdersContainer}>
      <View style={MenuStyles.recentOrdersHeader}>
        <View style={MenuStyles.titleContainer}>
          <Text style={MenuStyles.recentOrdersTitle}>Pendientes de Cotizar</Text>
          <View style={MenuStyles.realTimeIndicator}>
            <View style={MenuStyles.realTimeDot} />
            <Text style={MenuStyles.realTimeText}>Tiempo real</Text>
          </View>
        </View>
        <TouchableOpacity onPress={onViewAll}>
          <Text style={MenuStyles.verTodasText}>Ver todas</Text>
        </TouchableOpacity>
      </View>
      
      {orders.map((order, index) => (
        <TouchableOpacity 
          key={order._id || index}
          style={MenuStyles.recentOrderCard}
          onPress={() => onOrderPress(order)}
        >
          <View style={MenuStyles.recentOrderInfo}>
            <Text style={MenuStyles.recentOrderTitle} numberOfLines={1}>
              {order.productName || order.product_name || 'Producto personalizado'}
            </Text>
            <Text style={MenuStyles.recentOrderDate}>
              {new Date(order.createdAt || order.created_at).toLocaleDateString()}
            </Text>
          </View>
          <View style={MenuStyles.recentOrderStatus}>
            <Text style={MenuStyles.recentOrderStatusText}>
              Pendiente
            </Text>
            <Text style={MenuStyles.recentOrderArrow}>›</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default RecentOrders;
