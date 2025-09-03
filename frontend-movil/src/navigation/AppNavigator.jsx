import React, { useContext } from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';

// Importar pantallas
import SplashScreen from '../components/SplashScreen';
import AuthApp from '../screens/AuthApp';
import Inicio from '../screens/Inicio';
import Productos from '../screens/Productos';
import Inventario from '../screens/Inventario';
import Ventas from '../screens/Ventas';
import Notificaciones from '../screens/Notificaciones';
import Pendientes from '../screens/Pendientes';
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

// Botón de logout para la tab bar
const LogoutButton = () => {
  const navigation = useNavigation();
  const { logout } = useContext(AuthContext);

  const handleLogout = async () => {
    await logout(); // Limpia el estado de autenticación
    navigation.replace('AuthApp');
  };

  return (
    <TouchableOpacity onPress={handleLogout} style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
      <Ionicons name="log-out-outline" size={28} color="#EF4444" />
      <Text style={{ fontSize: 12, color: '#EF4444', fontWeight: '600' }}>Salir</Text>
    </TouchableOpacity>
  );
};

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
            iconName = focused ? 'cube' : 'cube-outline';
          } else if (route.name === 'Inventario') {
            iconName = focused ? 'analytics' : 'analytics-outline';
          } else if (route.name === 'Ventas') {
            iconName = focused ? 'trending-up' : 'trending-up-outline';
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
          fontSize: 12,
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
        name="Logout"
        component={EmptyComponent}
        options={{
          tabBarLabel: 'Salir',
          tabBarButton: (props) => <LogoutButton {...props} />,
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