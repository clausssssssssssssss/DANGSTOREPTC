import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  ActivityIndicator, Alert, Image, RefreshControl,
  FlatList, Modal 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useNotifications } from '../hooks/useNotifications';
import { getImageUrl } from '../services/customOrdersAPI';

const Notificaciones = () => {
  const navigation = useNavigation();
  const {
    notifications,
    unreadCount,
    loading,
    error,
    socketConnected,
    refresh,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications
  } = useNotifications();

  const [refreshing, setRefreshing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
    } catch (error) {
      Alert.alert('Error', 'No se pudo marcar como leída');
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      setSelectedNotification(null);
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar la notificación');
    }
  };

  const handleDeleteAll = async () => {
    Alert.alert(
      'Eliminar todas las notificaciones',
      '¿Estás seguro de que quieres eliminar todas las notificaciones?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAllNotifications();
              setShowDeleteModal(false);
            } catch (error) {
              Alert.alert('Error', 'No se pudieron eliminar todas las notificaciones');
            }
          }
        }
      ]
    );
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      Alert.alert('Éxito', 'Todas las notificaciones marcadas como leídas');
    } catch (error) {
      Alert.alert('Error', 'No se pudieron marcar todas como leídas');
    }
  };

  const renderNotification = ({ item }) => {
    const isUnread = !item.read;
    
    return (
      <TouchableOpacity 
        style={[styles.notificationCard, isUnread && styles.unreadCard]}
        onPress={() => handleMarkAsRead(item._id)}
        onLongPress={() => setSelectedNotification(item)}
      >
        <View style={styles.notificationContent}>
          <Text style={[styles.notificationTitle, isUnread && styles.unreadTitle]}>
            {item.title}
          </Text>
          <Text style={styles.notificationMessage}>{item.message}</Text>
          <Text style={styles.notificationTime}>
            {new Date(item.createdAt).toLocaleDateString('es-ES')} - {new Date(item.createdAt).toLocaleTimeString('es-ES', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
          
          {item.imageUrl && (
            <Image 
              source={{ uri: getImageUrl(item.imageUrl) }} 
              style={styles.notificationImage}
              resizeMode="cover"
            />
          )}
        </View>
        
        {isUnread && <View style={styles.unreadDot} />}
        
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setSelectedNotification(item)}
        >
          <Text style={styles.menuButtonText}>⋯</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Notificaciones</Text>
        </View>
        <ActivityIndicator size="large" color="#8B5CF6" style={styles.loader} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notificaciones</Text>
        <View style={styles.headerActions}>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Marcar todas</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => setShowDeleteModal(true)} style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Limpiar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.connectionStatus}>
        <View style={[styles.statusDot, styles.connected]} />
        <Text style={styles.statusText}>
          Sincronizando cada 15 segundos
        </Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={refresh} style={styles.retryButton}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      )}

      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay notificaciones</Text>
          <Text style={styles.emptySubtext}>Te avisaremos cuando tengas nuevas notificaciones</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={item => item._id}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={['#8B5CF6']}
              tintColor={'#8B5CF6'}
            />
          }
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Modal de acciones para notificación */}
      <Modal
        visible={!!selectedNotification}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedNotification(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Opciones</Text>
            
            <TouchableOpacity 
              style={styles.modalOption}
              onPress={() => {
                if (selectedNotification) {
                  handleMarkAsRead(selectedNotification._id);
                  setSelectedNotification(null);
                }
              }}
            >
              <Text style={styles.modalOptionText}>
                {selectedNotification?.read ? 'Marcar como no leída' : 'Marcar como leída'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalOption}
              onPress={() => {
                if (selectedNotification) {
                  handleDelete(selectedNotification._id);
                }
              }}
            >
              <Text style={[styles.modalOptionText, styles.deleteOption]}>Eliminar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalCancel}
              onPress={() => setSelectedNotification(null)}
            >
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal para eliminar todas las notificaciones */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>¿Eliminar todas las notificaciones?</Text>
            <Text style={styles.modalSubtitle}>Esta acción no se puede deshacer</Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.deleteButton]}
                onPress={handleDeleteAll}
              >
                <Text style={styles.deleteButtonText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  actionButtonText: {
    color: '#8B5CF6',
    fontSize: 14,
    fontWeight: '600',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  connected: {
    backgroundColor: '#28a745',
  },
  statusText: {
    fontSize: 13,
    color: '#6c757d',
    fontWeight: '500',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  errorText: {
    color: '#dc3545',
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 16,
  },
  retryButton: {
    padding: 12,
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  retryText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#6c757d',
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#adb5bd',
    textAlign: 'center',
    lineHeight: 20,
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  notificationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  unreadCard: {
    backgroundColor: '#f3e8ff',
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
  notificationContent: {
    flex: 1,
    marginRight: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 6,
  },
  unreadTitle: {
    color: '#8B5CF6',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#4a5568',
    marginBottom: 8,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: '#718096',
    fontStyle: 'italic',
  },
  notificationImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: '#f7fafc',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#8B5CF6',
    marginLeft: 8,
    marginTop: 4,
  },
  menuButton: {
    padding: 8,
    marginLeft: 4,
  },
  menuButtonText: {
    fontSize: 20,
    color: '#a0aec0',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#2d3748',
  },
  modalSubtitle: {
    fontSize: 15,
    color: '#718096',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#edf2f7',
  },
  modalOptionText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#4a5568',
    fontWeight: '500',
  },
  deleteOption: {
    color: '#e53e3e',
  },
  modalCancel: {
    padding: 16,
    marginTop: 8,
    borderRadius: 8,
    backgroundColor: '#f7fafc',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#4a5568',
    textAlign: 'center',
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#edf2f7',
  },
  cancelButtonText: {
    color: '#4a5568',
    fontWeight: '600',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#e53e3e',
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default Notificaciones;