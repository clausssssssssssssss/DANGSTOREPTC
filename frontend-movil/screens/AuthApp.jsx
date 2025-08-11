import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator, SafeAreaView, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { loginAdmin, getAuthToken } from '../services/api';

const { width, height } = Dimensions.get('window');

const AuthApp = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const validateLoginForm = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'El email es requerido';
    else if (!validateEmail(email)) newErrors.email = 'El email no es válido';
    if (!password) newErrors.password = 'La contraseña es requerida';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateLoginForm()) return;
    setLoading(true);
    try {
      const data = await loginAdmin(email.trim(), password);
      Alert.alert('¡Bienvenido!', data?.message || 'Inicio de sesión exitoso', [
        { text: 'OK', onPress: () => navigation.replace('MainApp') },
      ]);
    } catch (error) {
      Alert.alert('Error', error?.message || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  // Si ya existe un token (sesión previa), entrar directo
  useEffect(() => {
    (async () => {
      const token = await getAuthToken();
      if (token) {
        navigation.replace('MainApp');
      }
    })();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={["#6E59A4", "#3B3B3B"]} style={styles.container}>
        {/* Imágenes decorativas (arriba-izquierda y abajo-derecha) */}
        <Image source={require('../assets/image-removebg-preview (1).png')} style={styles.cornerTopLeft} resizeMode="contain" />
        <Image source={require('../assets/image-removebg-preview (1).png')} style={styles.cornerBottomRight} resizeMode="contain" />

        {/* Título */}
        <Text style={styles.pageTitle}>¡Bienvenido!</Text>

        {/* Tarjeta de login */}
        <View style={styles.content}>
          <View style={styles.card}>
            <Image source={require('../assets/DANGSTORELOGOPRUEBA__1.png')} style={styles.logo} resizeMode="contain" />

            <Text style={styles.label}>Correo Electronico</Text>
            <TextInput
              style={[styles.field, errors.email && styles.inputError]}
              value={email}
              onChangeText={setEmail}
              placeholder="correo@ejemplo.com"
              placeholderTextColor="#B7B9C9"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={[styles.label, { marginTop: 14 }]}>Contraseña</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.field, styles.passwordField, errors.password && styles.inputError]}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#B7B9C9"
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword(!showPassword)}>
                <Text style={styles.eyeText}>👁️</Text>
              </TouchableOpacity>
            </View>
            {(errors.email || errors.password) && (
              <Text style={styles.errorMessage}>⚠️ {errors.email || errors.password}</Text>
            )}

            <TouchableOpacity style={styles.cta} activeOpacity={0.9} onPress={handleLogin} disabled={loading}>
              <LinearGradient colors={["#8A79FF", "#B6A6FF"]} start={{x:0,y:0}} end={{x:1,y:0}} style={[styles.ctaBg, loading && { opacity: 0.8 }] }>
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.ctaText}>Iniciar sesión</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = {
  safeArea: { flex: 1 },
  container: { flex: 1, position: 'relative' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: Math.max(16, width * 0.05) },
  pageTitle: { marginTop: Math.max(24, height * 0.03), color: '#FFFFFF', fontSize: Math.max(26, width * 0.065), fontWeight: '800', textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.45)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
  cornerTopLeft: {
    position: 'absolute',
    top: -height * 0.01,
    left: -width * 0.32,
    width: Math.max(200, width * 0.20),
    height: Math.max(200, width * 0.50),
    opacity: 1,
    transform: [{ rotate: '-18deg' }],
  },
  cornerTopRight: {
    position: 'absolute',
    top: -height * 0.16,
    right: -width * 0.16,
    width: Math.max(50, width * 0.88),    height: Math.max(300, width * 0.78),
    opacity: 1,
    transform: [{ rotate: '1deg' }],
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: Math.max(12, height * 0.02),
    right: -width * 0.18,
    width: Math.max(170, width * 0.42),
    height: Math.max(170, width * 0.42),
    opacity: 0.95,
    transform: [{ scaleX: -1 }, { rotate: '-8deg' }],
  },
  card: { width: '90%', backgroundColor: '#FFFFFF', borderRadius: 18, paddingVertical: Math.max(58, height * 0.038), paddingHorizontal: Math.max(24, width * 0.04), shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.22, shadowRadius: 34, elevation: 12 },
  logo: { alignSelf: 'center', width: 85, height: 85, marginBottom: 8 },
  label: { color: '#5A48D8', fontSize: 12, fontWeight: '600', marginBottom: 6 },
  field: { width: '100%', height: 40, backgroundColor: '#ECEAF5', borderRadius: 10, paddingHorizontal: 16, fontSize: 14, color: '#1F2937', borderWidth: 1, borderColor: 'transparent' },
  inputError: { borderColor: '#EF4444' },
  passwordRow: { position: 'relative' },
  passwordField: { paddingRight: 38 },
  eyeButton: { position: 'absolute', right: 8, top: 3, width: 32, height: 28, alignItems: 'center', justifyContent: 'center' },
  eyeText: { fontSize: 16, color: '#6B7280' },
  cta: { marginTop: 16 },
  ctaBg: { height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', shadowColor: '#8A79FF', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  ctaText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  errorMessage: { color: '#EF4444', fontSize: 12, marginTop: 6 },
};

export default AuthApp;