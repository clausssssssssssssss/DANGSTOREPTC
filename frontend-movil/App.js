  import React, { useState } from 'react';
  import { View } from 'react-native';
  import 'react-native-gesture-handler';
  import 'react-native-reanimated';
  import SplashScreen from './components/SplashScreen';
  import AppNavigator from './navigation/AppNavigator';
  import { enableScreens } from 'react-native-screens';
  import { AuthProvider } from './src/context/AuthContext.js';

  enableScreens();

  export default function App() {
    const [showSplash, setShowSplash] = useState(true);

    if (showSplash) {
      return <SplashScreen onFinish={() => setShowSplash(false)} />;
    }

    return (
      <AuthProvider>
        <View style={{ flex: 1 }}>
          <AppNavigator />
        </View>
      </AuthProvider>
    );
  }