// components/Ventas/VentasTabs.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

const VentasTabs = ({ activeTab, onTabPress }) => {
  const tabs = [
    { id: 'reporte', label: 'Reporte', icon: 'bar-chart' },
    { id: 'ingresos', label: 'Ingresos', icon: 'cash' },
    { id: 'pedidos', label: 'Pedidos', icon: 'list' },
    { id: 'metas', label: 'Metas', icon: 'flag' },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[
            styles.tab,
            activeTab === tab.id && styles.activeTab,
          ]}
          onPress={() => onTabPress(tab.id)}
          activeOpacity={0.8}
        >
          <View style={[styles.iconWrapper, activeTab === tab.id && styles.activeIconWrapper]}>
            <Ionicons 
              name={tab.icon} 
              size={screenWidth < 350 ? 18 : 20} 
              color={activeTab === tab.id ? '#FFF' : '#8B5CF6'} 
            />
          </View>
          <Text
            style={[
              styles.tabText,
              activeTab === tab.id && styles.activeTabText,
            ]}
            numberOfLines={1}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: screenWidth < 350 ? 2 : 4,
    borderRadius: 12,
    marginHorizontal: 3,
  },
  activeTab: {
    backgroundColor: '#F3F0FF',
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  activeIconWrapper: {
    backgroundColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  tabText: {
    fontSize: screenWidth < 350 ? 10 : 11,
    color: '#6B7280',
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  activeTabText: {
    color: '#8B5CF6',
    fontWeight: '700',
  },
});

export default VentasTabs;