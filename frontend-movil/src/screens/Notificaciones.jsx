import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from '../hooks/useNotifications.js';
import { NotificacionesStyles } from '../components/styles/NotificacionesStyles';

const Notificaciones = ({ navigation }) => {
  const {
    notifications,
    loading,
    error,
    unreadCount,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications
  } = useNotifications();

  const [refreshing, setRefreshing] = useState(false);

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  // Manejar refresh manual
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications();
    await fetchUnreadCount();
      setRefreshing(false);
  }, [fetchNotifications, fetchUnreadCount]);

  // Marcar como leída y actualizar conteo
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
      await fetchUnreadCount(); // Actualizar conteo
    } catch (error) {
      Alert.alert('Error', 'No se pudo marcar como leída');
    }
  };

  // Marcar todas como leídas
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      await fetchUnreadCount(); // Actualizar conteo
      Alert.alert('Éxito', 'Todas las notificaciones marcadas como leídas');
    } catch (error) {
      Alert.alert('Error', 'No se pudieron marcar todas como leídas');
    }
  };

  // Eliminar notificación
  const handleDelete = async (notificationId) => {
    Alert.alert(
      'Eliminar Notificación',
      '¿Estás seguro de que quieres eliminar esta notificación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteNotification(notificationId);
              await fetchUnreadCount(); // Actualizar conteo
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar la notificación');
            }
          }
        }
      ]
    );
  };

  // Eliminar todas
  const deleteAllNotifications = () => {
    Alert.alert(
      'Eliminar Todas',
      '¿Estás seguro que deseas eliminar todas las notificaciones?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar Todo',
          style: 'destructive',
          onPress: async () => {
            try {
              const headers = await getHeaders();
              const response = await fetch(`${API_URL}/notifications`, {
                method: 'DELETE',
                headers,
              });

              if (response.ok) {
                setNotifications([]);
                setUnreadCount(0);
              }
            } catch (error) {
              console.error('Error eliminando todas:', error);
            }
          }
        }
      ]
    );
  };

  // Navegar a detalles de orden
  const goToOrderDetails = (orderId) => {
    if (orderId) {
      // navigation.navigate('DetallesOrden', { orderId });
      console.log('Navegar a orden:', orderId);
    }
  };



  // Componente NotificationCard
  const NotificationCard = ({ item, index }) => {
    const getTypeColor = (type) => {
      switch (type) {
        case 'new_order': return '#8B5CF6';
        case 'order_updated': return '#10B981';
        case 'payment': return '#F59E0B';
        default: return '#6B7280';
      }
    };

    const getTypeIcon = (type) => {
      switch (type) {
        case 'new_order': return 'bag-add-outline';
        case 'order_updated': return 'checkmark-circle-outline';
        case 'payment': return 'card-outline';
        default: return 'notifications-outline';
      }
    };

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now - date) / (1000 * 60 * 60);
      
      if (diffInHours < 1) {
        return 'Hace unos minutos';
      } else if (diffInHours < 24) {
        return `Hace ${Math.floor(diffInHours)} horas`;
      } else {
        return date.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    };

    return (
      <TouchableOpacity
        style={[
          NotificacionesStyles.notificationCard,
          !item.isRead && NotificacionesStyles.unreadCard
        ]}
        onPress={() => {
          if (!item.isRead) handleMarkAsRead(item._id);
          if (item.data?.orderId) goToOrderDetails(item.data.orderId);
        }}
      >
        <View style={NotificacionesStyles.cardHeader}>
          <View style={[NotificacionesStyles.iconContainer, { backgroundColor: getTypeColor(item.type) + '20' }]}>
            <Ionicons 
              name={getTypeIcon(item.type)} 
              size={24} 
              color={getTypeColor(item.type)} 
            />
          </View>
          
          <View style={NotificacionesStyles.cardContent}>
            <Text style={NotificacionesStyles.cardTitle}>{item.title}</Text>
            <Text style={NotificacionesStyles.cardMessage}>{item.message}</Text>
            
            {item.data?.customerName && (
              <Text style={NotificacionesStyles.customerName}>Cliente: {item.data.customerName}</Text>
            )}
            
            {item.data?.modelType && (
              <Text style={NotificacionesStyles.modelType}>Tipo: {item.data.modelType}</Text>
            )}
          </View>
          
          <View style={NotificacionesStyles.cardActions}>
            {!item.isRead && <View style={NotificacionesStyles.unreadDot} />}
            <TouchableOpacity
              onPress={() => handleDelete(item._id)}
              style={NotificacionesStyles.deleteButton}
            >
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={NotificacionesStyles.cardFooter}>
          <Text style={NotificacionesStyles.timestamp}>{formatDate(item.createdAt)}</Text>
          
          {item.data?.price && (
            <Text style={NotificacionesStyles.price}>${item.data.price}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && notifications.length === 0) {
    return (
      <View style={NotificacionesStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={NotificacionesStyles.loadingText}>Cargando notificaciones...</Text>
      </View>
    );
  }

  return (
    <View style={NotificacionesStyles.container}>
      <StatusBar backgroundColor="#8B5CF6" barStyle="light-content" />
      
      {/* Header */}
      <View style={NotificacionesStyles.header}>
        <View style={NotificacionesStyles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={NotificacionesStyles.headerTitle}>Notificaciones</Text>
        </View>
        
        <View style={NotificacionesStyles.headerRight}>
          {unreadCount > 0 && (
            <View style={NotificacionesStyles.badgeContainer}>
              <Text style={NotificacionesStyles.badgeText}>{unreadCount}</Text>
            </View>
          )}
          
          <TouchableOpacity onPress={handleMarkAllAsRead} style={NotificacionesStyles.headerButton}>
            <Ionicons name="checkmark-done-outline" size={24} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={deleteAllNotifications} style={NotificacionesStyles.headerButton}>
            <Ionicons name="trash-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Card */}
      <View style={NotificacionesStyles.statsCard}>
        <View style={NotificacionesStyles.statItem}>
          <Text style={NotificacionesStyles.statNumber}>{notifications.length}</Text>
          <Text style={NotificacionesStyles.statLabel}>Total</Text>
        </View>
        <View style={NotificacionesStyles.statDivider} />
        <View style={NotificacionesStyles.statItem}>
          <Text style={[NotificacionesStyles.statNumber, { color: '#EF4444' }]}>{unreadCount}</Text>
          <Text style={NotificacionesStyles.statLabel}>No leídas</Text>
        </View>
        <View style={NotificacionesStyles.statDivider} />
        <View style={NotificacionesStyles.statItem}>
          <Text style={[NotificacionesStyles.statNumber, { color: '#10B981' }]}>
            {notifications.filter(n => n.isRead).length}
          </Text>
          <Text style={NotificacionesStyles.statLabel}>Leídas</Text>
        </View>
      </View>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <View style={NotificacionesStyles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={80} color="#D1D5DB" />
          <Text style={NotificacionesStyles.emptyTitle}>No hay notificaciones</Text>
          <Text style={NotificacionesStyles.emptySubtitle}>
            Las nuevas órdenes aparecerán aquí automáticamente
          </Text>
        </View>
      ) : (
        <ScrollView
          style={NotificacionesStyles.scrollContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#8B5CF6']}
              tintColor="#8B5CF6"
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {notifications.map((item, index) => (
            <NotificationCard key={item._id} item={item} index={index} />
          ))}
          
          <View style={NotificacionesStyles.bottomPadding} />
        </ScrollView>
      )}
    </View>
  );
};


export default Notificaciones;