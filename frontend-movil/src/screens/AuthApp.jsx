import React, { useEffect, useState, useContext, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  Image, 
  Platform, 
  KeyboardAvoidingView, 
  ScrollView 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext.js';

const { width, height } = Dimensions.get('window');

const AuthApp = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);
  const passwordInputRef = useRef(null);
  const { user, login, parseJwt, setUser, savedCredentials, clearSavedCredentials } = useContext(AuthContext);

  // Validaciones
  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const validatePassword = (value) => value.length >= 6;

  const validateLoginForm = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!validateEmail(email)) {
      newErrors.email = 'El email no es válido';
    }
    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (!validatePassword(password)) {
      newErrors.password = 'Mínimo 6 caracteres';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateLoginForm()) return;
    
    setLoading(true);
    try {
      const success = await login(email, password, rememberMe);
      if (success) {
        navigation.replace('MainApp');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Ocurrió un problema al iniciar sesión. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleRememberMeChange = async (value) => {
    setRememberMe(value);
    
    // Si se desmarca "Recordar mi usuario" y hay credenciales guardadas, limpiarlas
    if (!value && savedCredentials) {
      await clearSavedCredentials();
    }
  };

  // Si ya existe sesión en contexto, entrar directo
  useEffect(() => {
    if (user?.token) {
      navigation.replace('MainApp');
    }
  }, [user?.token]);

  // Cargar credenciales guardadas al abrir la app
  useEffect(() => {
    if (savedCredentials) {
      setEmail(savedCredentials.email);
      setPassword(savedCredentials.password);
      setRememberMe(true);
    }
  }, [savedCredentials]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={["#6E59A4", "#3B3B3B"]} style={styles.container}>
        {/* Imágenes decorativas */}
        <Image 
          source={require('../assets/image-removebg-preview (1).png')} 
          style={styles.cornerTopLeft} 
          resizeMode="contain" 
        />
        <Image 
          source={require('../assets/image-removebg-preview (1).png')} 
          style={styles.cornerBottomRight} 
          resizeMode="contain" 
        />
        <Image
          source={require('../assets/image-removebg-preview.png')}
          style={styles.cornerTopRight}
          resizeMode="contain"
        />

        {/* Contenido principal */}
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={{ flex: 1 }} 
          keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
        >
          <ScrollView 
            contentContainerStyle={styles.content} 
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.pageTitle}>¡Bienvenido!</Text>
            
            <View style={styles.card}>
              <Image 
                source={require('../assets/icon.png')} 
                style={styles.logo} 
                resizeMode="contain" 
              />

              {/* Campo Email */}
              <Text style={styles.label}>Correo Electrónico</Text>
            <TextInput
                style={[styles.field, errors.email && styles.inputError]}
                value={email}
                onChangeText={setEmail}
                placeholder="correo@ejemplo.com"
                placeholderTextColor="#B7B9C9"
              keyboardType="email-address"
              autoCapitalize="none"
                autoCorrect={false}
                autoFocus={true}
                returnKeyType="next"
                onSubmitEditing={() => passwordInputRef.current.focus()}
            />
            {errors.email && (
                <Text style={styles.errorMessage}>{errors.email}</Text>
              )}

              {/* Campo Contraseña */}
              <Text style={[styles.label, { marginTop: 14 }]}>Contraseña</Text>
              <View style={styles.passwordRow}>
              <TextInput
                  ref={passwordInputRef}
                  style={[styles.field, styles.passwordField, errors.password && styles.inputError]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#B7B9C9"
                secureTextEntry={!showPassword}
                  returnKeyType="go"
                  onSubmitEditing={handleLogin}
              />
              <TouchableOpacity
                  style={styles.eyeButton} 
                onPress={() => setShowPassword(!showPassword)}
              >
                  <Ionicons 
                    name={showPassword ? 'eye-off' : 'eye'} 
                    size={20} 
                    color="#6B7280" 
                  />
              </TouchableOpacity>
            </View>
            {errors.password && (
                <Text style={styles.errorMessage}>{errors.password}</Text>
            )}
          
              {/* Recordar usuario */}
              <View style={styles.rememberRow}>
          <TouchableOpacity
                  style={styles.rememberContainer}
                  onPress={() => handleRememberMeChange(!rememberMe)}
                >
                  <View style={[styles.checkbox, rememberMe && styles.checked]}>
                    {rememberMe && <Text style={styles.checkmark}>✓</Text>}
              </View>
                  <Text style={styles.rememberText}>Recordar mi usuario</Text>
          </TouchableOpacity>
        </View>
        


              {/* Botón de Login */}
        <TouchableOpacity
                style={styles.cta} 
                activeOpacity={0.9} 
            onPress={handleLogin}
            disabled={loading}
              >
                <LinearGradient 
                  colors={["#8A79FF", "#B6A6FF"]} 
                  start={{x:0,y:0}} 
                  end={{x:1,y:0}} 
                  style={[styles.ctaBg, loading && { opacity: 0.8 }]}
          >
            {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
                    <Text style={styles.ctaText}>Iniciar sesión</Text>
            )}
                </LinearGradient>
          </TouchableOpacity>
        </View>
          </ScrollView>
        </KeyboardAvoidingView>
    </LinearGradient>
    </SafeAreaView>
  );
};

