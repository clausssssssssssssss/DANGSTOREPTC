import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  Animated,
  LinearGradient,
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Componente principal del perfil
const TuPerfil = ({ navigation, userData }) => {
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Background con gradiente animado */}
      <View style={styles.gradientBackground}>
        <View style={[styles.gradientOverlay, { backgroundColor: '#8B5CF6' }]} />
        <View style={[styles.gradientOverlay, { backgroundColor: 'rgba(139, 92, 246, 0.8)' }]} />
        
        {/* Elementos decorativos flotantes */}
        <View style={[styles.floatingElement, styles.element1]} />
        <View style={[styles.floatingElement, styles.element2]} />
        <View style={[styles.floatingElement, styles.element3]} />
      </View>

      <Animated.View 
        style={[
          styles.content, 
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <Text style={styles.headerLabel}>Inicial</Text>
        
        <Text style={styles.mainTitle}>Tu Perfil</Text>
        
        {/* Container de imagen con efecto glassmorphism */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <View style={styles.imageGlow} />
            <Image 
              source={{ uri: userData?.profileImage || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face' }}
              style={styles.profileImage}
            />
            <View style={styles.profileBadge}>
              <Text style={styles.badgeText}>✨</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.configButton}
            onPress={() => navigation.navigate('Configuracion')}
            activeOpacity={0.8}
          >
            <View style={styles.buttonGradient}>
              <Text style={styles.configButtonText}>⚙️ Configuración</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Cards de información con glassmorphism */}
        <View style={styles.infoCardsContainer}>
          <View style={styles.infoCard}>
            <View style={styles.cardIcon}>
              <Text style={styles.cardIconText}>👤</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardLabel}>Nombre</Text>
              <Text style={styles.cardValue}>{userData?.nombre || 'Angie'}</Text>
            </View>
            <View style={styles.cardAccent} />
          </View>
          
          <View style={styles.infoCard}>
            <View style={styles.cardIcon}>
              <Text style={styles.cardIconText}>✍️</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardLabel}>Apellido</Text>
              <Text style={styles.cardValue}>{userData?.apellido || 'Ramos'}</Text>
            </View>
            <View style={styles.cardAccent} />
          </View>
          
          <View style={styles.infoCard}>
            <View style={styles.cardIcon}>
              <Text style={styles.cardIconText}>📧</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardLabel}>Email</Text>
              <Text style={styles.cardValue}>{userData?.email || 'angie@email.com'}</Text>
            </View>
            <View style={styles.cardAccent} />
          </View>
        </View>
      </Animated.View>
      
      {/* Bottom Navigation Premium */}
      <View style={styles.bottomNavContainer}>
        <View style={styles.bottomNav}>
          {[
            { icon: '🏠', active: false },
            { icon: '📊', active: false },
            { icon: '🚀', active: false },
            { icon: '📋', active: false },
            { icon: '👤', active: true },
            { icon: '💬', active: false },
          ].map((item, index) => (
            <TouchableOpacity key={index} style={[styles.navItem, item.active && styles.navItemActive]}>
              <Text style={[styles.navIcon, item.active && styles.navIconActive]}>{item.icon}</Text>
              {item.active && <View style={styles.navIndicator} />}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

// Pantalla de Configuración Premium
const Configuracion = ({ navigation }) => {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const slideAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Background Premium */}
      <View style={styles.gradientBackground}>
        <View style={[styles.gradientOverlay, { backgroundColor: '#8B5CF6' }]} />
        <View style={[styles.gradientOverlay, { backgroundColor: 'rgba(139, 92, 246, 0.9)' }]} />
        <View style={[styles.floatingElement, styles.element1]} />
        <View style={[styles.floatingElement, styles.element2]} />
      </View>

      <Animated.View 
        style={[
          styles.content,
          {
            transform: [{
              scale: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1]
              })
            }]
          }
        ]}
      >
        {/* Header Premium */}
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            style={styles.backButtonPremium}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerLabel}>Inicial</Text>
        </View>
        
        <Text style={styles.mainTitle}>Configuración</Text>
        
        {/* Tabs Premium con animación */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 0 && styles.activeTab]}
            onPress={() => setActiveTab(0)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 0 && styles.activeTabText]}>
              📋 Políticas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 1 && styles.activeTab]}
            onPress={() => {
              setActiveTab(1);
              navigation.navigate('DatosDangStore');
            }}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 1 && styles.activeTabText]}>
              🏪 DangStore
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Container de términos con glassmorphism */}
        <View style={styles.termsContainer}>
          <View style={styles.termsHeader}>
            <Text style={styles.termsHeaderText}>📜 Términos y Condiciones</Text>
          </View>
          
          <ScrollView 
            style={styles.termsScroll} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.termsContent}
          >
            <View style={styles.termSection}>
              <Text style={styles.termsTitle}>🔐 1. Acceso y Uso de la Aplicación</Text>
              <Text style={styles.termsText}>
                • DangStore es una aplicación de uso personal y los usuarios no lo administran{'\n'}
                • En caso del administrador tenga alguna pregunta, aclaración o necesidad de acceso con terceros sin autorización.{'\n'}
                • Cualquier actividad fraudulenta dentro de la aplicación será sancionada y eliminada por el propietario DangStore.
              </Text>
            </View>
            
            <View style={styles.termSection}>
              <Text style={styles.termsTitle}>📦 2. Gestión de Productos</Text>
              <Text style={styles.termsText}>
                • Solo el administrador puede añadir, editar o eliminar productos del inventario para mantener actualización, correcto descontinuar, precio, disponibilidad y una imagen única.{'\n'}
                • Los usuarios pueden visualizar únicamente.
              </Text>
            </View>
            
            <View style={styles.termSection}>
              <Text style={styles.termsTitle}>📋 3. Política de Pedidos</Text>
              <Text style={styles.termsText}>
                • Los pedidos registrados deberán incluir fecha, nombre, descripción, cantidad, precio total, disponibilidad y la verificación de disponibilidad antes de confirmar la compra.{'\n'}
                • Los usuarios podrán acceder únicamente a sus propios pedidos registrados, manteniendo la privacidad y otra contra entregas.
              </Text>
            </View>
          </ScrollView>
        </View>
        
        {/* Checkbox Premium */}
        <View style={styles.checkboxContainer}>
          <TouchableOpacity 
            style={[styles.checkbox, acceptedTerms && styles.checkboxActive]}
            onPress={() => setAcceptedTerms(!acceptedTerms)}
            activeOpacity={0.8}
          >
            {acceptedTerms && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
          <Text style={styles.checkboxText}>He leído y acepto los términos</Text>
        </View>
        
        {/* Botón Premium */}
        <TouchableOpacity 
          style={[styles.acceptButton, acceptedTerms && styles.acceptButtonActive]}
          disabled={!acceptedTerms}
          activeOpacity={0.8}
        >
          <Text style={styles.acceptButtonText}>
            {acceptedTerms ? '✅ Aceptar' : '⏳ Aceptar'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
      
      {/* Bottom Navigation */}
      <View style={styles.bottomNavContainer}>
        <View style={styles.bottomNav}>
          {[
            { icon: '🏠', active: false },
            { icon: '📊', active: false },
            { icon: '🚀', active: false },
            { icon: '📋', active: false },
            { icon: '👤', active: true },
            { icon: '💬', active: false },
          ].map((item, index) => (
            <TouchableOpacity key={index} style={[styles.navItem, item.active && styles.navItemActive]}>
              <Text style={[styles.navIcon, item.active && styles.navIconActive]}>{item.icon}</Text>
              {item.active && <View style={styles.navIndicator} />}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

// Pantalla de Datos DangStore Premium
const DatosDangStore = ({ navigation }) => {
  const bounceAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(bounceAnim, {
        toValue: 1.05,
        useNativeDriver: true,
        tension: 100,
      }),
      Animated.spring(bounceAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Background Premium */}
      <View style={styles.gradientBackground}>
        <View style={[styles.gradientOverlay, { backgroundColor: '#8B5CF6' }]} />
        <View style={[styles.gradientOverlay, { backgroundColor: 'rgba(139, 92, 246, 0.8)' }]} />
        <View style={[styles.floatingElement, styles.element1]} />
        <View style={[styles.floatingElement, styles.element3]} />
      </View>

      <Animated.View 
        style={[
          styles.content,
          {
            transform: [{ scale: bounceAnim }]
          }
        ]}
      >
        {/* Header Premium */}
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            style={styles.backButtonPremium}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerLabel}>Inicial</Text>
        </View>
        
        <Text style={styles.mainTitle}>Datos de{'\n'}🏪 DangStore</Text>
        
        {/* Tabs Premium */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={styles.tab}
            onPress={() => navigation.navigate('Configuracion')}
            activeOpacity={0.8}
          >
            <Text style={styles.tabText}>📋 Políticas</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, styles.activeTab]}
            activeOpacity={0.8}
          >
            <Text style={styles.activeTabText}>🏪 DangStore</Text>
          </TouchableOpacity>
        </View>
        
        {/* Cards de información Premium */}
        <View style={styles.infoSectionPremium}>
          <TouchableOpacity style={styles.premiumInfoCard} activeOpacity={0.8}>
            <View style={styles.cardIconLarge}>
              <Text style={styles.cardIconLargeText}>🏢</Text>
            </View>
            <View style={styles.cardContentLarge}>
              <Text style={styles.premiumCardTitle}>Quienes Somos</Text>
              <Text style={styles.premiumCardSubtitle}>Conoce nuestra historia</Text>
            </View>
            <View style={styles.cardArrowContainer}>
              <Text style={styles.cardArrow}>→</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.premiumInfoCard} activeOpacity={0.8}>
            <View style={styles.cardIconLarge}>
              <Text style={styles.cardIconLargeText}>🎯</Text>
            </View>
            <View style={styles.cardContentLarge}>
              <Text style={styles.premiumCardTitle}>Misión y Visión</Text>
              <Text style={styles.premiumCardSubtitle}>Nuestros objetivos</Text>
            </View>
            <View style={styles.cardArrowContainer}>
              <Text style={styles.cardArrow}>→</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Botón destacado */}
        <TouchableOpacity style={styles.featuredButton} activeOpacity={0.8}>
          <View style={styles.featuredButtonContent}>
            <Text style={styles.featuredButtonIcon}>✨</Text>
            <Text style={styles.featuredButtonText}>Misión y Visión</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
      
      {/* Bottom Navigation */}
      <View style={styles.bottomNavContainer}>
        <View style={styles.bottomNav}>
          {[
            { icon: '🏠', active: false },
            { icon: '📊', active: false },
            { icon: '🚀', active: false },
            { icon: '📋', active: false },
            { icon: '👤', active: true },
            { icon: '💬', active: false },
          ].map((item, index) => (
            <TouchableOpacity key={index} style={[styles.navItem, item.active && styles.navItemActive]}>
              <Text style={[styles.navIcon, item.active && styles.navIconActive]}>{item.icon}</Text>
              {item.active && <View style={styles.navIndicator} />}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8B5CF6',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  floatingElement: {
    position: 'absolute',
    borderRadius: 100,
    opacity: 0.1,
  },
  element1: {
    width: 200,
    height: 200,
    backgroundColor: '#FFFFFF',
    top: -100,
    right: -100,
  },
  element2: {
    width: 150,
    height: 150,
    backgroundColor: '#FFFFFF',
    bottom: 100,
    left: -75,
  },
  element3: {
    width: 100,
    height: 100,
    backgroundColor: '#FFFFFF',
    top: height * 0.3,
    right: -50,
  },
  content: {
    flex: 1,
    paddingHorizontal: width * 0.06,
    paddingTop: height * 0.05,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  mainTitle: {
    color: 'white',
    fontSize: 36,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: height * 0.04,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: height * 0.04,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  imageGlow: {
    position: 'absolute',
    width: width * 0.35,
    height: width * 0.35,
    borderRadius: width * 0.175,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    top: -5,
    left: -5,
    zIndex: -1,
  },
  profileImage: {
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: width * 0.15,
    borderWidth: 4,
    borderColor: 'white',
  },
  profileBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 16,
  },
  configButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  buttonGradient: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 15,
    paddingHorizontal: 35,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  configButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  infoCardsContainer: {
    flex: 1,
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    position: 'relative',
    overflow: 'hidden',
  },
  cardIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  cardIconText: {
    fontSize: 20,
  },
  cardContent: {
    flex: 1,
  },
  cardLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  cardValue: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 2,
  },
  cardAccent: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#FFD700',
  },
  backButtonPremium: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  backButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    padding: 4,
    marginBottom: 25,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  tabText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#8B5CF6',
    fontSize: 13,
    fontWeight: '700',
  },
  termsContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  termsHeader: {
    backgroundColor: '#8B5CF6',
    padding: 15,
    alignItems: 'center',
  },
  termsHeaderText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  termsScroll: {
    flex: 1,
  },
  termsContent: {
    padding: 20,
  },
  termSection: {
    marginBottom: 20,
  },
  termsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 10,
  },
  termsText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 6,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxActive: {
    backgroundColor: 'white',
    borderColor: 'white',
  },
  checkmark: {
    color: '#8B5CF6',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
  },
  acceptButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  acceptButtonActive: {
    backgroundColor: 'white',
    borderColor: 'white',
  },
  acceptButtonText: {
    color: '#8B5CF6',
    fontSize: 16,
    fontWeight: '700',
  },
  infoSectionPremium: {
    flex: 1,
    justifyContent: 'center',
  },
  premiumInfoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardIconLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  cardIconLargeText: {
    fontSize: 24,
  },
  cardContentLarge: {
    flex: 1,
  },
  premiumCardTitle: {
    color: '#1F2937',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  premiumCardSubtitle: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  cardArrowContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardArrow: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  featuredButton: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderRadius: 25,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  featuredButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 25,
  },
  featuredButtonIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  featuredButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  bottomNavContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 15,
    position: 'relative',
  },
  navItemActive: {
    backgroundColor: '#8B5CF6',
    transform: [{ scale: 1.1 }],
  },
  navIcon: {
    fontSize: 20,
    color: '#6B7280',
  },
  navIconActive: {
    color: 'white',
  },
  navIndicator: {
    position: 'absolute',
    bottom: -8,
    width: 20,
    height: 3,
    backgroundColor: '#8B5CF6',
    borderRadius: 2,
  },
});

export { TuPerfil, Configuracion, DatosDangStore };