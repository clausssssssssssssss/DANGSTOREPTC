import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { MenuStyles } from '../components/styles/MenuStyles';

const Menu = () => {
  return (
    <View style={MenuStyles.container}>
      {/* Header */}
      <View style={MenuStyles.header}>
        <Image
          source={{ uri: 'https://randomuser.me/api/portraits/women/1.jpg' }}
          style={MenuStyles.avatar}
        />
        <Text style={MenuStyles.bell}>🔔</Text>
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
      {/* Pendientes */}
      <Text style={MenuStyles.pendientes}>Pendientes</Text>
      <View style={MenuStyles.ordenesCard}>
        <Text style={MenuStyles.ordenesText}>Órdenes cotizadas</Text>
        <View style={MenuStyles.ordenesRight}>
          <Text style={MenuStyles.ordenesNumber}>20</Text>
          <Text style={MenuStyles.warning}>⚠️</Text>
          <TouchableOpacity>
            <Text style={MenuStyles.verToda}>ver toda</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Bottom Navigation */}
      <View style={MenuStyles.bottomNav}>
        <Text style={MenuStyles.navIcon}>📚</Text>
        <Text style={MenuStyles.navIcon}>📦</Text>
        <Text style={[MenuStyles.navIcon, MenuStyles.activeNav]}>🏠</Text>
        <Text style={MenuStyles.navIcon}>📋</Text>
        <Text style={MenuStyles.navIcon}>👤</Text>
      </View>
    </View>
  );
};


export default Menu;