import React, { useEffect } from 'react';
import { StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ onFinish }) {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start();

    const timeout = setTimeout(() => {
      onFinish && onFinish();
    }, 2500);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <LinearGradient
      colors={['#8e24aa', '#00c6fb']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>
        DANGSTORE
      </Animated.Text>
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
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 4,
    fontFamily: 'monospace', // Puedes cambiar por una fuente cuadrada personalizada si quieres
    textShadowColor: '#0008',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 8,
    textTransform: 'uppercase',
  },
});