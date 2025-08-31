import React, { useRef, useState } from 'react';
import { View, Text, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AnimatedTabIcon = ({ 
  routeName, 
  focused, 
  size 
}) => {
  const [showBubble, setShowBubble] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Animación simple de escala al presionar
  const handlePress = () => {
    // Animación de escala simple
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      })
    ]).start();

    // Mostrar burbuja
    setShowBubble(true);
    
    // Ocultar burbuja después de 1 segundo
    setTimeout(() => {
      setShowBubble(false);
    }, 1000);
  };

  // Obtener el nombre del icono
  const getIconName = () => {
    switch (routeName) {
      case 'Inicio':
        return focused ? 'home' : 'home-outline';
      case 'Productos':
        return focused ? 'cube' : 'cube-outline';
      case 'Inventario':
        return focused ? 'analytics' : 'analytics-outline';
      case 'Ventas':
        return focused ? 'trending-up' : 'trending-up-outline';
      case 'Perfil':
        return focused ? 'person' : 'person-outline';
      default:
        return 'help-outline';
    }
  };

  const getBubbleText = () => {
    switch (routeName) {
      case 'Inicio':
        return '🏠 Inicio';
      case 'Productos':
        return '📦 Productos';
      case 'Inventario':
        return '📊 Inventario';
      case 'Ventas':
        return '💰 Ventas';
      case 'Perfil':
        return '👤 Perfil';
      default:
        return routeName;
    }
  };

  return (
    <TouchableOpacity 
      onPress={handlePress}
      style={{ alignItems: 'center', justifyContent: 'center' }}
      activeOpacity={0.7}
    >
      {/* Burbuja simple */}
      {showBubble && (
        <View
          style={{
            position: 'absolute',
            bottom: size + 15,
            backgroundColor: '#8B5CF6',
            borderRadius: 20,
            paddingHorizontal: 12,
            paddingVertical: 6,
            zIndex: 1000,
          }}
        >
          {/* Triángulo de la burbuja */}
          <View
            style={{
              position: 'absolute',
              bottom: -8,
              left: '50%',
              marginLeft: -8,
              width: 0,
              height: 0,
              backgroundColor: 'transparent',
              borderStyle: 'solid',
              borderLeftWidth: 8,
              borderRightWidth: 8,
              borderTopWidth: 8,
              borderLeftColor: 'transparent',
              borderRightColor: 'transparent',
              borderTopColor: '#8B5CF6',
            }}
          />
          
          <Text
            style={{
              color: 'white',
              fontSize: 12,
              fontWeight: 'bold',
              textAlign: 'center',
            }}
          >
            {getBubbleText()}
          </Text>
        </View>
      )}

      {/* Icono principal con animación simple */}
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }]
        }}
      >
        <Ionicons
          name={getIconName()}
          size={size}
          color={focused ? '#8B5CF6' : '#6B7280'}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

export default AnimatedTabIcon;
