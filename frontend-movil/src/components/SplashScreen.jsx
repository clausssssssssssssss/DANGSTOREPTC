import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated, Dimensions, View, Image, Text, PanResponder } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ navigation }) {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideUpAnim = React.useRef(new Animated.Value(30)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;
  
  // Animaciones para el slider cool
  const slideAnim = useRef(new Animated.Value(0)).current;
  const thumbOpacity = useRef(new Animated.Value(1)).current;
  const trackGlow = useRef(new Animated.Value(0)).current;
  
  // Animaciones de entrada para las partículas
  const particle1Anim = useRef(new Animated.Value(0)).current;
  const particle2Anim = useRef(new Animated.Value(0)).current;
  const particle3Anim = useRef(new Animated.Value(0)).current;
  const particle4Anim = useRef(new Animated.Value(0)).current;
  
  // PanResponder para el slider cool
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // Animación al comenzar el toque
        Animated.timing(thumbOpacity, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderMove: (_, gestureState) => {
        // Deslizamiento horizontal
        const newValue = Math.max(0, Math.min(gestureState.dx, 200));
        slideAnim.setValue(newValue);
        
        // Activar glow cuando se desliza
        if (gestureState.dx > 50) {
          Animated.timing(trackGlow, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }).start();
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // Restaurar opacidad del thumb
        Animated.timing(thumbOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
        
        // Si se completó el deslizamiento
        if (gestureState.dx >= 180) {
          // Animación de éxito
          Animated.parallel([
            Animated.timing(slideAnim, {
              toValue: 200,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(trackGlow, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            })
          ]).start(() => {
            // Navegar al login
            if (navigation && navigation.navigate) {
              navigation.navigate('AuthApp');
            }
          });
        } else {
          // Resetear slider
          Animated.spring(slideAnim, {
            toValue: 0,
            friction: 5,
            useNativeDriver: true,
          }).start();
          
          Animated.timing(trackGlow, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;
  

  


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

    // Animaciones de entrada para las partículas
    setTimeout(() => {
      Animated.stagger(200, [
        Animated.timing(particle1Anim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(particle2Anim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(particle3Anim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(particle4Anim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        })
      ]).start();
    }, 1500);
  }, [navigation]);

  return (
              <LinearGradient
       colors={['#604BC2', '#999999']}
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

             {/* Slider "Empezar" SÚPER COOL con animaciones */}
       <Animated.View 
         style={[
           styles.sliderWrapper,
           {
             opacity: fadeAnim,
             transform: [{
               translateY: fadeAnim.interpolate({
                 inputRange: [0, 1],
                 outputRange: [50, 0]
               })
             }]
           }
         ]}
       >
         {/* Efecto de partículas de fondo */}
         <Animated.View style={[styles.particlesContainer, { opacity: trackGlow }]}>
           <Animated.View 
             style={[
               styles.particle1, 
               { 
                 opacity: particle1Anim,
                 transform: [{ 
                   rotate: particle1Anim.interpolate({
                     inputRange: [0, 1],
                     outputRange: ['0deg', '360deg']
                   })
                 }]
               }
             ]} 
           />
           <Animated.View 
             style={[
               styles.particle2, 
               { 
                 opacity: particle2Anim,
                 transform: [{ 
                   scale: particle2Anim.interpolate({
                     inputRange: [0, 1],
                     outputRange: [0.5, 1.2]
                   })
                 }]
               }
             ]} 
           />
           <Animated.View 
             style={[
               styles.particle3, 
               { 
                 opacity: particle3Anim,
                 transform: [{ 
                   translateY: particle3Anim.interpolate({
                     inputRange: [0, 1],
                     outputRange: [20, 0]
                   })
                 }]
               }
             ]} 
           />
           <Animated.View 
             style={[
               styles.particle4, 
               { 
                 opacity: particle4Anim,
                 transform: [{ 
                   scale: particle4Anim.interpolate({
                     inputRange: [0, 1],
                     outputRange: [0.3, 1.1]
                   })
                 }]
               }
             ]} 
           />
         </Animated.View>
         
         {/* Track principal con gradiente animado */}
         <Animated.View 
           style={[
             styles.sliderTrack, 
             { 
               transform: [{ scale: trackGlow.interpolate({
                 inputRange: [0, 1],
                 outputRange: [1, 1.05]
               })}],
               borderColor: trackGlow.interpolate({
                 inputRange: [0, 1],
                 outputRange: ['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.8)']
               })
             }]
           }
         >
           {/* Línea de progreso animada */}
           <Animated.View 
             style={[
               styles.progressLine,
               { 
                 width: slideAnim.interpolate({
                   inputRange: [0, 200],
                   outputRange: [0, 280]
                 })
               }
             ]}
           />
           
           {/* Thumb con efectos especiales */}
           <Animated.View 
             style={[
               styles.sliderThumb, 
               { 
                 transform: [
                   { translateX: slideAnim },
                   { scale: thumbOpacity.interpolate({
                     inputRange: [0.8, 1],
                     outputRange: [0.9, 1.1]
                   })}
                 ],
                 opacity: thumbOpacity,
                 shadowOpacity: trackGlow.interpolate({
                   inputRange: [0, 1],
                   outputRange: [0.3, 0.8]
                 })
               }
             ]}
             {...panResponder.panHandlers}
           >
             {/* Efecto de brillo interno */}
             <View style={styles.thumbGlow} />
             <Text style={styles.sliderIcon}>→</Text>
             
             {/* Efecto de ondas */}
             <Animated.View 
               style={[
                 styles.rippleEffect,
                 { 
                   opacity: trackGlow,
                   transform: [{ scale: trackGlow.interpolate({
                     inputRange: [0, 1],
                     outputRange: [0.5, 1.5]
                   })}]
                 }
               ]}
             />
           </Animated.View>
           
           {/* Texto con animación */}
           <Animated.Text 
             style={[
               styles.sliderText,
               { 
                 opacity: trackGlow.interpolate({
                   inputRange: [0, 1],
                   outputRange: [0.9, 1]
                 }),
                 transform: [{ scale: trackGlow.interpolate({
                   inputRange: [0, 1],
                   outputRange: [1, 1.1]
                 })}]
               }
             ]}
           >
             Desliza para empezar
           </Animated.Text>
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
  watermarkContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: 1,
  },
  watermarkText: {
    fontSize: 120,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.08)',
    letterSpacing: 20,
    transform: [{ rotate: '-15deg' }],
  },
  keychainContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: height * 0.02,
    marginBottom: 390,
    zIndex: 2,
  },
  keychainImage: {
    width: width * 1.3,
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
    zIndex: 2,
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
  sliderWrapper: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 999,
  },
  sliderTrack: {
    width: 280,
    height: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
  },
  sliderThumb: {
    position: 'absolute',
    left: 10,
    width: 50,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  sliderIcon: {
    fontSize: 20,
    color: '#604BC2',
    fontWeight: 'bold',
  },
  sliderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    opacity: 0.9,
    marginLeft: 70,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  // Efectos de partículas
  particlesContainer: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    zIndex: -1,
  },
  particle1: {
    position: 'absolute',
    top: 20,
    left: 30,
    width: 8,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 4,
  },
  particle2: {
    position: 'absolute',
    top: 40,
    right: 40,
    width: 6,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 3,
  },
  particle3: {
    position: 'absolute',
    bottom: 15,
    left: 50,
    width: 10,
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 5,
  },
  particle4: {
    position: 'absolute',
    bottom: 25,
    right: 20,
    width: 7,
    height: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3.5,
  },
  // Línea de progreso
  progressLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 35,
  },
  // Efectos del thumb
  thumbGlow: {
    position: 'absolute',
    top: 5,
    left: 5,
    right: 5,
    bottom: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
  },
  rippleEffect: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 35,
  },

});