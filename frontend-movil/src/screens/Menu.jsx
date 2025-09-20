import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { MenuStyles } from '../components/styles/MenuStyles';
import RecentOrders from '../components/RecentOrders';
import PendingOrdersCard from '../components/PendingOrdersCard';
import { usePendingQuotes } from '../hooks/useRecentOrders';

const Menu = ({ navigation }) => {
  const { pendingQuotes, totalPendingCount, loading, refresh } = usePendingQuotes();

  const handleOrderPress = (order) => {
    // Navegar a la pantalla de órdenes pendientes
    navigation.navigate('Pendientes');
  };

  const handleViewAll = () => {
    // Navegar a la pantalla de órdenes pendientes
    navigation.navigate('Pendientes');
  };

  return (
    <View style={MenuStyles.container}>
      {/* Header */}
      <View style={MenuStyles.header}>
        <Image
          source={{ uri: 'https://randomuser.me/api/portraits/women/1.jpg' }}
          style={MenuStyles.avatar}
        />
        <Text style={MenuStyles.bell}></Text>
      </View>
      {/* Saludo */}
      <Text style={MenuStyles.hola}>Hola Angie</Text>
      <Text style={MenuStyles.buenosDias}>Buenos días</Text>
      {/* Progreso semanal */}
      <View style={MenuStyles.card}>
        <Text style={MenuStyles.cardTitle}>Esta semana</Text>
        <View style={MenuStyles.progressRow}>
          <Text style={MenuStyles.percent}>95%</Text>
          <TouchableOpacity style={MenuStyles.verBtn}>
            <Text style={MenuStyles.verBtnText}>Ver</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Estadísticas */}
      <View style={MenuStyles.statsRow}>
        <View style={MenuStyles.statCard}>
          <Text style={MenuStyles.statTitle}>Este día</Text>
          <Text style={MenuStyles.statValue}>$14200</Text>
        </View>
        <View style={MenuStyles.statCard}>
          <Text style={MenuStyles.statTitle}>Mayo</Text>
          <Text style={MenuStyles.statValue}>$14200</Text>
        </View>
      </View>
      {/* Card de Órdenes Pendientes */}
      <Text style={MenuStyles.pendientes}>Pendientes</Text>
      <PendingOrdersCard 
        totalCount={totalPendingCount}
        loading={loading}
        onPress={handleViewAll}
      />
      
      {/* Órdenes Recientes */}
      <RecentOrders 
        orders={pendingQuotes}
        loading={loading}
        onOrderPress={handleOrderPress}
        onViewAll={handleViewAll}
      />
      {/* Bottom Navigation */}
      <View style={MenuStyles.bottomNav}>
        <Text style={MenuStyles.navIcon}></Text>
        <Text style={MenuStyles.navIcon}></Text>
        <Text style={[MenuStyles.navIcon, MenuStyles.activeNav]}></Text>
        <Text style={MenuStyles.navIcon}></Text>
        <Text style={MenuStyles.navIcon}></Text>
      </View>
    </View>
  );
};


export default Menu;