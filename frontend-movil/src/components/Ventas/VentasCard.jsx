import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

const VentasCard = ({ title, amount, isActive = false }) => {
  return (
    <View style={[styles.card, isActive && styles.activeCard]}>
      <View style={styles.iconContainer}>
        <View style={[styles.iconCircle, isActive && styles.activeIconCircle]}>
          <Text style={[styles.iconText, isActive && styles.activeIconText]}>$</Text>
        </View>
      </View>
      <Text style={[styles.title, isActive && styles.activeTitle]} numberOfLines={2}>
        {title}
      </Text>
      <Text style={[styles.amount, isActive && styles.activeAmount]} numberOfLines={1} adjustsFontSizeToFit>
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
    justifyContent: 'center',
    minHeight: 100,
  },
  activeCard: {
    backgroundColor: '#8B5CF6',
  },
  iconContainer: {
    marginBottom: 8,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconCircle: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  iconText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  activeIconText: {
    color: '#FFF',
  },
  title: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  activeTitle: {
    color: '#FFF',
    fontWeight: '600',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  activeAmount: {
    color: '#FFF',
  },
});

export default VentasCard;