const styles = {
  safeArea: { flex: 1 },
  container: {
    flex: 1,
    position: 'relative',
    paddingBottom: Platform.OS === 'android' ? 20 : 0
  },
  content: {
    flexGrow: 1, 
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Math.max(16, width * 0.05),
    paddingVertical: 20
  },
  pageTitle: { 
    marginTop: 2,
    marginBottom: 25,
    color: '#FFFFFF',
    fontSize: Math.max(26, width * 0.065), 
    fontWeight: '800', 
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.45)', 
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    fontFamily: Platform.select({ ios: 'HelveticaNeue', android: 'sans-serif-medium' })
  },
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
    width: Math.max(50, width * 0.88),
    height: Math.max(300, width * 0.78),
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
  card: { 
    width: '95%', 
    backgroundColor: '#FFFFFF',
    borderRadius: 16, 
    paddingTop: Math.max(23, height * 0.02),
    paddingBottom: Math.max(36, height * 0.03),
    paddingHorizontal: Math.max(20, width * 0.06), 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.22, 
    shadowRadius: 34, 
    elevation: 12 
  },
  logo: { 
    alignSelf: 'center', 
    width: 75, 
    height: 85, 
    marginBottom: 6, 
    marginTop: -6 
  },
  label: { 
    color: '#5A48D8', 
    fontSize: 12, 
    fontWeight: '600', 
    marginBottom: 6 
  },
  field: { 
    width: '100%',
    height: 50, 
    backgroundColor: '#ECEAF5', 
    borderRadius: 10, 
    paddingHorizontal: 16, 
    fontSize: 14, 
    color: '#1F2937', 
    borderWidth: 1, 
    borderColor: 'transparent' 
  },
  inputError: { 
    borderColor: '#EF4444',
    backgroundColor: '#FEE2E2' 
  },
  passwordRow: { 
    position: 'relative' 
  },
  passwordField: { 
    paddingRight: 38 
  },
  eyeButton: { 
    position: 'absolute', 
    right: 7, 
    top: 10, 
    width: 30, 
    height: 28, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  rememberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 16
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8
  },
  checked: {
    backgroundColor: '#5A48D8',
    borderColor: '#5A48D8'
  },
  checkmark: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold'
  },
  rememberText: {
    color: '#6B7280',
    fontSize: 13
  },
  forgotText: {
    color: '#5A48D8',
    fontSize: 12,
    fontWeight: '500'
  },
  cta: { 
    marginTop: 8 
  },
  ctaBg: { 
    height: 50, 
    borderRadius: 10, 
    alignItems: 'center',
    justifyContent: 'center', 
    shadowColor: '#8A79FF', 
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12, 
    elevation: 6 
  },
  ctaText: { 
    color: '#FFFFFF',
    fontSize: 16, 
    fontWeight: '700' 
  },
  errorMessage: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500' 
  },
  savedCredentialsInfo: {
    marginTop: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  savedCredentialsText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
};

export default AuthApp;