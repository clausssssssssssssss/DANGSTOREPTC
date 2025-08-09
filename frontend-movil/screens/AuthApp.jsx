import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const AuthApp = ({ navigation }) => {
  // Estados para manejar las pantallas
  const [currentScreen, setCurrentScreen] = useState('welcome'); // welcome, login, register
  
  // Estados para el formulario de registro
  const [registerData, setRegisterData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
  });
  
  // Estados para el formulario de login
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });
  
  // Estados para validación y UI
  const [showPassword, setShowPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Validación de email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validación de contraseña
  const validatePassword = (password) => {
    return password.length >= 6;
  };

  // Validación de campos de registro
  const validateRegisterForm = () => {
    const newErrors = {};
    
    if (!registerData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }
    
    if (!registerData.apellido.trim()) {
      newErrors.apellido = 'El apellido es requerido';
    }
    
    if (!registerData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!validateEmail(registerData.email)) {
      newErrors.email = 'El email no es válido';
    }
    
    if (!registerData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (!validatePassword(registerData.password)) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validación de campos de login
  const validateLoginForm = () => {
    const newErrors = {};
    
    if (!loginData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!validateEmail(loginData.email)) {
      newErrors.email = 'El email no es válido';
    }
    
    if (!loginData.password) {
      newErrors.password = 'La contraseña es requerida';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejo de registro
  const handleRegister = async () => {
    if (!validateRegisterForm()) return;
    
    setLoading(true);
    
    try {
      // Simulación de llamada a API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Aquí iría la lógica real de registro
      console.log('Datos de registro:', registerData);
      
             Alert.alert(
         '¡Registro Exitoso!',
         'Tu cuenta ha sido creada correctamente',
         [
           {
             text: 'OK',
             onPress: () => {
               // Navegar a la aplicación principal
               navigation.navigate('MainApp');
             }
           }
         ]
       );
      
    } catch (error) {
      Alert.alert('Error', 'Hubo un problema al registrar tu cuenta. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Manejo de login
  const handleLogin = async () => {
    if (!validateLoginForm()) return;
    
    setLoading(true);
    
    try {
      // Simulación de llamada a API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Aquí iría la lógica real de login
      console.log('Datos de login:', loginData);
      
             Alert.alert(
         '¡Bienvenido!',
         'Has iniciado sesión correctamente',
         [
           {
             text: 'OK',
             onPress: () => {
               // Navegar a la aplicación principal
               navigation.navigate('MainApp');
             }
           }
         ]
       );
      
    } catch (error) {
      Alert.alert('Error', 'Credenciales incorrectas. Verifica tu email y contraseña.');
    } finally {
      setLoading(false);
    }
  };

  // Componente del llavero
  const KeychainComponent = () => (
    <View style={styles.keychainContainer}>
      <View style={styles.keychain}>
        <View style={styles.keychainRing}>
          <View style={styles.butterflyCharm}>
            <Text style={styles.charmText}>🦋</Text>
          </View>
          <View style={styles.letterCharm}>
            <Text style={styles.letterText}>A</Text>
          </View>
        </View>
      </View>
    </View>
  );

    // Pantalla de bienvenida
  const WelcomeScreen = () => (
    <View style={styles.container}>
      <LinearGradient
        colors={['#8B5CF6', '#A78BFA']}
        style={styles.gradientBackground}
      >
        <View style={styles.background}>
          <Text style={styles.dangText}>DANG</Text>
        </View>
        
        <View style={styles.content}>
          <KeychainComponent />
          
          <Text style={styles.title}>No soy yo, es el DANG que brilla</Text>
          <Text style={styles.subtitle}>El llavero perfecto para ti</Text>
        </View>
      </LinearGradient>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => {
            console.log('Botón Empezar presionado');
            setCurrentScreen('selection');
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.startButtonText}>Empezar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Pantalla de selección (registro/login)
  const SelectionScreen = () => (
    <LinearGradient
      colors={['#6B7280', '#8B5CF6']}
      style={styles.container}
    >
      <View style={styles.background}>
        <Text style={styles.dangText}>DANG</Text>
      </View>
      
      <View style={styles.content}>
        <KeychainComponent />
        
        <Text style={styles.title}>¡Bienvenido! A DANG</Text>
        <Text style={styles.subtitle}>
          ¡Registrate! o si ya tienes una cuenta inicia sesión.
        </Text>
        
        <View style={styles.authButtons}>
          <TouchableOpacity
            style={[styles.authButton, styles.primaryButton]}
            onPress={() => setCurrentScreen('register')}
          >
            <Text style={styles.primaryButtonText}>Registrarse</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.authButton, styles.secondaryButton]}
            onPress={() => setCurrentScreen('login')}
          >
            <Text style={styles.secondaryButtonText}>Iniciar Sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );

  // Pantalla de registro
  const RegisterScreen = () => (
    <LinearGradient
      colors={['#8B5CF6', '#EC4899']}
      style={styles.container}
    >
      <View style={styles.background}>
        <Text style={styles.dangText}>DANG</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.form}>
          <View style={styles.formHeader}>
                         <TouchableOpacity
               style={styles.backButton}
               onPress={() => setCurrentScreen('selection')}
             >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.formTitle}>¡Hola! Un gusto</Text>
          </View>
          
          <View style={styles.chLogo}>
            <Text style={styles.chLogoText}>CH</Text>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Nombre</Text>
            <TextInput
              style={[styles.formInput, errors.nombre && styles.inputError]}
              value={registerData.nombre}
              onChangeText={(text) => setRegisterData({...registerData, nombre: text})}
              placeholder="Ingresa tu nombre"
              placeholderTextColor="#9CA3AF"
            />
            {errors.nombre && (
              <Text style={styles.errorMessage}>⚠️ {errors.nombre}</Text>
            )}
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Apellido</Text>
            <TextInput
              style={[styles.formInput, errors.apellido && styles.inputError]}
              value={registerData.apellido}
              onChangeText={(text) => setRegisterData({...registerData, apellido: text})}
              placeholder="Ingresa tu apellido"
              placeholderTextColor="#9CA3AF"
            />
            {errors.apellido && (
              <Text style={styles.errorMessage}>⚠️ {errors.apellido}</Text>
            )}
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Gmail</Text>
            <TextInput
              style={[styles.formInput, errors.email && styles.inputError]}
              value={registerData.email}
              onChangeText={(text) => setRegisterData({...registerData, email: text})}
              placeholder="tuemail@gmail.com"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && (
              <Text style={styles.errorMessage}>⚠️ {errors.email}</Text>
            )}
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Contraseña</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.formInput, styles.passwordInput, errors.password && styles.inputError]}
                value={registerData.password}
                onChangeText={(text) => setRegisterData({...registerData, password: text})}
                placeholder="Ingresa tu contraseña"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.passwordToggleText}>
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </Text>
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text style={styles.errorMessage}>⚠️ {errors.password}</Text>
            )}
          </View>
          
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#FFFFFF" size="small" />
                <Text style={styles.submitButtonText}>Procesando...</Text>
              </View>
            ) : (
              <Text style={styles.submitButtonText}>Continuar</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );

  // Pantalla de login
  const LoginScreen = () => (
    <LinearGradient
      colors={['#8B5CF6', '#EC4899']}
      style={styles.container}
    >
      <View style={styles.background}>
        <Text style={styles.dangText}>DANG</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.form}>
        <TouchableOpacity
               style={styles.backButton}
               onPress={() => setCurrentScreen('selection')}
             >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
          <Text style={styles.formTitle}>¡Bienvenido!</Text>
          
          <View style={styles.chLogo}>
            <Text style={styles.chLogoText}>CH</Text>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Correo Electrónico</Text>
            <TextInput
              style={[styles.formInput, errors.email && styles.inputError]}
              value={loginData.email}
              onChangeText={(text) => setLoginData({...loginData, email: text})}
              placeholder="tuemail@gmail.com"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && (
              <Text style={styles.errorMessage}>⚠️ {errors.email}</Text>
            )}
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Contraseña</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.formInput, styles.passwordInput, errors.password && styles.inputError]}
                value={loginData.password}
                onChangeText={(text) => setLoginData({...loginData, password: text})}
                placeholder="Ingresa tu contraseña"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showLoginPassword}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowLoginPassword(!showLoginPassword)}
              >
                <Text style={styles.passwordToggleText}>
                  {showLoginPassword ? '👁️' : '👁️‍🗨️'}
                </Text>
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text style={styles.errorMessage}>⚠️ {errors.password}</Text>
            )}
          </View>
          
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#FFFFFF" size="small" />
                <Text style={styles.submitButtonText}>Iniciando...</Text>
              </View>
            ) : (
              <Text style={styles.submitButtonText}>Iniciar sesión</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );

  // Renderizado condicional de pantallas
  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return <WelcomeScreen />;
      case 'selection':
        return <SelectionScreen />;
      case 'register':
        return <RegisterScreen />;
      case 'login':
        return <LoginScreen />;
      default:
        return <WelcomeScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {renderScreen()}
      {/* Debug info */}
      <View style={styles.debugInfo}>
        <Text style={styles.debugText}>Pantalla actual: {currentScreen}</Text>
      </View>
    </SafeAreaView>
  );
};

