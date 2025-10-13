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
  const [activeFilter, setActiveFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);

  // ✅ Variables seguras
  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const safeUnreadCount = typeof unreadCount === 'number' ? unreadCount : 0;
  const safeReadCount = safeNotifications.filter(n => n?.isRead).length;

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
  const getFilteredNotifications = useCallback(() => {
    let filtered = safeNotifications;

    // Filtro por estado (leído/no leído)
    switch (activeFilter) {
      case 'unread':
        filtered = filtered.filter(n => n && !n.isRead);
        break;
      case 'read':
        filtered = filtered.filter(n => n && n.isRead);
        break;
      default:
        // 'all' - no filtrar por estado
        break;
    }

    // Filtro por categoría
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(n => n && n.type === categoryFilter);
    }

    return filtered;
  }, [activeFilter, categoryFilter, safeNotifications]);

  // Función para obtener estadísticas por categoría
  const getCategoryStats = useCallback(() => {
    const stats = {
      rating: 0,
      new_order: 0,
      purchase: 0,
      order_updated: 0,
      payment: 0,
      delivery_confirmed: 0,
      reschedule_request: 0,
      low_stock: 0,
      order_limit_reached: 0,
    };

    safeNotifications.forEach(n => {
      if (n && n.type && stats[n.type] !== undefined) {
        stats[n.type]++;
      }
    });

    return stats;
  }, [safeNotifications]);

  const filteredNotifications = getFilteredNotifications();

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Manejar refresh manual
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  }, [fetchNotifications]);

  // Marcar como leída y actualizar conteo
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
    } catch (error) {
      showAlert('Error', 'No se pudo marcar como leída');
    }
  };

  // Marcar todas como leídas
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
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
        if (item.data?.modelType && !item.data?.customerName) {
          navigation.navigate('Pendientes');
        } else {
          navigation.navigate('Ventas');
        }
        break;
      case 'order_updated':
        navigation.navigate('Ventas');
        break;
      case 'payment':
        navigation.navigate('Ventas');
        break;
      case 'rating':
        navigation.navigate('Productos');
        break;
      case 'purchase':
        navigation.navigate('StockLimites', {
          screen: 'ProgramacionEntregas',
          params: {
            orderId: item.data?.orderId,
            highlightOrder: true
          }
        });
        break;
      case 'delivery_confirmed':
        navigation.navigate('StockLimites', {
          screen: 'ProgramacionEntregas',
          params: {
            orderId: item.data?.orderId,
            highlightOrder: true
          }
        });
        break;
      case 'reschedule_request':
        navigation.navigate('StockLimites', {
          screen: 'ProgramacionEntregas',
          params: {
            orderId: item.data?.orderId,
            highlightOrder: true,
            showRescheduleRequests: true
          }
        });
        break;
      default:
        navigation.navigate('Ventas');
    }
  };

  // Componente NotificationCard
  const NotificationCard = ({ item, index }) => {
    if (!item) return null;

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
        const hours = Math.floor(diffInHours);
        return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
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
            <Text style={NotificacionesStyles.cardTitle}>
              {item.title || 'Sin título'}
            </Text>
            <Text style={NotificacionesStyles.cardMessage}>
              {item.message || 'Sin mensaje'}
            </Text>
            
            {item.data?.customerName ? (
              <Text style={NotificacionesStyles.customerName}>
                {`Cliente: ${String(item.data.customerName)}`}
              </Text>
            ) : null}
            
            {item.data?.modelType ? (
              <Text style={NotificacionesStyles.modelType}>
                {`Tipo: ${String(item.data.modelType)}`}
              </Text>
            ) : null}
            
            {item.data?.productName ? (
              <Text style={NotificacionesStyles.modelType}>
                {`Producto: ${String(item.data.productName)}`}
              </Text>
            ) : null}
            
            {item.data?.rating ? (
              <Text style={NotificacionesStyles.modelType}>
                {`Calificación: ${String(item.data.rating)} estrellas`}
              </Text>
            ) : null}
            
            {item.data?.total ? (
              <Text style={NotificacionesStyles.modelType}>
                {`Total: $${String(item.data.total)}`}
              </Text>
            ) : null}
            
            {item.data?.itemsCount ? (
              <Text style={NotificacionesStyles.modelType}>
                {`Items: ${String(item.data.itemsCount)}`}
              </Text>
            ) : null}
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
          <Text style={NotificacionesStyles.timestamp}>
            {formatDate(item.createdAt || new Date())}
          </Text>
          
          {item.data?.price ? (
            <Text style={NotificacionesStyles.price}>
              {`$${String(item.data.price)}`}
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  // Componente FilterModal
  const FilterModal = () => {
    const categoryStats = getCategoryStats();
    
    const categoryConfig = {
      rating: { label: 'Calificaciones', icon: 'star', color: '#F97316' },
      new_order: { label: 'Encargos Personalizados', icon: 'bag-add', color: '#8B5CF6' },
      purchase: { label: 'Compras Realizadas', icon: 'receipt', color: '#3B82F6' },
      order_updated: { label: 'Órdenes Actualizadas', icon: 'checkmark-circle', color: '#10B981' },
      payment: { label: 'Pagos', icon: 'card', color: '#F59E0B' },
      delivery_confirmed: { label: 'Entregas Confirmadas', icon: 'checkmark-done', color: '#4CAF50' },
      reschedule_request: { label: 'Solicitudes de Reprogramación', icon: 'calendar', color: '#FF9800' },
      low_stock: { label: 'Stock Bajo', icon: 'warning', color: '#EF4444' },
      order_limit_reached: { label: 'Límite de Pedidos', icon: 'ban', color: '#9CA3AF' },
    };

    return (
      <View style={NotificacionesStyles.modalOverlay}>
        <View style={NotificacionesStyles.modalContainer}>
          {/* Modal Header */}
          <View style={NotificacionesStyles.modalHeader}>
            <Text style={NotificacionesStyles.modalTitle}>Filtros de Notificaciones</Text>
            <TouchableOpacity 
              onPress={() => setShowFilterModal(false)}
              style={NotificacionesStyles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Filtros principales */}
          <View style={NotificacionesStyles.modalSection}>
            <Text style={NotificacionesStyles.modalSectionTitle}>Estado</Text>
            <View style={NotificacionesStyles.modalButtonRow}>
              <TouchableOpacity
                style={[
                  NotificacionesStyles.modalButton,
                  activeFilter === 'all' && NotificacionesStyles.modalButtonActive
                ]}
                onPress={() => {
                  setActiveFilter('all');
                  setShowFilterModal(false);
                }}
              >
                <Text style={[
                  NotificacionesStyles.modalButtonText,
                  activeFilter === 'all' && NotificacionesStyles.modalButtonTextActive
                ]}>
                  Total
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  NotificacionesStyles.modalButton,
                  activeFilter === 'unread' && NotificacionesStyles.modalButtonActive
                ]}
                onPress={() => {
                  setActiveFilter('unread');
                  setShowFilterModal(false);
                }}
              >
                <Text style={[
                  NotificacionesStyles.modalButtonText,
                  activeFilter === 'unread' && NotificacionesStyles.modalButtonTextActive
                ]}>
                  No leídas
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  NotificacionesStyles.modalButton,
                  activeFilter === 'read' && NotificacionesStyles.modalButtonActive
                ]}
                onPress={() => {
                  setActiveFilter('read');
                  setShowFilterModal(false);
                }}
              >
                <Text style={[
                  NotificacionesStyles.modalButtonText,
                  activeFilter === 'read' && NotificacionesStyles.modalButtonTextActive
                ]}>
                  Leídas
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Filtros por categoría */}
          <View style={NotificacionesStyles.modalSection}>
            <Text style={NotificacionesStyles.modalSectionTitle}>Categorías</Text>
            
            <TouchableOpacity
              style={[
                NotificacionesStyles.categoryButton,
                categoryFilter === 'all' && NotificacionesStyles.categoryButtonActive
              ]}
              onPress={() => {
                setCategoryFilter('all');
                setShowFilterModal(false);
              }}
            >
              <Ionicons 
                name="apps" 
                size={20} 
                color={categoryFilter === 'all' ? '#FFFFFF' : '#8B5CF6'} 
              />
              <Text style={[
                NotificacionesStyles.categoryButtonText,
                categoryFilter === 'all' && NotificacionesStyles.categoryButtonTextActive
              ]}>
                Todas las categorías
              </Text>
            </TouchableOpacity>

            {Object.entries(categoryConfig).map(([type, config]) => {
              const count = categoryStats[type] || 0;
              if (count === 0) return null;

              return (
                <TouchableOpacity
                  key={type}
                  style={[
                    NotificacionesStyles.categoryButton,
                    categoryFilter === type && NotificacionesStyles.categoryButtonActive
                  ]}
                  onPress={() => {
                    setCategoryFilter(type);
                    setShowFilterModal(false);
                  }}
                >
                  <Ionicons 
                    name={config.icon} 
                    size={20} 
                    color={categoryFilter === type ? '#FFFFFF' : config.color} 
                  />
                  <Text style={[
                    NotificacionesStyles.categoryButtonText,
                    categoryFilter === type && NotificacionesStyles.categoryButtonTextActive
                  ]}>
                    {config.label} ({count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  if (loading && safeNotifications.length === 0) {
    return (
      <View style={NotificacionesStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={NotificacionesStyles.loadingText}>Cargando notificaciones...</Text>
      </View>
    );
  }

  return (
    <View style={NotificacionesStyles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      
      {/* Header */}
      <View style={NotificacionesStyles.header}>
        {/* Sección izquierda */}
        <View style={NotificacionesStyles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={NotificacionesStyles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#8B5CF6" />
          </TouchableOpacity>
        </View>
        
        {/* Sección centro - Título centrado */}
        <View style={NotificacionesStyles.headerCenter}>
          <Text style={NotificacionesStyles.headerTitle}>Notificaciones</Text>
        </View>
        
        {/* Sección derecha */}
        <View style={NotificacionesStyles.headerRight}>
          {safeUnreadCount > 0 && (
            <View style={NotificacionesStyles.badgeContainer}>
              <Text style={NotificacionesStyles.badgeText}>
                {String(safeUnreadCount)}
              </Text>
            </View>
          )}
          
          <TouchableOpacity 
            onPress={() => setShowFilterModal(true)} 
            style={NotificacionesStyles.headerButton}
          >
            <Ionicons name="options-outline" size={24} color="#8B5CF6" />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleMarkAllAsRead} style={NotificacionesStyles.headerButton}>
            <Ionicons name="checkmark-done-outline" size={24} color="#8B5CF6" />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={deleteAllNotifications} style={NotificacionesStyles.headerButton}>
            <Ionicons name="trash-outline" size={24} color="#8B5CF6" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Card - ✅ CORREGIDO */}
      <View style={NotificacionesStyles.statsCard}>
        <View style={NotificacionesStyles.statItem}>
          <Text style={NotificacionesStyles.statNumber}>
            {String(safeNotifications.length)}
          </Text>
          <Text style={NotificacionesStyles.statLabel}>Total</Text>
        </View>
        <View style={NotificacionesStyles.statDivider} />
        <View style={NotificacionesStyles.statItem}>
          <Text style={[NotificacionesStyles.statNumber, { color: '#EF4444' }]}>
            {String(safeUnreadCount)}
          </Text>
          <Text style={NotificacionesStyles.statLabel}>No leídas</Text>
        </View>
        <View style={NotificacionesStyles.statDivider} />
        <View style={NotificacionesStyles.statItem}>
          <Text style={[NotificacionesStyles.statNumber, { color: '#10B981' }]}>
            {String(safeReadCount)}
          </Text>
          <Text style={NotificacionesStyles.statLabel}>Leídas</Text>
        </View>
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
        <View style={NotificacionesStyles.scrollWrapper}>
          <ScrollView
            style={NotificacionesStyles.scrollContainer}
            contentContainerStyle={NotificacionesStyles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#8B5CF6']}
                tintColor="#8B5CF6"
              />
            }
            showsVerticalScrollIndicator={true}
            bounces={true}
            scrollEventThrottle={16}
          >
            {filteredNotifications.map((item, index) => (
              <NotificationCard key={item?._id || `notif-${index}`} item={item} index={index} />
            ))}
            
            <View style={NotificacionesStyles.bottomPadding} />
          </ScrollView>
        </View>
      )}

      {/* Modal de filtros */}
      {showFilterModal && <FilterModal />}

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