  import React from 'react';
import { View } from 'react-native';
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import AppNavigator from './src/navigation/AppNavigator';
import { enableScreens } from 'react-native-screens';
import { AuthProvider } from './src/context/AuthContext.js';

  enableScreens();

  export default function App() {
  return (
    <AuthProvider>
      <View style={{ flex: 1 }}>
        <AppNavigator />
      </View>
    </AuthProvider>
  );
}