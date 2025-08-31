import React, { useContext, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext.js';
import { inicioStyles as styles } from '../components/styles/InicioStyles';

const Inicio = ({ navigation }) => {
  const { user } = useContext(AuthContext);

  const greetingTime = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  }, []);

  const displayName = user?.name || 'Angie';
  const avatar = user?.profileImage || 'https://via.placeholder.com/60';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Botón de notificaciones - Completamente independiente */}
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => navigation.navigate('Notificaciones')}
        >
          <View style={styles.bellIcon}>
            <Ionicons name="notifications" size={24} color="#1F2937" />
          </View>
          <View style={styles.notificationBadge}>
            <Text style={styles.badgeText}>5</Text>
          </View>
        </TouchableOpacity>

         {/* Contenido principal con fondo degradado */}
         <LinearGradient
           colors={['#FFFFFF', '#9281BF']}
           style={styles.mainContent}
         >
           {/* Título centrado */}
           <Text style={styles.greeting}>Hola {displayName}</Text>
           <Text style={styles.subGreeting}>{greetingTime}</Text>
                         {/* Burbujas del fondo */}
             <View style={[styles.backgroundBubble, styles.bubble1]} />
             <View style={[styles.backgroundBubble, styles.bubble2]} />
             <View style={[styles.backgroundBubble, styles.bubble3]} />
             
             {/* Widget principal - Esta semana (ARRIBA) */}
             <View style={styles.weekWidget}>
               <View style={styles.weekGradient}>
                 <View style={styles.weekContent}>
                   <View style={styles.weekLeftContent}>
                     <Text style={styles.weekTitle}>Esta semana</Text>
                     <Text style={styles.weekPercentage}>95%</Text>
                   </View>
                   <TouchableOpacity 
                     style={styles.verButton}
                     onPress={() => navigation.navigate('Ventas')}
                   >
                     <Text style={styles.verButtonText}>Ver</Text>
                   </TouchableOpacity>
                 </View>
               </View>
             </View>

             {/* Widgets pequeños ABAJO */}
            <View style={styles.smallWidgetsContainer}>
              <TouchableOpacity
                style={styles.smallWidget}
                onPress={() => navigation.navigate('Ventas')}
              >
                <Text style={styles.widgetTitle}>Este dia</Text>
                <View style={styles.widgetContent}>
                  <Text style={styles.widgetAmount}>$14200</Text>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { backgroundColor: '#10B981', height: '80%' }]} />
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.irButton}
                  onPress={() => navigation.navigate('Ventas')}
                >
                  <Text style={styles.irButtonText}>Ir</Text>
                </TouchableOpacity>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.smallWidget, { backgroundColor: '#C4B5FD' }]}
                onPress={() => navigation.navigate('Ventas')}
              >
                <Text style={styles.widgetTitle}>Mayo</Text>
                <View style={styles.widgetContent}>
                  <Text style={styles.widgetAmount}>$14200</Text>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { backgroundColor: '#8B5CF6', height: '85%' }]} />
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.irButton}
                  onPress={() => navigation.navigate('Ventas')}
                >
                  <Text style={styles.irButtonText}>Ir</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            </View>

           {/* Sección de pendientes */}
           <View style={styles.pendientesSection}>
             <Text style={styles.pendientesTitle}>Pendientes</Text>
             <TouchableOpacity
               style={styles.pendientesCard}
               onPress={() => navigation.navigate('Pendientes')}
             >
               <Text style={styles.pendientesText}>Órdenes cotizadas</Text>
               <View style={styles.pendientesAlert}>
                 <Text style={styles.pendientesNumber}>20</Text>
                 <Ionicons name="warning" size={20} color="#F59E0B" />
               </View>
               <Text style={styles.verTodoText}>ver todo</Text>
             </TouchableOpacity>
           </View>
         </LinearGradient>
       </ScrollView>
     </SafeAreaView>
   );
 };

 export default Inicio;