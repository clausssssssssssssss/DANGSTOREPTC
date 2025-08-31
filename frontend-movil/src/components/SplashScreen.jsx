import React, { useEffect } from 'react';
import { StyleSheet, Animated, Dimensions, View, Image, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ navigation }) {
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
      if (navigation && navigation.navigate) {
        navigation.navigate('AuthApp');
      }
    }, 3000);
    return () => clearTimeout(timeout);
  }, [navigation]);

  return (
         <LinearGradient
       colors={['#6A4DAB', '#A9A9A9']}
       start={{ x: 0, y: 0 }}
       end={{ x: 0, y: 1 }}
       style={styles.container}
     >
             {/* Llavero centrado - IMAGEN PRINCIPAL */}
       <Animated.View style={[styles.keychainContainer, {
         opacity: fadeAnim,
         transform: [
           { translateY: slideUpAnim },
           { scale: scaleAnim }
         ]
       }]}>
         <Image
           source={require('../assets/splashscreen.png')}
           style={styles.keychainImage}
           resizeMode="contain"
         />
       </Animated.View>

       {/* Slogan principal */}
       <Animated.View style={[styles.sloganContainer, { opacity: fadeAnim }]}>
         <Text style={styles.title}>No soy yo, es el</Text>
         <Text style={styles.brand}>DANG que brilla</Text>
         <Text style={styles.subtitle}>El llavero perfecto para ti</Text>
       </Animated.View>

             {/* Footer animado */}
       <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
         <Text style={styles.arrow}>↓</Text>
         <Text style={styles.startText}>Empezar</Text>
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
  keychainContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: height * 0.02,
    marginBottom: 360,
  },
  keychainImage: {
    width: width * 1.4,
    height: height * 0.7,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 10 },
    shadowOpacity: 0.10,
    shadowRadius: 20,
  },
  sloganContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: height * 0.7,
    left: 0,
    right: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 1,
    marginBottom: 8,
    textAlign: 'center',
  },
  brand: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    fontWeight: '500',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
  },
  arrow: {
    fontSize: 32,
    color: '#fff',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  startText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    letterSpacing: 1,
  },
});