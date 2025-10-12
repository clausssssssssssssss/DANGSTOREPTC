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
import AlertComponent from '../components/ui/Alert';

const Notificaciones = ({ navigation }) => {
  const {
    notifications,
    loading,
    error,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications: deleteAllNotificationsFromHook,
    refresh
  } = useNotifications();

  const [refreshing, setRefreshing] = useState(false);
  const [alert, setAlert] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
    onCancel: null,
    confirmText: 'OK',
    cancelText: 'Cancelar',
    showCancel: false,
  });
  
  // Estado para filtros
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'unread', 'read'

  const showAlert = (title, message, type = 'info', options = {}) => {
    setAlert({
      visible: true,
      title,
      message,
      type,
      onConfirm: options.onConfirm || (() => setAlert(prev => ({ ...prev, visible: false }))),
      onCancel: options.onCancel || (() => setAlert(prev => ({ ...prev, visible: false }))),
      confirmText: options.confirmText || 'OK',
      cancelText: options.cancelText || 'Cancelar',
      showCancel: options.showCancel || false,
    });
  };

  // Función para filtrar notificaciones
  const getFilteredNotifications = () => {
    switch (activeFilter) {
      case 'unread':
        return notifications.filter(n => !n.isRead);
      case 'read':
        return notifications.filter(n => n.isRead);
      default:
        return notifications;
    }
  };

  const filteredNotifications = getFilteredNotifications();

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Manejar refresh manual
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications(); // fetchNotifications ya actualiza el conteo localmente
    setRefreshing(false);
  }, [fetchNotifications]);

  // Marcar como leída y actualizar conteo
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId); // markAsRead ya actualiza el conteo localmente
    } catch (error) {
      showAlert('Error', 'No se pudo marcar como leída');
    }
  };

  // Marcar todas como leídas
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead(); // markAllAsRead ya actualiza el conteo localmente
      showAlert('Éxito', 'Todas las notificaciones marcadas como leídas');
    } catch (error) {
      showAlert('Error', 'No se pudieron marcar todas como leídas');
    }
  };

  // Eliminar notificación
  const handleDelete = async (notificationId) => {
    showAlert(
      'Eliminar Notificación',
      '¿Estás seguro de que quieres eliminar esta notificación?',
      'warning',
      {
        showCancel: true,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        onConfirm: async () => {
          try {
            await deleteNotification(notificationId);
            showAlert('Éxito', 'Notificación eliminada correctamente', 'success');
          } catch (error) {
            showAlert('Error', 'No se pudo eliminar la notificación', 'error');
          }
        }
      }
    );
  };

  // Eliminar todas
  const deleteAllNotifications = () => {
    showAlert(
      'Eliminar Todas',
      '¿Estás seguro que deseas eliminar todas las notificaciones?',
      'warning',
      {
        showCancel: true,
        confirmText: 'Eliminar Todo',
        cancelText: 'Cancelar',
        onConfirm: async () => {
          try {
            await deleteAllNotificationsFromHook();
            showAlert('Éxito', 'Todas las notificaciones eliminadas', 'success');
          } catch (error) {
            showAlert('Error', 'No se pudieron eliminar todas las notificaciones', 'error');
          }
        }
      }
    );
  };

  // Navegación inteligente según el tipo de notificación
  const handleNotificationPress = (item) => {
    if (!item.isRead) {
      handleMarkAsRead(item._id);
    }

    // Navegación inteligente según el tipo
    switch (item.type) {
      case 'new_order':
        // Si es un encargo personalizado, ir a Pendientes
        if (item.data?.modelType && !item.data?.customerName) {
          navigation.navigate('Pendientes');
        } else {
          // Si es una compra normal, ir a Ventas
          navigation.navigate('Ventas');
        }
        break;
      case 'order_updated':
        // Orden actualizada, ir a Ventas
        navigation.navigate('Ventas');
        break;
      case 'payment':
        // Pago, ir a Ventas
        navigation.navigate('Ventas');
        break;
      case 'rating':
        // Rating, ir a Productos
        navigation.navigate('Productos');
        break;
      case 'purchase':
        // Nueva compra - ir a Programar Entregas
        navigation.navigate('ProgramacionEntregas', {
          orderId: item.data?.orderId,
          highlightOrder: true
        });
        break;
      case 'delivery_confirmed':
        // Cliente confirmó entrega - ir a Programar Entregas
        navigation.navigate('ProgramacionEntregas', {
          orderId: item.data?.orderId,
          highlightOrder: true
        });
        break;
      case 'reschedule_request':
        // Cliente solicitó reprogramación - ir a Programar Entregas
        navigation.navigate('ProgramacionEntregas', {
          orderId: item.data?.orderId,
          highlightOrder: true,
          showRescheduleRequests: true
        });
        break;
      default:
        // Por defecto, ir a Ventas
        navigation.navigate('Ventas');
    }
  };



  // Componente NotificationCard
  const NotificationCard = ({ item, index }) => {
    const getTypeColor = (type) => {
      switch (type) {
        case 'new_order': return '#8B5CF6';
        case 'order_updated': return '#10B981';
        case 'payment': return '#F59E0B';
        case 'rating': return '#F97316';
        case 'purchase': return '#3B82F6';
        case 'delivery_confirmed': return '#4CAF50';
        case 'reschedule_request': return '#FF9800';
        default: return '#6B7280';
      }
    };

    const getTypeIcon = (type) => {
      switch (type) {
        case 'new_order': return 'bag-add-outline';
        case 'order_updated': return 'checkmark-circle-outline';
        case 'payment': return 'card-outline';
        case 'rating': return 'star-outline';
        case 'purchase': return 'receipt-outline';
        case 'delivery_confirmed': return 'checkmark-done-outline';
        case 'reschedule_request': return 'calendar-outline';
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
        onPress={() => handleNotificationPress(item)}
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
            <Text style={NotificacionesStyles.cardTitle}>{item.title || 'Sin título'}</Text>
            <Text style={NotificacionesStyles.cardMessage}>{item.message || 'Sin mensaje'}</Text>
            
            {item.data?.customerName && (
              <Text style={NotificacionesStyles.customerName}>Cliente: {String(item.data.customerName)}</Text>
            )}
            
            {item.data?.modelType && (
              <Text style={NotificacionesStyles.modelType}>Tipo: {String(item.data.modelType)}</Text>
            )}
            
            {item.data?.productName && (
              <Text style={NotificacionesStyles.modelType}>Producto: {String(item.data.productName)}</Text>
            )}
            
            {item.data?.rating && (
              <Text style={NotificacionesStyles.modelType}>Calificación: {String(item.data.rating)} estrellas</Text>
            )}
            
            {item.data?.total && (
              <Text style={NotificacionesStyles.modelType}>Total: ${String(item.data.total)}</Text>
            )}
            
            {item.data?.itemsCount && (
              <Text style={NotificacionesStyles.modelType}>Items: {String(item.data.itemsCount)}</Text>
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
          <Text style={NotificacionesStyles.timestamp}>{formatDate(item.createdAt || new Date())}</Text>
          
          {item.data?.price && (
            <Text style={NotificacionesStyles.price}>${String(item.data.price)}</Text>
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

      {/* Filtros */}
      <View style={NotificacionesStyles.filtersContainer}>
        <TouchableOpacity
          style={[
            NotificacionesStyles.filterButton,
            activeFilter === 'all' && NotificacionesStyles.activeFilter
          ]}
          onPress={() => setActiveFilter('all')}
        >
          <Text style={[
            NotificacionesStyles.filterText,
            activeFilter === 'all' && NotificacionesStyles.activeFilterText
          ]}>
            Total ({notifications.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            NotificacionesStyles.filterButton,
            activeFilter === 'unread' && NotificacionesStyles.activeFilter
          ]}
          onPress={() => setActiveFilter('unread')}
        >
          <Text style={[
            NotificacionesStyles.filterText,
            activeFilter === 'unread' && NotificacionesStyles.activeFilterText
          ]}>
            No leídas ({unreadCount})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            NotificacionesStyles.filterButton,
            activeFilter === 'read' && NotificacionesStyles.activeFilter
          ]}
          onPress={() => setActiveFilter('read')}
        >
          <Text style={[
            NotificacionesStyles.filterText,
            activeFilter === 'read' && NotificacionesStyles.activeFilterText
          ]}>
            Leídas ({notifications.filter(n => n.isRead).length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
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
          {filteredNotifications.map((item, index) => (
            <NotificationCard key={item._id} item={item} index={index} />
          ))}
          
          <View style={NotificacionesStyles.bottomPadding} />
        </ScrollView>
      )}

      {/* Componente de alerta unificado */}
      <AlertComponent
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onConfirm={alert.onConfirm}
        onCancel={alert.onCancel}
        confirmText={alert.confirmText}
        cancelText={alert.cancelText}
        showCancel={alert.showCancel}
      />
    </View>
  );
};


export default Notificaciones;