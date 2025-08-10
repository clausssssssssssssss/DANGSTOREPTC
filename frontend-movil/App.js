import React, { useState } from 'react';
import { View } from 'react-native';
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import SplashScreen from './components/SplashScreen';
import AppNavigator from './navigation/AppNavigator'; // Cambiado de './src/navigation/AppNavigator'
import { enableScreens } from 'react-native-screens';
enableScreens();

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <View style={{ flex: 1 }}>
      <AppNavigator />
    </View>
  );
}