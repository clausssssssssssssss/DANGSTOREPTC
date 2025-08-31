import React, { useEffect } from 'react';
import { StyleSheet, Animated, Dimensions, View, Image, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ onFinish }) {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideUpAnim = React.useRef(new Animated.Value(30)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      })
    ]).start();

    const timeout = setTimeout(() => {
      onFinish && onFinish();
    }, 3000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <LinearGradient
      colors={['#6D28D9', '#8B5CF6', '#C4B5FD']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      {/* Imagen superior */}
      <Animated.View style={[styles.topImageContainer, { opacity: fadeAnim }]}>
        <Image
          source={require('../assets/image-removebg-preview.png')}
          style={styles.topImage}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Contenido principal */}
      <Animated.View style={[styles.content, {
        opacity: fadeAnim,
        transform: [
          { translateY: slideUpAnim },
          { scale: scaleAnim }
        ]
      }]}>
        <Image
          source={require('../assets/image-removebg-preview (1).png')}
          style={styles.mainImage}
          resizeMode="contain"
        />

        <Text style={styles.title}>No soy yo, es el</Text>
        <Text style={styles.brand}>DANG que brilla</Text>
        <Text style={styles.subtitle}>El accesorio perfecto para destacar</Text>
      </Animated.View>

      {/* Footer animado */}
      <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
        <Text style={styles.arrow}>↓</Text>
        <Text style={styles.startText}>Desliza para comenzar</Text>
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
  topImageContainer: {
    position: 'absolute',
    top: height * 0.1,
    alignItems: 'center',
  },
  topImage: {
    width: width * 0.4,
    height: height * 0.2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: height * 0.15,
  },
  mainImage: {
    width: width * 0.7,
    height: height * 0.3,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: '300',
    color: '#fff',
    letterSpacing: 1,
    marginTop: 10,
  },
  brand: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 10,
    fontWeight: '300',
    letterSpacing: 0.5,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  arrow: {
    fontSize: 28,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 5,
  },
  startText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 1,
  },
});