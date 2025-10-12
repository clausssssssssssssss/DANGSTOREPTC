import React, { useContext, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext.js';
import { inicioStyles as styles } from '../components/styles/InicioStyles';
import { salesAPI } from '../services/salesReport';
import { metasService } from '../services/metasService'; // ✅ NUEVO
import { useNotifications } from '../hooks/useNotifications';
import AlertComponent from '../components/ui/Alert';

const Inicio = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  
  const { unreadCount, hasUnread, loading: notificationsLoading, refresh: refreshNotifications } = useNotifications();

  const greetingTime = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  }, []);

  const displayName = user?.name || 'Angie';

  const [summary, setSummary] = useState({
    daily: 0,
    weekly: 0,
    monthly: 0,
  });

  const [loading, setLoading] = useState(false);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  
  //  NUEVO: Estado para la meta semanal dinámica
  const [weeklyGoal, setWeeklyGoal] = useState(50);

  //  ACTUALIZADO: useFocusEffect ahora también carga la meta
  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        setLoading(true);
        try {
          console.log('📊 Cargando datos del dashboard...');
          
          // Cargar meta semanal y resumen de ventas en paralelo
          const [meta, data] = await Promise.all([
            metasService.getMetaSemanal(),
            salesAPI.getDashboardSummary()
          ]);
          
          console.log('🎯 Meta semanal cargada:', meta);
          console.log('✅ Datos recibidos del dashboard:', data);
          
          setWeeklyGoal(meta);
          setSummary({
            daily: data?.dailyIncome || 0,
            weekly: data?.weeklyIncome || 0,
            monthly: data?.monthlyIncome || 0,
          });
          
        } catch (error) {
          console.error('❌ Error al cargar datos:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, [])
  );

  // ✅ ACTUALIZADO: Cálculo del porcentaje con meta dinámica
  const weeklyPercentage = useMemo(() => {
    if (weeklyGoal <= 0) return 0;
    return Math.min(Math.round((summary.weekly / weeklyGoal) * 100), 100);
  }, [summary.weekly, weeklyGoal]);

  // ✅ NUEVO: Función para navegar a configuración de metas
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
            <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
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
        <LinearGradient colors={['#FFFFFF', '#9281BF']} style={styles.mainContent}>
          <Text style={styles.greeting}>Hola {displayName}</Text>
          <Text style={styles.subGreeting}>{greetingTime}</Text>

          {/* Burbujas decorativas */}
          <View style={[styles.backgroundBubble, styles.bubble1]} />
          <View style={[styles.backgroundBubble, styles.bubble2]} />
          <View style={[styles.backgroundBubble, styles.bubble3]} />

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

          {/* ✅ Info de meta */}
          
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