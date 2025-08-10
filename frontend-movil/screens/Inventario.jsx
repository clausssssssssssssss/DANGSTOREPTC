import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const Inventario = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
      <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inventario</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>📊</Text>
        </View>
        <Text style={styles.title}>Inventario</Text>
        <Text style={styles.subtitle}>Pantalla en desarrollo</Text>
        <Text style={styles.description}>
          Esta funcionalidad estará disponible próximamente
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.02,
    paddingBottom: height * 0.025,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: Math.max(20, width * 0.06),
    color: '#8B5CF6',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: Math.max(18, width * 0.045),
    fontWeight: 'bold',
    color: '#1F2937',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.1,
  },
  iconContainer: {
    width: width * 0.25,
    height: width * 0.25,
    borderRadius: (width * 0.25) / 2,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: height * 0.03,
  },
  icon: {
    fontSize: Math.max(40, width * 0.1),
  },
  title: {
    fontSize: Math.max(24, width * 0.06),
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: height * 0.01,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Math.max(18, width * 0.045),
    color: '#8B5CF6',
    fontWeight: '600',
    marginBottom: height * 0.02,
    textAlign: 'center',
  },
  description: {
    fontSize: Math.max(14, width * 0.035),
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: Math.max(20, width * 0.05),
    maxWidth: width * 0.8,
  },
});

export default Inventario;  