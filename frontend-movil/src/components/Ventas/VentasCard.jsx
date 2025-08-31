import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const VentasCard = ({ title, amount, isActive = false }) => {
  return (
    <View style={[styles.card, isActive && styles.activeCard]}>
      <Text style={[styles.title, isActive && styles.activeTitle]}>
        {title}
      </Text>
      <Text style={[styles.amount, isActive && styles.activeAmount]}>
        ${amount}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#E8E4FF',
    borderRadius: 15,
    padding: 16,
    marginHorizontal: 8,
    flex: 1,
    alignItems: 'center',
  },
  activeCard: {
    backgroundColor: '#8B7CF6',
  },
  title: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  activeTitle: {
    color: '#FFF',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  activeAmount: {
    color: '#FFF',
  },
});

export default VentasCard;