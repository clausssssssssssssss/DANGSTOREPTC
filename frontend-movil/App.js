import React, { useState } from 'react';
import { View, Text } from 'react-native';
import SplashScreen from './SplashScreen';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

    // Aquí va el contenido principal de la aplicación
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Bienvenido a DangStore</Text>
  
    </View>
  );
}