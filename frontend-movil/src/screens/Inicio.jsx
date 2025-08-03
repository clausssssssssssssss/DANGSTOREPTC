import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

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
                <Text style={styles.weekTitle}>Esta semana</Text>
                <View style={styles.weekStats}>
                  <Text style={styles.weekPercentage}>95%</Text>
                  <TouchableOpacity style={styles.verButton}>
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
              onPress={() => navigation.navigate('Ventas', { period: 'day' })}
            >
              <Text style={styles.widgetTitle}>Este día</Text>
              <View style={styles.widgetContent}>
                <Text style={styles.widgetAmount}>$14200</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { backgroundColor: '#10B981', height: '80%' }]} />
                </View>
              </View>
              <TouchableOpacity style={styles.irButton}>
                <Text style={styles.irButtonText}>Ir</Text>
              </TouchableOpacity>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.smallWidget}
              onPress={() => navigation.navigate('Ventas', { period: 'month' })}
            >
              <Text style={styles.widgetTitle}>Mayo</Text>
              <View style={styles.widgetContent}>
                <Text style={styles.widgetAmount}>$14200</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { backgroundColor: '#8B5CF6', height: '85%' }]} />
                </View>
              </View>
              <TouchableOpacity style={styles.irButton}>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  profileText: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 16,
    color: '#6B7280',
  },
  notificationButton: {
    position: 'relative',
  },
  bellIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#FCD34D',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellText: {
    fontSize: 20,
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
    paddingHorizontal: 20,
  },
  weekWidget: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  weekGradient: {
    padding: 20,
  },
  weekContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weekTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  weekStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weekPercentage: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginRight: 15,
  },
  verButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  verButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  smallWidgetsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  smallWidget: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  widgetTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  widgetContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  widgetAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  progressBar: {
    width: 8,
    height: 60,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    width: '100%',
    borderRadius: 4,
  },
  irButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  irButtonText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '600',
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
