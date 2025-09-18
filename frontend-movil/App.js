import React from 'react';
import { View, StatusBar } from 'react-native';
import 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import { enableScreens } from 'react-native-screens';
import { AuthProvider } from './src/context/AuthContext.js';
import { SafeAreaProvider } from 'react-native-safe-area-context';

  enableScreens();

  export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#ffffff"
        translucent={false}
      />
      <AuthProvider>
        <View style={{ flex: 1 }}>
          <AppNavigator />
        </View>
      </AuthProvider>
    </SafeAreaProvider>
  );
}