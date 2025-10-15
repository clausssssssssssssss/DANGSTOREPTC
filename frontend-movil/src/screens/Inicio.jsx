import React, { useContext, useMemo, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext.js';
import { inicioStyles as styles } from '../components/styles/InicioStyles';
import { salesAPI } from '../services/salesReport';
import { metasService } from '../services/metasService';
import { customOrdersAPI } from '../services/customOrders.js'; // ✅ NUEVO IMPORT
import { useNotifications } from '../hooks/useNotifications';
import AlertComponent from '../components/ui/Alert';
import API_URL from '../config/api';

const Inicio = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  
  const { unreadCount, hasUnread, loading: notificationsLoading, refresh: refreshNotifications } = useNotifications();

  const greetingTime = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  }, []);

  const [currentTime, setCurrentTime] = useState(() => {
    const now = new Date();
    return now.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  });

  // Actualizar la hora cada minuto
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }));
    };

    // Actualizar inmediatamente
    updateTime();
    
    // Configurar intervalo para actualizar cada minuto
    const interval = setInterval(updateTime, 60000); // 60000ms = 1 minuto

    return () => clearInterval(interval);
  }, []);

  const displayName = user?.name || 'Angie';

  const [summary, setSummary] = useState({
    daily: 0,
    weekly: 0,
    monthly: 0,
  });

  const [loading, setLoading] = useState(false);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [weeklyGoal, setWeeklyGoal] = useState(50);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0); // ✅ NUEVO ESTADO
  const [pendingDeliveriesCount, setPendingDeliveriesCount] = useState(0); // ✅ NUEVO ESTADO PARA ENTREGAS

  // ✅ ANIMACIONES: Valores animados para las pelotitas y cuadritos
  const bubble1Anim = useRef(new Animated.Value(0)).current;
  const bubble2Anim = useRef(new Animated.Value(0)).current;
  const bubble3Anim = useRef(new Animated.Value(0)).current;
  const bubble4Anim = useRef(new Animated.Value(0)).current;
  const bubble5Anim = useRef(new Animated.Value(0)).current;
  const bubble6Anim = useRef(new Animated.Value(0)).current;

  // ✅ ANIMACIONES: Efecto para iniciar las animaciones
  useEffect(() => {
    const startAnimations = () => {
      // Animación para bubble1 (flotación suave)
      Animated.loop(
        Animated.sequence([
          Animated.timing(bubble1Anim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(bubble1Anim, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Animación para bubble2 (movimiento más rápido)
      Animated.loop(
        Animated.sequence([
          Animated.timing(bubble2Anim, {
            toValue: 1,
            duration: 2500,
            useNativeDriver: true,
          }),
          Animated.timing(bubble2Anim, {
            toValue: 0,
            duration: 2500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Animación para bubble3 (rotación y movimiento)
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(bubble3Anim, {
              toValue: 1,
              duration: 4000,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(bubble3Anim, {
              toValue: 0,
              duration: 4000,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();

      // Animación para bubble4 (movimiento lento y suave)
      Animated.loop(
        Animated.sequence([
          Animated.timing(bubble4Anim, {
            toValue: 1,
            duration: 5000,
            useNativeDriver: true,
          }),
          Animated.timing(bubble4Anim, {
            toValue: 0,
            duration: 5000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Animación para bubble5 (movimiento rápido)
      Animated.loop(
        Animated.sequence([
          Animated.timing(bubble5Anim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(bubble5Anim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Animación para bubble6 (pulsación)
      Animated.loop(
        Animated.sequence([
          Animated.timing(bubble6Anim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(bubble6Anim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    startAnimations();
  }, []);

  // ✅ NUEVA FUNCIÓN: Obtener entregas pendientes
  const getPendingDeliveries = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return [];

      // Usar la ruta correcta para órdenes personalizadas
      const response = await fetch(`${API_URL}/custom-orders/all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      const data = result.data || result; // Manejar diferentes formatos de respuesta
      
      // Filtrar órdenes que están en proceso: revisando, elaborando, o listos
      const pendingDeliveries = data.filter(order => 
        order.deliveryStatus === 'REVIEWING' || 
        order.deliveryStatus === 'MAKING' ||
        order.deliveryStatus === 'READY_FOR_DELIVERY'
      );

      return pendingDeliveries;
    } catch (error) {
      console.error('Error obteniendo entregas pendientes:', error);
      return [];
    }
  };

  // ✅ ACTUALIZADO: useFocusEffect ahora también carga las órdenes pendientes
  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        setLoading(true);
        try {
          console.log('📊 Cargando datos del dashboard...');
          
          // Cargar meta semanal, resumen de ventas, órdenes pendientes Y entregas pendientes en paralelo
          const [meta, data, pendingOrders, pendingDeliveries] = await Promise.all([
            metasService.getMetaSemanal(),
            salesAPI.getDashboardSummary(),
            customOrdersAPI.getPendingOrders(), // ✅ NUEVO
            getPendingDeliveries() // ✅ NUEVO
          ]);
          
          console.log('🎯 Meta semanal cargada:', meta);
          console.log('✅ Datos recibidos del dashboard:', data);
          console.log('📦 Órdenes pendientes:', pendingOrders?.length || 0); // ✅ NUEVO
          
          setWeeklyGoal(meta);
          setSummary({
            daily: data?.dailyIncome || 0,
            weekly: data?.weeklyIncome || 0,
            monthly: data?.monthlyIncome || 0,
          });
          
          // ✅ NUEVO: Guardar el conteo de órdenes pendientes
          setPendingOrdersCount(pendingOrders?.length || 0);
          
          // ✅ NUEVO: Guardar el conteo de entregas pendientes
          setPendingDeliveriesCount(pendingDeliveries?.length || 0);
          
        } catch (error) {
          console.error('❌ Error al cargar datos:', error);
          // En caso de error, mantener los contadores en 0
          setPendingOrdersCount(0);
          setPendingDeliveriesCount(0);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, [])
  );

  const weeklyPercentage = useMemo(() => {
    if (weeklyGoal <= 0) return 0;
    return Math.min(Math.round((summary.weekly / weeklyGoal) * 100), 100);
  }, [summary.weekly, weeklyGoal]);

  const handleGoToMetas = () => {
    navigation.navigate('Ventas', { initialTab: 'metas' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Botón de cerrar sesión fijo arriba a la izquierda */}
        <TouchableOpacity
          style={styles.logoutButtonTop}
          onPress={() => setShowLogoutAlert(true)}
        >
          <View style={styles.logoutIcon}>
            <Ionicons name="log-out-outline" size={24} color="#EF4444" />
          </View>
        </TouchableOpacity>

        {/* Botón de notificaciones */}
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => {
            refreshNotifications();
            navigation.navigate('Notificaciones');
          }}
        >
          <View style={styles.bellIcon}>
            <Ionicons name="notifications" size={24} color="#1F2937" />
          </View>
          <View style={[
            styles.notificationBadge,
            { backgroundColor: hasUnread ? '#EF4444' : '#10B981' }
          ]}>
            <Text style={styles.badgeText}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Contenido principal con fondo degradado */}
        <View style={styles.mainContent}>
          <Text style={styles.greeting}>Hola {displayName}</Text>
          <View style={styles.greetingContainer}>
            <Text style={styles.subGreeting}>{greetingTime}</Text>
            <Text style={styles.timeText}>{currentTime}</Text>
          </View>

          {/* Burbujas decorativas animadas */}
          <Animated.View 
            style={[
              styles.backgroundBubble, 
              styles.bubble1,
              {
                transform: [
                  {
                    translateY: bubble1Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -20],
                    }),
                  },
                  {
                    scale: bubble1Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.1],
                    }),
                  },
                ],
                opacity: bubble1Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.1, 0.3],
                }),
              }
            ]} 
          />
          <Animated.View 
            style={[
              styles.backgroundBubble, 
              styles.bubble2,
              {
                transform: [
                  {
                    translateX: bubble2Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 15],
                    }),
                  },
                  {
                    translateY: bubble2Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -15],
                    }),
                  },
                  {
                    rotate: bubble2Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '10deg'],
                    }),
                  },
                ],
                opacity: bubble2Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.1, 0.25],
                }),
              }
            ]} 
          />
          <Animated.View 
            style={[
              styles.backgroundBubble, 
              styles.bubble3,
              {
                transform: [
                  {
                    translateY: bubble3Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -25],
                    }),
                  },
                  {
                    translateX: bubble3Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 10],
                    }),
                  },
                  {
                    scale: bubble3Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 0.9],
                    }),
                  },
                  {
                    rotate: bubble3Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
                opacity: bubble3Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.1, 0.2],
                }),
              }
            ]} 
          />

          {/* Burbujas adicionales para la parte inferior */}
          <Animated.View 
            style={[
              styles.backgroundBubble, 
              styles.bubble4,
              {
                transform: [
                  {
                    translateY: bubble4Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -30],
                    }),
                  },
                  {
                    translateX: bubble4Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -20],
                    }),
                  },
                  {
                    scale: bubble4Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.2],
                    }),
                  },
                ],
                opacity: bubble4Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.08, 0.2],
                }),
              }
            ]} 
          />
          <Animated.View 
            style={[
              styles.backgroundBubble, 
              styles.bubble5,
              {
                transform: [
                  {
                    translateY: bubble5Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 25],
                    }),
                  },
                  {
                    rotate: bubble5Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '180deg'],
                    }),
                  },
                  {
                    scale: bubble5Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 0.8],
                    }),
                  },
                ],
                opacity: bubble5Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.12, 0.25],
                }),
              }
            ]} 
          />
          <Animated.View 
            style={[
              styles.backgroundBubble, 
              styles.bubble6,
              {
                transform: [
                  {
                    scale: bubble6Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.3],
                    }),
                  },
                  {
                    translateY: bubble6Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -15],
                    }),
                  },
                ],
                opacity: bubble6Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.1, 0.3],
                }),
              }
            ]} 
          />

          {/* Widget principal - Semana */}
          <TouchableOpacity
            style={styles.weekWidget}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Ventas')}
          >
            <View style={styles.weekGradient}>
              <View style={styles.weekContent}>
                <View style={styles.weekLeftContent}>
                  <Text style={styles.weekTitle}>Esta semana</Text>
                  <Text style={styles.weekPercentage}>{weeklyPercentage}%</Text>
                  <Text style={[styles.weekPercentage, { fontSize: 12, opacity: 0.8 }]}>
                    ${summary.weekly.toFixed(2)} de ${weeklyGoal.toFixed(2)}
                  </Text>
                </View>

                <Ionicons name="arrow-forward" size={20} color="white" />
              </View>
            </View>
          </TouchableOpacity>

          {/* Widgets pequeños */}
          <View style={styles.smallWidgetsContainer}>
            {/* Día */}
            <TouchableOpacity
              style={styles.smallWidget}
              onPress={() => navigation.navigate('Ventas')}
            >
              <Text style={styles.widgetTitle}>Este día</Text>
              <View style={styles.widgetContent}>
                <Text style={styles.widgetAmount}>
                  ${summary.daily.toLocaleString()}
                </Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { backgroundColor: '#8B5CF6', height: '80%' },
                    ]}
                  />
                </View>
              </View>
              <TouchableOpacity
                style={styles.irButton}
                onPress={() => navigation.navigate('Ventas')}
              >
                <Text style={styles.irButtonText}>Ir</Text>
              </TouchableOpacity>
            </TouchableOpacity>

            {/* Mes */}
            <TouchableOpacity
              style={[styles.smallWidget, { backgroundColor: '#79edd2' }]}
              onPress={() => navigation.navigate('Mensual')}
            >
              <Text style={styles.widgetTitle}>Este mes</Text>
              <View style={styles.widgetContent}>
                <Text style={styles.widgetAmount}>
                  ${summary.monthly.toLocaleString()}
                </Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { backgroundColor: '#8B5CF6', height: '85%' },
                    ]}
                  />
                </View>
              </View>
              <TouchableOpacity
                style={styles.irButton}
                onPress={() => navigation.navigate('Ventas')}
              >
                <Text style={styles.irButtonText}>Ir</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </View>

          {/* Pendientes - ✅ ACTUALIZADO con contador real */}
          <View style={styles.pendientesSection}>
            <Text style={styles.pendientesTitle}>Pendientes</Text>
            
            {/* Órdenes cotizadas */}
            <TouchableOpacity
              style={styles.pendientesCard}
              onPress={() => navigation.navigate('Pendientes')}
            >
              <Text style={styles.pendientesText}>Órdenes cotizadas</Text>
              <View style={styles.pendientesAlert}>
                {loading ? (
                  <Text style={styles.pendientesNumber}>...</Text>
                ) : (
                  <Text style={styles.pendientesNumber}>{pendingOrdersCount}</Text>
                )}
                <Ionicons name="warning" size={20} color="#F59E0B" />
              </View>
              <Text style={styles.verTodoText}>ver todo</Text>
            </TouchableOpacity>

            {/* Entregas pendientes */}
            <TouchableOpacity
              style={styles.pendientesCard}
              onPress={() => navigation.navigate('StockLimites', {
                screen: 'ProgramacionEntregas'
              })}
            >
              <Text style={styles.pendientesText}>Entregas pendientes</Text>
              <View style={styles.pendientesAlert}>
                {loading ? (
                  <Text style={styles.pendientesNumber}>...</Text>
                ) : (
                  <Text style={styles.pendientesNumber}>{pendingDeliveriesCount}</Text>
                )}
                <Ionicons name="car-outline" size={20} color="#10B981" />
              </View>
              <Text style={styles.verTodoText}>ver todo</Text>
            </TouchableOpacity>
          </View>

          {loading && (
            <Text style={{ 
              textAlign: 'center', 
              fontSize: 10, 
              color: 'rgba(139,92,246,0.8)', 
              marginTop: 10 
            }}>
              Actualizando datos...
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Componente de alerta para cerrar sesión */}
      <AlertComponent
        visible={showLogoutAlert}
        title="Cerrar Sesión"
        message="¿Estás seguro de que quieres cerrar sesión?"
        type="warning"
        onConfirm={() => {
          setShowLogoutAlert(false);
          navigation.replace('AuthApp');
        }}
        onCancel={() => setShowLogoutAlert(false)}
        confirmText="Cerrar Sesión"
        cancelText="Cancelar"
        showCancel={true}
      />
    </SafeAreaView>
  );
};

export default Inicio;