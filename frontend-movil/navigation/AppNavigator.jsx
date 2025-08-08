import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Notificaciones from './screens/Notificaciones'; 
import Menu from './screens/Menu';             

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Notificaciones"
        screenOptions={{
          headerShown: false // Oculta la barra superior por defecto
        }}
      >
        <Stack.Screen name="Notificaciones" component={Notificaciones} />
        <Stack.Screen name="Menu" component={Menu} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;