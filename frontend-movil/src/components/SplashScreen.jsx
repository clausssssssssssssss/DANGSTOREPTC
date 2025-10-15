import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Dimensions, View, Image, Text, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ navigation }) {
  const [isVisible, setIsVisible] = useState(true);
  
  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const logoRotateAnim = useRef(new Animated.Value(0)).current;
  const logoFloatAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Animación de entrada del logo con rebote
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 30,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(logoRotateAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Animación de flotación continua del logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoFloatAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(logoFloatAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Animación de resplandor pulsante
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Navegación automática (más tiempo para mostrar el splash)
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (navigation && navigation.navigate) {
          navigation.navigate('AuthApp');
        }
      });
    }, 4500);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  const logoRotation = logoRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const logoFloat = logoFloatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const glowScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15],
  });

  return (
    <LinearGradient
      colors={['#6E59A4', '#3B3B3B']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      {/* Contenedor principal centrado */}
      <Animated.View
        style={[
          styles.mainContent,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Logo con animación bonita */}
        <View style={styles.logoSection}>
          {/* Resplandor animado detrás del logo */}
          <Animated.View
            style={[
              styles.logoGlow,
              {
                opacity: glowOpacity,
                transform: [{ scale: glowScale }],
              },
            ]}
          />
          
          {/* Logo con rotación y flotación */}
          <Animated.View
            style={{
              transform: [
                { rotate: logoRotation },
                { translateY: logoFloat },
                { scale: scaleAnim },
              ],
            }}
          >
            <View style={styles.logoContainer}>
              <Image
                source={require('../assets/DANGSTORELOGOPRUEBA__1.png')}
                style={styles.logo}
                resizeMode="cover"
              />
            </View>
          </Animated.View>
        </View>

        {/* Nombre de la marca */}
        <Animated.View
          style={[
            styles.brandSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideUpAnim }],
            },
          ]}
        >
          <Text style={styles.brandName}>DANGSTORE</Text>
          <View style={styles.brandDivider} />
          <Text style={styles.brandTagline}>Tu Tienda de Creatividad</Text>
        </Animated.View>

        {/* Indicador de carga */}
        <Animated.View
          style={[
            styles.loadingSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideUpAnim }],
            },
          ]}
        >
          <View style={styles.dotsContainer}>
            {[0, 1, 2].map((index) => (
              <Animated.View
                key={index}
                style={[
                  styles.loadingDot,
                  {
                    opacity: glowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: index === 0 ? [0.5, 1] : 
                                    index === 1 ? [1, 0.5] : 
                                    [0.5, 1],
                    }),
                    transform: [{
                      scale: glowAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: index === 0 ? [1, 1.3] : 
                                      index === 1 ? [1.3, 1] : 
                                      [1, 1.3],
                      }),
                    }],
                  },
                ]}
              />
            ))}
          </View>
        </Animated.View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width,
    height,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  mainContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  logoSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  logoGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  brandName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 3,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 8,
  },
  brandDivider: {
    width: 60,
    height: 2,
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    borderRadius: 1,
  },
  brandTagline: {
    fontSize: 16,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    letterSpacing: 1,
    fontStyle: 'italic',
  },
  loadingSection: {
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 6,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
});