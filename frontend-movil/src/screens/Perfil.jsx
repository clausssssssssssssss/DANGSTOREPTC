import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ScrollView,
  StatusBar,
  Animated,
  LinearGradient,
  TextInput,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../context/AuthContext.js';
import { useFocusEffect } from '@react-navigation/native';
import { PerfilStyles } from '../components/styles/PerfilStyles';


// Componente principal del perfil
const TuPerfil = ({ navigation, userData }) => {
  const { user } = useContext(AuthContext);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useFocusEffect(
    React.useCallback(() => {
      // Reinicia valores y anima cada vez que la pantalla gana foco
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      const anim = Animated.parallel([
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
      ]);
      anim.start();
      return () => {
        anim.stop();
      };
    }, [fadeAnim, slideAnim])
  );

  return (
    <SafeAreaView style={PerfilStyles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Background con gradiente animado */}
      <View style={PerfilStyles.gradientBackground}>
        <View style={[PerfilStyles.gradientOverlay, { backgroundColor: '#8B5CF6' }]} />
        <View style={[PerfilStyles.gradientOverlay, { backgroundColor: 'rgba(139, 92, 246, 0.8)' }]} />
        
        {/* Elementos decorativos flotantes */}
        <View style={[PerfilStyles.floatingElement, PerfilStyles.element1]} />
        <View style={[PerfilStyles.floatingElement, PerfilStyles.element2]} />
        <View style={[PerfilStyles.floatingElement, PerfilStyles.element3]} />
      </View>

      <Animated.View 
        style={[
          PerfilStyles.content, 
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <Text style={PerfilStyles.headerLabel}>Inicial</Text>
        
        <Text style={PerfilStyles.mainTitle}>Tu Perfil</Text>
        
        {/* Container de imagen con efecto glassmorphism */}
        <View style={PerfilStyles.profileSection}>
          <View style={PerfilStyles.profileImageContainer}>
            <View style={PerfilStyles.imageGlow} />
            <Image 
              source={{ uri: (user?.profileImage || userData?.profileImage) || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face' }}
              style={PerfilStyles.profileImage}
            />
            <View style={PerfilStyles.profileBadge}>
              <Text style={PerfilStyles.badgeText}>✨</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={PerfilStyles.configButton}
            onPress={() => navigation.navigate('Configuracion')}
            activeOpacity={0.8}
          >
            <View style={PerfilStyles.buttonGradient}>
              <Text style={PerfilStyles.configButtonText}>⚙️ Configuración</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Cards de información con glassmorphism */}
        <View style={PerfilStyles.infoCardsContainer}>
          <View style={PerfilStyles.infoCard}>
            <View style={PerfilStyles.cardIcon}>
              <Text style={PerfilStyles.cardIconText}>👤</Text>
            </View>
            <View style={PerfilStyles.cardContent}>
              <Text style={PerfilStyles.cardLabel}>Nombre</Text>
              <Text style={PerfilStyles.cardValue}>{user?.name || userData?.nombre || 'Admin'}</Text>
            </View>
            <View style={PerfilStyles.cardAccent} />
          </View>
          
          {/* Eliminado: sección Apellido */}

          <View style={PerfilStyles.infoCard}>
            <View style={PerfilStyles.cardIcon}>
              <Text style={PerfilStyles.cardIconText}>📧</Text>
            </View>
            <View style={PerfilStyles.cardContent}>
              <Text style={PerfilStyles.cardLabel}>Email</Text>
              <Text style={PerfilStyles.cardValue}>{user?.email || userData?.email || 'admin@email.com'}</Text>
            </View>
            <View style={PerfilStyles.cardAccent} />
          </View>
        </View>

        {/* Accesos rápidos: Políticas y DangStore */}
        <View style={PerfilStyles.tabsContainer}>
          <TouchableOpacity 
            style={PerfilStyles.tab}
            onPress={() => navigation.navigate('Configuracion')}
            activeOpacity={0.8}
          >
            <Text style={PerfilStyles.tabText}>📋 Políticas</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[PerfilStyles.tab, PerfilStyles.activeTab]}
            onPress={() => navigation.navigate('DatosDangStore')}
            activeOpacity={0.8}
          >
            <Text style={PerfilStyles.activeTabText}>🏪 DangStore</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
      
      {/* Eliminado: navegación inferior duplicada. Se usa la barra global de pestañas. */}
    </SafeAreaView>
  );
};

// Pantalla de Configuración: permite editar foto, nombre y email del admin
const Configuracion = ({ navigation }) => {
  const { user, updateAdminProfile } = useContext(AuthContext);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    React.useCallback(() => {
      slideAnim.setValue(0);
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
      return () => {};
    }, [slideAnim])
  );

  return (
    <SafeAreaView style={PerfilStyles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Background Premium */}
      <View style={PerfilStyles.gradientBackground}>
        <View style={[PerfilStyles.gradientOverlay, { backgroundColor: '#8B5CF6' }]} />
        <View style={[PerfilStyles.gradientOverlay, { backgroundColor: 'rgba(139, 92, 246, 0.9)' }]} />
        <View style={[PerfilStyles.floatingElement, PerfilStyles.element1]} />
        <View style={[PerfilStyles.floatingElement, PerfilStyles.element2]} />
      </View>

      <Animated.View 
        style={[
          PerfilStyles.content,
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
        <View style={PerfilStyles.headerContainer}>
          <TouchableOpacity 
            style={PerfilStyles.backButtonPremium}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={PerfilStyles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={PerfilStyles.headerLabel}>Inicial</Text>
        </View>
        
        <Text style={PerfilStyles.mainTitle}>Configuración</Text>
        
        {/* Formulario simple de perfil */}
        <View style={{ marginBottom: 20 }}>
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={async () => {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                  Alert.alert('Permisos requeridos', 'Se requiere acceso a la galería para elegir la foto.');
                  return;
                }
                const result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  allowsEditing: true,
                  aspect: [1, 1],
                  quality: 0.7,
                  base64: true,
                });
                if (!result.canceled && result.assets?.[0]?.base64) {
                  const dataUri = `data:image/jpeg;base64,${result.assets[0].base64}`;
                  setProfileImage(dataUri);
                }
              }}
            >
              <Image
                source={{ uri: profileImage || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face' }}
                style={{ width: 110, height: 110, borderRadius: 55, borderWidth: 3, borderColor: '#fff' }}
              />
            </TouchableOpacity>
            <Text style={{ color: 'white', marginTop: 8 }}>Toca para cambiar foto</Text>
          </View>

          <View style={{ backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 14, padding: 14, marginBottom: 10 }}>
            <Text style={{ color: '#374151', marginBottom: 6, fontWeight: '700' }}>Nombre</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Tu nombre"
              placeholderTextColor="#9CA3AF"
              style={{ backgroundColor: '#F3F4F6', borderRadius: 10, paddingHorizontal: 12, height: 44, color: '#111827' }}
            />
          </View>

          <View style={{ backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 14, padding: 14 }}>
            <Text style={{ color: '#374151', marginBottom: 6, fontWeight: '700' }}>Correo</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="correo@ejemplo.com"
              placeholderTextColor="#9CA3AF"
              style={{ backgroundColor: '#F3F4F6', borderRadius: 10, paddingHorizontal: 12, height: 44, color: '#111827' }}
            />
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={async () => {
            if (!name.trim() || !email.trim()) {
              Alert.alert('Campos requeridos', 'Nombre y correo son obligatorios.');
              return;
            }
            setSaving(true);
            await updateAdminProfile({ name, email, profileImage });
            setSaving(false);
          }}
          style={[PerfilStyles.acceptButton, { backgroundColor: 'white' }]}
        >
          <Text style={[PerfilStyles.acceptButtonText, { color: '#8B5CF6' }]}>{saving ? 'Guardando…' : 'Guardar cambios'}</Text>
        </TouchableOpacity>

        {/* Eliminados términos y condiciones */}
      </Animated.View>
      
      {/* Eliminado: navegación inferior duplicada. */}
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
    <SafeAreaView style={PerfilStyles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Background Premium */}
      <View style={PerfilStyles.gradientBackground}>
        <View style={[PerfilStyles.gradientOverlay, { backgroundColor: '#8B5CF6' }]} />
        <View style={[PerfilStyles.gradientOverlay, { backgroundColor: 'rgba(139, 92, 246, 0.8)' }]} />
        <View style={[PerfilStyles.floatingElement, PerfilStyles.element1]} />
        <View style={[PerfilStyles.floatingElement, PerfilStyles.element3]} />
      </View>

      <Animated.View 
        style={[
          PerfilStyles.content,
          {
            transform: [{ scale: bounceAnim }]
          }
        ]}
      >
        {/* Header Premium */}
        <View style={PerfilStyles.headerContainer}>
          <TouchableOpacity 
            style={PerfilStyles.backButtonPremium}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={PerfilStyles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={PerfilStyles.headerLabel}>Inicial</Text>
        </View>
        
        <Text style={PerfilStyles.mainTitle}>Datos de{'\n'}🏪 DangStore</Text>
        
        {/* Tabs Premium */}
        <View style={PerfilStyles.tabsContainer}>
          <TouchableOpacity 
            style={PerfilStyles.tab}
            onPress={() => navigation.navigate('Configuracion')}
            activeOpacity={0.8}
          >
            <Text style={PerfilStyles.tabText}>📋 Políticas</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[PerfilStyles.tab, PerfilStyles.activeTab]}
            activeOpacity={0.8}
          >
            <Text style={PerfilStyles.activeTabText}>🏪 DangStore</Text>
          </TouchableOpacity>
        </View>
        
        {/* Cards de información Premium */}
        <View style={PerfilStyles.infoSectionPremium}>
          <TouchableOpacity style={PerfilStyles.premiumInfoCard} activeOpacity={0.8}>
            <View style={PerfilStyles.cardIconLarge}>
              <Text style={PerfilStyles.cardIconLargeText}>🏢</Text>
            </View>
            <View style={PerfilStyles.cardContentLarge}>
              <Text style={PerfilStyles.premiumCardTitle}>Quienes Somos</Text>
              <Text style={PerfilStyles.premiumCardSubtitle}>Conoce nuestra historia</Text>
            </View>
            <View style={PerfilStyles.cardArrowContainer}>
              <Text style={PerfilStyles.cardArrow}>→</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={PerfilStyles.premiumInfoCard} activeOpacity={0.8}>
            <View style={PerfilStyles.cardIconLarge}>
              <Text style={PerfilStyles.cardIconLargeText}>🎯</Text>
            </View>
            <View style={PerfilStyles.cardContentLarge}>
              <Text style={PerfilStyles.premiumCardTitle}>Misión y Visión</Text>
              <Text style={PerfilStyles.premiumCardSubtitle}>Nuestros objetivos</Text>
            </View>
            <View style={PerfilStyles.cardArrowContainer}>
              <Text style={PerfilStyles.cardArrow}>→</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Botón destacado */}
        <TouchableOpacity style={PerfilStyles.featuredButton} activeOpacity={0.8}>
          <View style={PerfilStyles.featuredButtonContent}>
            <Text style={PerfilStyles.featuredButtonIcon}>✨</Text>
            <Text style={PerfilStyles.featuredButtonText}>Misión y Visión</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
      
      {/* Eliminado: navegación inferior duplicada. */}
    </SafeAreaView>
  );
};


export { TuPerfil, Configuracion, DatosDangStore };