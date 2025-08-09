import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const Inicio = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <Image
              source={{ uri: 'https://via.placeholder.com/50' }}
              style={styles.profileImage}
            />
            <View style={styles.profileText}>
              <Text style={styles.greeting}>Hola Angie</Text>
              <Text style={styles.subGreeting}>Buenos días</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Notificaciones')}
          >
            <View style={styles.bellIcon}>
              <Text style={styles.bellText}>🔔</Text>
            </View>
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>1</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Esta semana widget */}
          <View style={styles.weekWidget}>
            <LinearGradient
              colors={['#8B5CF6', '#A78BFA']}
              style={styles.weekGradient}
            >
              <View style={styles.weekContent}>
                <Text style={styles.weekTitle}>Este día</Text>
                <View style={styles.weekStats}>
                  <Text style={styles.weekPercentage}>95%</Text>
                  <TouchableOpacity 
                    style={styles.verButton}
                    onPress={() => navigation.navigate('Ventas')}
                  >
                    <Text style={styles.verButtonText}>Ver</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Daily and Monthly widgets */}
          <View style={styles.smallWidgetsContainer}>
            <TouchableOpacity
              style={styles.smallWidget}
              onPress={() => navigation.navigate('Ventas')}
            >
              <Text style={styles.widgetTitle}>Esta semana</Text>
              <View style={styles.widgetContent}>
                <Text style={styles.widgetAmount}>$14200</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { backgroundColor: '#10B981', height: '80%' }]} />
                </View>
              </View>
              <TouchableOpacity 
                style={styles.irButton}
                onPress={() => navigation.navigate('Ventas')}
              >
                <Text style={styles.irButtonText}>Ir</Text>
              </TouchableOpacity>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.smallWidget}
              onPress={() => navigation.navigate('Ventas')}
            >
              <Text style={styles.widgetTitle}>Mayo</Text>
              <View style={styles.widgetContent}>
                <Text style={styles.widgetAmount}>$14200</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { backgroundColor: '#8B5CF6', height: '85%' }]} />
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

          {/* Pendientes section */}
          <View style={styles.pendientesSection}>
            <Text style={styles.pendientesTitle}>Pendientes</Text>
            <TouchableOpacity
              style={styles.pendientesCard}
              onPress={() => navigation.navigate('Pendientes')}
            >
              <Text style={styles.pendientesText}>Órdenes cotizadas</Text>
              <View style={styles.pendientesAlert}>
                <Text style={styles.pendientesNumber}>20</Text>
                <Text style={styles.alertIcon}>⚠️</Text>
              </View>
              <Text style={styles.verTodoText}>ver todo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.02,
    paddingBottom: height * 0.03,
    position: 'relative',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: Math.max(50, width * 0.12),
    height: Math.max(50, width * 0.12),
    borderRadius: Math.max(25, width * 0.06),
    marginRight: width * 0.04,
  },
  profileText: {
    flex: 1,
  },
  greeting: {
    fontSize: Math.max(24, width * 0.06),
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: Math.max(16, width * 0.04),
    color: '#6B7280',
  },
  notificationButton: {
    position: 'absolute',
    right: width * 0.05,
  },
  bellIcon: {
    width: Math.max(40, width * 0.1),
    height: Math.max(40, width * 0.1),
    backgroundColor: '#FCD34D',
    borderRadius: Math.max(20, width * 0.05),
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellText: {
    fontSize: Math.max(20, width * 0.05),
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  mainContent: {
    paddingHorizontal: width * 0.05,
  },
  weekWidget: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  weekGradient: {
    padding: 24,
    position: 'relative',
  },
  weekContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weekTitle: {
    fontSize: Math.max(18, width * 0.045),
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  weekStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weekPercentage: {
    fontSize: Math.max(32, width * 0.08),
    fontWeight: 'bold',
    color: 'white',
    marginRight: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  verButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  verButtonText: {
    color: 'white',
    fontSize: Math.max(14, width * 0.035),
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  smallWidgetsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  smallWidget: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 20,
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  widgetTitle: {
    fontSize: Math.max(16, width * 0.04),
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
    textAlign: 'center',
  },
  widgetContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  widgetAmount: {
    fontSize: Math.max(20, width * 0.05),
    fontWeight: 'bold',
    color: '#8B5CF6',
    flex: 1,
    textAlign: 'center',
  },
  progressBar: {
    width: Math.max(8, width * 0.02),
    height: Math.max(60, height * 0.08),
    backgroundColor: '#F3F4F6',
    borderRadius: Math.max(4, width * 0.01),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  progressFill: {
    width: '100%',
    borderRadius: 4,
  },
  irButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 15,
    alignSelf: 'center',
    marginTop: 8,
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  irButtonText: {
    color: 'white',
    fontSize: Math.max(12, width * 0.03),
    fontWeight: 'bold',
  },
  pendientesSection: {
    marginBottom: 20,
  },
  pendientesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
  },
  pendientesCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  pendientesText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  pendientesAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  pendientesNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#EF4444',
    marginRight: 5,
  },
  alertIcon: {
    fontSize: 16,
  },
  verTodoText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
  },
});

export default Inicio;