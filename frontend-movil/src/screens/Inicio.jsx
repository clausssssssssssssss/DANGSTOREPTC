import React, { useContext, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext.js';
import { inicioStyles as styles } from '../components/styles/InicioStyles';
import { salesAPI } from '../services/salesReport';

const Inicio = ({ navigation }) => {
  const { user } = useContext(AuthContext);

  const greetingTime = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  }, []);

  const displayName = user?.name || 'Angie';

  // Estado para guardar resumen de ventas
  const [summary, setSummary] = useState({
    daily: 0,
    weekly: 0,
    monthly: 0,
  });

  // Estado para controlar si estamos cargando datos
  const [loading, setLoading] = useState(false);

  // NUEVO: Estado para el contador de notificaciones
  const [notificationCount, setNotificationCount] = useState(0);

  // Función para obtener el número real de notificaciones
  const fetchNotificationCount = async () => {
    try {
      // OPCIÓN 1: Si tienes una API específica para notificaciones
      // const count = await salesAPI.getUnreadNotificationsCount();
      // setNotificationCount(count);

      // OPCIÓN 2: Calcular basado en datos del negocio
      let count = 0;

      // Contar pedidos pendientes
      try {
        const pendingOrders = await salesAPI.getPendingOrders?.() || [];
        if (pendingOrders.length > 0) {
          count += 1; // Una notificación por pedidos pendientes
        }
      } catch (error) {
        console.log('No se pudieron verificar pedidos pendientes');
      }

      // Contar otras alertas del negocio
      try {
        const alerts = await salesAPI.getBusinessAlerts?.() || [];
        count += alerts.length;
      } catch (error) {
        console.log('No hay alertas adicionales');
      }

      // OPCIÓN 3: Usar datos que ya tienes
      // Por ejemplo, si ventas bajas = 1 notificación
      if (summary.daily < 10 && summary.daily > 0) {
        count += 1;
      }

      // Si alcanzaste meta semanal = 1 notificación
      const weeklyGoal = 50;
      if (summary.weekly >= weeklyGoal) {
        count += 1;
      }

      // OPCIÓN 4: Valor fijo mientras implementas el sistema completo
      // count = 3; // Descomenta esta línea para usar un valor fijo temporal

      setNotificationCount(count);
      console.log('📱 Contador de notificaciones actualizado:', count);

    } catch (error) {
      console.error('Error al obtener contador de notificaciones:', error);
      setNotificationCount(0);
    }
  };

  // Usar useFocusEffect para actualización automática
  useFocusEffect(
    React.useCallback(() => {
      const fetchSummary = async () => {
        setLoading(true);
        try {
          console.log('📊 Cargando resumen del dashboard...');
          const data = await salesAPI.getDashboardSummary();
          console.log('✅ Datos recibidos del dashboard:', data);
          
          setSummary({
            daily: data?.dailyIncome || 0,
            weekly: data?.weeklyIncome || 0,
            monthly: data?.monthlyIncome || 0,
          });
          
          // Actualizar notificaciones después de cargar ventas
          await fetchNotificationCount();
          
        } catch (error) {
          console.error('❌ Error al cargar resumen de ventas:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchSummary();
    }, [])
  );

  // Meta semanal para calcular porcentaje
  const weeklyGoal = 50;
  const weeklyPercentage = Math.min(
    Math.round((summary.weekly / weeklyGoal) * 100),
    100
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Botón de notificaciones */}
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => navigation.navigate('Notificaciones')}
        >
          <View style={styles.bellIcon}>
            <Ionicons name="notifications" size={24} color="#1F2937" />
          </View>
          {/* Solo mostrar el badge si hay notificaciones */}
          {notificationCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>
                {notificationCount > 99 ? '99+' : notificationCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Contenido principal con fondo degradado */}
        <LinearGradient colors={['#FFFFFF', '#9281BF']} style={styles.mainContent}>
          <Text style={styles.greeting}>Hola {displayName}</Text>
          <Text style={styles.subGreeting}>{greetingTime}</Text>

          {/* Burbujas decorativas */}
          <View style={[styles.backgroundBubble, styles.bubble1]} />
          <View style={[styles.backgroundBubble, styles.bubble2]} />
          <View style={[styles.backgroundBubble, styles.bubble3]} />

          {/* Widget principal - Semana */}
          <View style={styles.weekWidget}>
            <View style={styles.weekGradient}>
              <View style={styles.weekContent}>
                <View style={styles.weekLeftContent}>
                  <Text style={styles.weekTitle}>Esta semana</Text>
                  <Text style={styles.weekPercentage}>
                    {weeklyPercentage}%
                  </Text>
                  <Text style={[styles.weekPercentage, { fontSize: 12, opacity: 0.8 }]}>
                    ${summary.weekly.toLocaleString()}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.verButton}
                  onPress={() => navigation.navigate('Ventas')}
                >
                  <Text style={styles.verButtonText}>Ver</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

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
                      { backgroundColor: '#10B981', height: '80%' },
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
              style={[styles.smallWidget, { backgroundColor: '#C4B5FD' }]}
              onPress={() => navigation.navigate('Ventas')}
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

          {/* Pendientes */}
          <View style={styles.pendientesSection}>
            <Text style={styles.pendientesTitle}>Pendientes</Text>
            <TouchableOpacity
              style={styles.pendientesCard}
              onPress={() => navigation.navigate('Pendientes')}
            >
              <Text style={styles.pendientesText}>Órdenes cotizadas</Text>
              <View style={styles.pendientesAlert}>
                <Text style={styles.pendientesNumber}>20</Text>
                <Ionicons name="warning" size={20} color="#F59E0B" />
              </View>
              <Text style={styles.verTodoText}>ver todo</Text>
            </TouchableOpacity>
          </View>

          {/* Indicador de última actualización */}
          {!loading && (
            <Text style={{ 
              textAlign: 'center', 
              fontSize: 10, 
              color: 'rgba(255,255,255,0.6)', 
              marginTop: 10 
            }}>
              Última actualización: {new Date().toLocaleTimeString()}
            </Text>
          )}
          
          {loading && (
            <Text style={{ 
              textAlign: 'center', 
              fontSize: 10, 
              color: 'rgba(255,255,255,0.8)', 
              marginTop: 10 
            }}>
              Actualizando datos...
            </Text>
          )}
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Inicio;