// Estilos inline para React Native
const styles = {
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    position: 'relative',
  },
  gradientBackground: {
    flex: 1,
    position: 'relative',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dangText: {
    fontSize: Math.max(80, width * 0.2),
    fontWeight: 'bold',
    color: '#FFFFFF',
    transform: [{ rotate: '-15deg' }],
    letterSpacing: 8,
  },
  content: {
    flex: 1,
    padding: Math.max(20, width * 0.05),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    zIndex: 2,
  },
  keychainContainer: {
    marginBottom: Math.max(30, height * 0.04),
    alignItems: 'center',
  },
  keychain: {
    width: Math.max(150, width * 0.35),
    height: Math.max(150, width * 0.35),
    backgroundColor: '#FFFFFF',
    borderRadius: Math.max(75, width * 0.175),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Math.max(15, height * 0.02),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    position: 'relative',
  },
  keychainRing: {
    width: Math.max(60, width * 0.15),
    height: Math.max(60, width * 0.15),
    borderWidth: 6,
    borderColor: '#8B5CF6',
    borderRadius: Math.max(30, width * 0.075),
    position: 'relative',
  },
  butterflyCharm: {
    position: 'absolute',
    top: -25,
    right: -15,
    width: Math.max(30, width * 0.07),
    height: Math.max(30, width * 0.07),
    backgroundColor: '#A78BFA',
    borderRadius: Math.max(15, width * 0.035),
    justifyContent: 'center',
    alignItems: 'center',
  },
  letterCharm: {
    position: 'absolute',
    bottom: -15,
    left: -12,
    width: Math.max(25, width * 0.06),
    height: Math.max(25, width * 0.06),
    backgroundColor: '#8B5CF6',
    borderRadius: Math.max(12.5, width * 0.03),
    justifyContent: 'center',
    alignItems: 'center',
  },
  charmText: {
    fontSize: Math.max(16, width * 0.04),
  },
  letterText: {
    fontSize: Math.max(14, width * 0.035),
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  title: {
    fontSize: Math.max(24, width * 0.06),
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: Math.max(8, height * 0.01),
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: Math.max(16, width * 0.04),
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: Math.max(30, height * 0.04),
    opacity: 0.9,
    lineHeight: Math.max(20, height * 0.025),
  },
  scrollIndicator: {
    position: 'absolute',
    bottom: Math.max(20, height * 0.025),
    left: '50%',
    transform: [{ translateX: -50 }],
    alignItems: 'center',
    color: '#FFFFFF',
    opacity: 0.8,
  },
  scrollArrow: {
    fontSize: Math.max(20, width * 0.05),
    marginBottom: Math.max(6, height * 0.008),
    color: '#FFFFFF',
  },
  scrollText: {
    fontSize: Math.max(12, width * 0.03),
    fontWeight: '500',
    color: '#FFFFFF',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: Math.max(80, height * 0.1),
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  startButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Math.max(30, width * 0.08),
    paddingVertical: Math.max(15, height * 0.02),
    borderRadius: Math.max(25, width * 0.06),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    minWidth: 120,
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: Math.max(18, width * 0.045),
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  authButtons: {
    width: '100%',
    maxWidth: Math.max(280, width * 0.7),
    gap: Math.max(12, height * 0.015),
  },
  authButton: {
    paddingVertical: Math.max(14, height * 0.018),
    paddingHorizontal: Math.max(20, width * 0.05),
    borderRadius: Math.max(25, width * 0.06),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryButton: {
    backgroundColor: '#FFFFFF',
  },
  primaryButtonText: {
    fontSize: Math.max(18, width * 0.045),
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  secondaryButtonText: {
    fontSize: Math.max(18, width * 0.045),
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: Math.max(20, width * 0.05),
    padding: Math.max(25, width * 0.06),
    width: '100%',
    maxWidth: Math.max(320, width * 0.8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 40,
    elevation: 15,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Math.max(25, height * 0.03),
  },
  backButton: {
    marginRight: Math.max(12, width * 0.03),
    padding: Math.max(4, width * 0.01),
    borderRadius: Math.max(20, width * 0.05),
  },
  backButtonText: {
    fontSize: Math.max(22, width * 0.055),
    color: '#8B5CF6',
  },
  formTitle: {
    fontSize: Math.max(22, width * 0.055),
    fontWeight: 'bold',
    color: '#1F2937',
    margin: 0,
  },
  chLogo: {
    width: Math.max(40, width * 0.1),
    height: Math.max(40, width * 0.1),
    backgroundColor: '#8B5CF6',
    borderRadius: Math.max(20, width * 0.05),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: Math.max(15, height * 0.02),
  },
  chLogoText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: Math.max(16, width * 0.04),
  },
  formGroup: {
    marginBottom: Math.max(15, height * 0.02),
  },
  formLabel: {
    fontSize: Math.max(13, width * 0.033),
    fontWeight: '600',
    color: '#374151',
    marginBottom: Math.max(6, height * 0.008),
  },
  formInput: {
    width: '100%',
    paddingVertical: Math.max(10, height * 0.013),
    paddingHorizontal: Math.max(12, width * 0.03),
    borderWidth: 2,
    borderColor: '#F3F4F6',
    borderRadius: Math.max(10, width * 0.025),
    fontSize: Math.max(15, width * 0.038),
  },
  inputError: {
    borderColor: '#EF4444',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: Math.max(45, width * 0.11),
  },
  passwordToggle: {
    position: 'absolute',
    right: Math.max(10, width * 0.025),
    top: '50%',
    transform: [{ translateY: -10 }],
    padding: Math.max(4, width * 0.01),
  },
  passwordToggleText: {
    fontSize: Math.max(16, width * 0.04),
    color: '#6B7280',
  },
  submitButton: {
    width: '100%',
    paddingVertical: Math.max(14, height * 0.018),
    backgroundColor: '#8B5CF6',
    borderRadius: Math.max(10, width * 0.025),
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: Math.max(17, width * 0.043),
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Math.max(8, width * 0.02),
  },
  errorMessage: {
    color: '#EF4444',
    fontSize: Math.max(12, width * 0.03),
    marginTop: Math.max(4, height * 0.005),
    flexDirection: 'row',
    alignItems: 'center',
  },
  debugInfo: {
    position: 'absolute',
    top: 50,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 5,
  },
  debugText: {
    color: 'white',
    fontSize: 12,
  },
};

export default AuthApp;