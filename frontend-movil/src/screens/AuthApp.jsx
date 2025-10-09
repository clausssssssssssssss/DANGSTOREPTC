import React, { useEffect, useState, useContext, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Image, 
  Platform, 
  KeyboardAvoidingView, 
  ScrollView 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext.js';
import { AuthAppStyles } from '../components/styles/AuthAppStyles';


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
    <SafeAreaView style={AuthAppStyles.safeArea}>
      <LinearGradient colors={["#6E59A4", "#3B3B3B"]} style={AuthAppStyles.container}>
        {/* Imágenes decorativas */}
        <Image 
          source={require('../assets/logo.png')} 
          style={AuthAppStyles.cornerTopLeft} 
          resizeMode="contain" 
        />
        <Image 
          source={require('../assets/logo.png')} 
          style={AuthAppStyles.cornerBottomRight} 
          resizeMode="contain" 
        />
        <Image
          source={require('../assets/logo2.png')}
          style={AuthAppStyles.cornerTopRight}
          resizeMode="contain"
        />

        {/* Contenido principal */}
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={{ flex: 1 }} 
          keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
        >
          <ScrollView 
            contentContainerStyle={AuthAppStyles.content} 
            keyboardShouldPersistTaps="handled"
          >
            <Text style={AuthAppStyles.pageTitle}>¡Bienvenido!</Text>
            
            <View style={AuthAppStyles.card}>
              <Image 
                source={require('../assets/icon.png')} 
                style={AuthAppStyles.logo} 
                resizeMode="contain" 
              />

              {/* Campo Email */}
              <Text style={AuthAppStyles.label}>Correo Electrónico</Text>
            <TextInput
                style={[AuthAppStyles.field, errors.email && AuthAppStyles.inputError]}
                value={email}
                onChangeText={setEmail}
                placeholder="correo@ejemplo.com"
                placeholderTextColor="#B7B9C9"
              keyboardType="email-address"
              autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={() => passwordInputRef.current.focus()}
            />
            {errors.email && (
                <Text style={AuthAppStyles.errorMessage}>{errors.email}</Text>
              )}

              {/* Campo Contraseña */}
              <Text style={[AuthAppStyles.label, { marginTop: 14 }]}>Contraseña</Text>
              <View style={AuthAppStyles.passwordRow}>
              <TextInput
                  ref={passwordInputRef}
                  style={[AuthAppStyles.field, AuthAppStyles.passwordField, errors.password && AuthAppStyles.inputError]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#B7B9C9"
                secureTextEntry={!showPassword}
                  returnKeyType="go"
                  onSubmitEditing={handleLogin}
              />
              <TouchableOpacity
                  style={AuthAppStyles.eyeButton} 
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
                <Text style={AuthAppStyles.errorMessage}>{errors.password}</Text>
            )}
          
              {/* Recordar usuario */}
              <View style={AuthAppStyles.rememberRow}>
          <TouchableOpacity
                  style={AuthAppStyles.rememberContainer}
                  onPress={() => handleRememberMeChange(!rememberMe)}
                >
                  <View style={[AuthAppStyles.checkbox, rememberMe && AuthAppStyles.checked]}>
                    {rememberMe && <Text style={AuthAppStyles.checkmark}>✓</Text>}
              </View>
                  <Text style={AuthAppStyles.rememberText}>Recordar mi usuario</Text>
          </TouchableOpacity>
        </View>
        


              {/* Botón de Login */}
        <TouchableOpacity
                style={AuthAppStyles.cta} 
                activeOpacity={0.9} 
            onPress={handleLogin}
            disabled={loading}
              >
                <LinearGradient 
                  colors={["#8A79FF", "#B6A6FF"]} 
                  start={{x:0,y:0}} 
                  end={{x:1,y:0}} 
                  style={[AuthAppStyles.ctaBg, loading && { opacity: 0.8 }]}
          >
            {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
                    <Text style={AuthAppStyles.ctaText}>Iniciar sesión</Text>
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


export default AuthApp;