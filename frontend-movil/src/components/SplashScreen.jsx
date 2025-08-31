import React from 'react';
import { StyleSheet, Dimensions, View, Image, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ navigation }) {
  

  




    return (
    <LinearGradient
      colors={['#604BC2', '#999999']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      {/* Llavero centrado - IMAGEN PRINCIPAL */}
      <View style={styles.keychainContainer}>
        <Image
          source={require('../assets/splashscreen.png')}
          style={styles.keychainImage}
          resizeMode="contain"
        />
      </View>

      {/* Slogan principal */}
      <View style={styles.sloganContainer}>
        <Text style={styles.title}>No soy yo, es el</Text>
        <Text style={styles.brand}>DANG que brilla</Text>
        <Text style={styles.subtitle}>El llavero perfecto para ti</Text>
      </View>

      {/* Botón simple "Empezar" */}
      <View style={styles.buttonWrapper}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => {
            if (navigation && navigation.navigate) {
              navigation.navigate('AuthApp');
            }
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Empezar</Text>
          <Text style={styles.buttonIcon}>→</Text>
        </TouchableOpacity>
      </View>
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
  buttonWrapper: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 999,
  },
  startButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 30,
    paddingHorizontal: 40,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  buttonIcon: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});