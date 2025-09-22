import React, { useContext, useMemo, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
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

  // Llamada al backend al cargar el componente
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await salesAPI.getSalesSummary();
        setSummary({
          daily: data?.dailyIncome || 0,
          weekly: data?.weeklyIncome || 0,
          monthly: data?.monthlyIncome || 0,
        });
      } catch (error) {
        console.error('❌ Error al cargar resumen de ventas:', error);
      }
    };

    fetchSummary();
  }, []);

  // Meta semanal para calcular porcentaje (puedes ajustar esto)
  const weeklyGoal = 20000;
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
          <View style={styles.notificationBadge}>
            <Text style={styles.badgeText}>5</Text>
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
          <View style={styles.weekWidget}>
            <View style={styles.weekGradient}>
              <View style={styles.weekContent}>
                <View style={styles.weekLeftContent}>
                  <Text style={styles.weekTitle}>Esta semana</Text>
                  <Text style={styles.weekPercentage}>
                    {weeklyPercentage}%
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
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Inicio;
