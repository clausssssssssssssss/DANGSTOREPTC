import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Importar pantallas
import SplashScreen from '../components/SplashScreen';
import AuthApp from '../screens/AuthApp';
import Inicio from '../screens/Inicio';
import Productos from '../screens/Productos';
import Inventario from '../screens/Inventario';
import Ventas from '../screens/Ventas';
import Notificaciones from '../screens/Notificaciones';
import Pendientes from '../screens/Pendientes';
import StockLimites from '../screens/StockLimites';
import PuntosEntrega from '../screens/PuntosEntregaSimple';
import ProgramacionEntregas from '../screens/ProgramacionEntregas';
import { AuthContext } from '../context/AuthContext';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Componente vacío para la pantalla de Logout
const EmptyComponent = () => null;


// Stack para la pantalla de inicio (permite navegar a notificaciones y pendientes)
const InicioStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="InicioMain" component={Inicio} />
    <Stack.Screen name="Notificaciones" component={Notificaciones} />
    <Stack.Screen name="Pendientes" component={Pendientes} />
  </Stack.Navigator>
);

// Stack para ventas (permite navegar con parámetros)
const VentasStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="VentasMain" component={Ventas} />
  </Stack.Navigator>
);

// Stack para configuración (permite navegar a puntos de entrega y programación)
const ConfigStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="StockLimitesMain" component={StockLimites} />
    <Stack.Screen name="PuntosEntrega" component={PuntosEntrega} />
    <Stack.Screen name="ProgramacionEntregas" component={ProgramacionEntregas} />
  </Stack.Navigator>
);



// Tab Navigator para la aplicación principal (después de la autenticación)
const MainTabNavigator = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Inicio') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Productos') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Inventario') {
            iconName = focused ? 'cube' : 'cube-outline';
          } else if (route.name === 'Ventas') {
            iconName = focused ? 'trending-up' : 'trending-up-outline';
          } else if (route.name === 'StockLimites') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          if (iconName) {
            return (
              <Ionicons
                name={iconName}
                size={size}
                color={focused ? '#8B5CF6' : '#6B7280'}
              />
            );
          }
          return null;
        },
        tabBarActiveTintColor: '#8B5CF6',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingBottom: Math.max(insets.bottom, 5),
          paddingTop: 5,
          height: 60 + insets.bottom,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen
        name="Inicio"
        component={InicioStack}
        options={{
          tabBarLabel: 'Inicio',
        }}
      />
      <Tab.Screen
        name="Productos"
        component={Productos}
        options={{
          tabBarLabel: 'Productos',
        }}
      />
      <Tab.Screen
        name="Inventario"
        component={Inventario}
        options={{
          tabBarLabel: 'Inventario',
        }}
      />
      <Tab.Screen
        name="Ventas"
        component={VentasStack}
        options={{
          tabBarLabel: 'Ventas',
        }}
      />
      <Tab.Screen
        name="StockLimites"
        component={ConfigStack}
        options={{
          tabBarLabel: 'Configuración',
        }}
      />
    </Tab.Navigator>
  );
};

// Stack principal que maneja la autenticación y la aplicación principal
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="SplashScreen"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen 
          name="SplashScreen" 
          component={SplashScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="AuthApp" 
          component={AuthApp}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="MainApp" 
          component={MainTabNavigator}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;