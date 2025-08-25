import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.1.2:4000/api'; // Usa el puerto 4000 de tu server.js

const Notificaciones = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Obtener token de autenticación
  const getAuthToken = async () => {
    try {
      return await AsyncStorage.getItem('adminToken'); // o el key que uses para admin
    } catch (error) {
      console.error('Error obteniendo token:', error);
      return null;
    }
  };

  // Headers para requests
  const getHeaders = async () => {
    const token = await getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  };

  // Cargar notificaciones
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const headers = await getHeaders();
      
      const response = await fetch(`${API_URL}/notifications?limit=50`, {
        method: 'GET',
        headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNotifications(data.data);
        }
      } else {
        console.error('Error response:', response.status);
      }
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
      Alert.alert('Error', 'No se pudieron cargar las notificaciones');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Cargar conteo no leídas
  const fetchUnreadCount = useCallback(async () => {
    try {
      const headers = await getHeaders();
      const response = await fetch(`${API_URL}/notifications/unread-count`, {
        method: 'GET',
        headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUnreadCount(data.unreadCount);
        }
      }
    } catch (error) {
      console.error('Error cargando conteo:', error);
    }
  }, []);

  // Marcar como leída
  const markAsRead = async (notificationId) => {
    try {
      const headers = await getHeaders();
      const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers,
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId 
              ? { ...notif, isRead: true }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marcando como leída:', error);
    }
  };

  // Marcar todas como leídas
  const markAllAsRead = async () => {
    try {
      const headers = await getHeaders();
      const response = await fetch(`${API_URL}/notifications/read-all`, {
        method: 'PUT',
        headers,
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, isRead: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marcando todas como leídas:', error);
    }
  };

  // Eliminar notificación
  const deleteNotification = (notificationId) => {
    Alert.alert(
      'Eliminar Notificación',
      '¿Estás seguro que deseas eliminar esta notificación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const headers = await getHeaders();
              const response = await fetch(`${API_URL}/notifications/${notificationId}`, {
                method: 'DELETE',
                headers,
              });

              if (response.ok) {
                const notificationToDelete = notifications.find(n => n._id === notificationId);
                
                setNotifications(prev => 
                  prev.filter(notif => notif._id !== notificationId)
                );
                
                if (notificationToDelete && !notificationToDelete.isRead) {
                  setUnreadCount(prev => Math.max(0, prev - 1));
                }
              }
            } catch (error) {
              console.error('Error eliminando notificación:', error);
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

  // Refrescar
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  // Efectos
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications();
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchNotifications, fetchUnreadCount]);

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
          styles.notificationCard,
          !item.isRead && styles.unreadCard
        ]}
        onPress={() => {
          if (!item.isRead) markAsRead(item._id);
          if (item.data?.orderId) goToOrderDetails(item.data.orderId);
        }}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: getTypeColor(item.type) + '20' }]}>
            <Ionicons 
              name={getTypeIcon(item.type)} 
              size={24} 
              color={getTypeColor(item.type)} 
            />
          </View>
          
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardMessage}>{item.message}</Text>
            
            {item.data?.customerName && (
              <Text style={styles.customerName}>Cliente: {item.data.customerName}</Text>
            )}
            
            {item.data?.modelType && (
              <Text style={styles.modelType}>Tipo: {item.data.modelType}</Text>
            )}
          </View>
          
          <View style={styles.cardActions}>
            {!item.isRead && <View style={styles.unreadDot} />}
            <TouchableOpacity
              onPress={() => deleteNotification(item._id)}
              style={styles.deleteButton}
            >
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.cardFooter}>
          <Text style={styles.timestamp}>{formatDate(item.createdAt)}</Text>
          
          {item.data?.price && (
            <Text style={styles.price}>${item.data.price}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && notifications.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={styles.loadingText}>Cargando notificaciones...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#8B5CF6" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notificaciones</Text>
        </View>
        
        <View style={styles.headerRight}>
          {unreadCount > 0 && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
          
          <TouchableOpacity onPress={markAllAsRead} style={styles.headerButton}>
            <Ionicons name="checkmark-done-outline" size={24} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={deleteAllNotifications} style={styles.headerButton}>
            <Ionicons name="trash-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Card */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{notifications.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#EF4444' }]}>{unreadCount}</Text>
          <Text style={styles.statLabel}>No leídas</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#10B981' }]}>
            {notifications.filter(n => n.isRead).length}
          </Text>
          <Text style={styles.statLabel}>Leídas</Text>
        </View>
      </View>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={80} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No hay notificaciones</Text>
          <Text style={styles.emptySubtitle}>
            Las nuevas órdenes aparecerán aquí automáticamente
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollContainer}
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
          
          <View style={styles.bottomPadding} />
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 10,
  },

  // Header Styles
  header: {
    backgroundColor: '#8B5CF6',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 15,
  },
  
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  headerButton: {
    marginLeft: 15,
  },
  
  badgeContainer: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Stats Card
  statsCard: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 10,
  },

  // Notifications List
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  
  notificationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
  
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  
  cardContent: {
    flex: 1,
  },
  
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  
  cardMessage: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  
  customerName: {
    fontSize: 13,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  
  modelType: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  
  cardActions: {
    alignItems: 'center',
  },
  
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8B5CF6',
    marginBottom: 8,
  },
  
  deleteButton: {
    padding: 4,
  },
  
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10B981',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  
  bottomPadding: {
    height: 20,
  },
});

export default Notificaciones;