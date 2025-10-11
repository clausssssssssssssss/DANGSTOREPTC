import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import API_URL from '../config/api';

export default function ProgramacionEntregas() {
  const navigation = useNavigation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deliveryDate, setDeliveryDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [reschedulingRequests, setReschedulingRequests] = useState([]);
  
  const statusFilters = [
    { value: 'ALL', label: 'Todos', icon: 'list' },
    { value: 'PAID', label: 'Pagados', icon: 'card' },
    { value: 'SCHEDULED', label: 'Programados', icon: 'calendar' },
    { value: 'CONFIRMED', label: 'Confirmados', icon: 'checkmark-circle' },
    { value: 'READY_FOR_DELIVERY', label: 'Listos', icon: 'cube' },
    { value: 'DELIVERED', label: 'Entregados', icon: 'checkmark-done' },
  ];
  
  const deliveryStatuses = {
    'PAID': { label: 'Pagado', color: '#2196F3' },
    'SCHEDULED': { label: 'Programado', color: '#FF9800' },
    'CONFIRMED': { label: 'Confirmado', color: '#4CAF50' },
    'READY_FOR_DELIVERY': { label: 'Listo', color: '#9C27B0' },
    'DELIVERED': { label: 'Entregado', color: '#4CAF50' },
    'CANCELLED': { label: 'Cancelado', color: '#F44336' },
  };
  
  useEffect(() => {
    loadOrders();
    loadReschedulingRequests();
  }, [selectedStatus]);
  
  const loadOrders = async () => {
    try {
      setLoading(true);
      const statusParam = selectedStatus !== 'ALL' ? `?status=${selectedStatus}` : '';
      const response = await fetch(`${API_URL}/delivery-schedule/orders${statusParam}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error cargando órdenes:', error);
      Alert.alert('Error', 'No se pudieron cargar las órdenes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const loadReschedulingRequests = async () => {
    try {
      const response = await fetch(`${API_URL}/delivery-schedule/rescheduling-requests`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setReschedulingRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Error cargando solicitudes:', error);
    }
  };
  
  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
    loadReschedulingRequests();
  };
  
  const openScheduleModal = (order) => {
    setSelectedOrder(order);
    setDeliveryDate(order.deliveryDate ? new Date(order.deliveryDate) : new Date());
    setScheduleModalVisible(true);
  };
  
  const handleScheduleDelivery = async () => {
    if (!selectedOrder) return;
    
    try {
      const response = await fetch(
        `${API_URL}/delivery-schedule/${selectedOrder._id}/schedule`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            deliveryDate: deliveryDate.toISOString(),
          }),
        }
      );
      
      const data = await response.json();
      
      if (data.success) {
        Alert.alert('Éxito', 'Entrega programada y notificación enviada al cliente');
        setScheduleModalVisible(false);
        loadOrders();
      } else {
        Alert.alert('Error', data.message || 'Error al programar entrega');
      }
    } catch (error) {
      console.error('Error programando entrega:', error);
      Alert.alert('Error', 'No se pudo programar la entrega');
    }
  };
  
  const handleRescheduling = (order, approve) => {
    if (approve) {
      // Si aprueba, abrir modal para seleccionar nueva fecha
      setSelectedOrder(order);
      setDeliveryDate(new Date());
      setScheduleModalVisible(true);
    } else {
      // Si rechaza, confirmar directamente
      Alert.alert(
        'Rechazar Reprogramación',
        '¿Confirmas rechazar la reprogramación?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Rechazar',
            style: 'destructive',
            onPress: async () => {
              try {
                const response = await fetch(
                  `${API_URL}/delivery-schedule/${order._id}/rescheduling`,
                  {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      approve: false,
                    }),
                  }
                );
                
                const data = await response.json();
                
                if (data.success) {
                  Alert.alert('Éxito', 'Reprogramación rechazada');
                  loadOrders();
                  loadReschedulingRequests();
                } else {
                  Alert.alert('Error', data.message);
                }
              } catch (error) {
                console.error('Error:', error);
                Alert.alert('Error', 'No se pudo procesar la solicitud');
              }
            },
          },
        ]
      );
    }
  };
  
  const handleApproveRescheduling = async () => {
    if (!selectedOrder) return;
    
    try {
      const response = await fetch(
        `${API_URL}/delivery-schedule/${selectedOrder._id}/rescheduling`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            approve: true,
            newDate: deliveryDate.toISOString(),
          }),
        }
      );
      
      const data = await response.json();
      
      if (data.success) {
        Alert.alert('Éxito', 'Reprogramación aprobada y notificación enviada al cliente');
        setScheduleModalVisible(false);
        loadOrders();
        loadReschedulingRequests();
      } else {
        Alert.alert('Error', data.message || 'Error al aprobar reprogramación');
      }
    } catch (error) {
      console.error('Error aprobando reprogramación:', error);
      Alert.alert('Error', 'No se pudo aprobar la reprogramación');
    }
  };
  
  const changeDeliveryStatus = (order) => {
    const nextStatuses = {
      'PAID': 'SCHEDULED',
      'SCHEDULED': 'CONFIRMED',
      'CONFIRMED': 'READY_FOR_DELIVERY',
      'READY_FOR_DELIVERY': 'DELIVERED',
    };
    
    const nextStatus = nextStatuses[order.deliveryStatus];
    
    if (!nextStatus) {
      Alert.alert('Info', 'Este pedido ya no puede cambiar de estado');
      return;
    }
    
    Alert.alert(
      'Cambiar Estado',
      `¿Cambiar estado a "${deliveryStatuses[nextStatus].label}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              const response = await fetch(
                `${API_URL}/delivery-schedule/${order._id}/status`,
                {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    status: nextStatus,
                  }),
                }
              );
              
              const data = await response.json();
              
              if (data.success) {
                Alert.alert('Éxito', 'Estado actualizado');
                loadOrders();
              } else {
                Alert.alert('Error', data.message);
              }
            } catch (error) {
              console.error('Error:', error);
              Alert.alert('Error', 'No se pudo actualizar el estado');
            }
          },
        },
      ]
    );
  };
  
  const formatDate = (date) => {
    if (!date) return 'No programada';
    return new Date(date).toLocaleString('es-SV', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  };
  
  const OrderCard = ({ order }) => {
    const status = deliveryStatuses[order.deliveryStatus] || { label: 'Desconocido', color: '#666' };
    const hasRescheduling = order.reschedulingStatus === 'REQUESTED';
    
    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderId}>Pedido #{order._id.slice(-8)}</Text>
            <Text style={styles.customerName}>{order.user?.nombre || 'Cliente'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
            <Text style={styles.statusText}>{status.label}</Text>
          </View>
        </View>
        
        <View style={styles.orderDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="location" size={16} color="#666" />
            <Text style={styles.detailText}>
              {order.deliveryPoint?.nombre || 'Sin punto de entrega'}
            </Text>
          </View>
          
          {order.deliveryDate && (
            <View style={styles.detailRow}>
              <Ionicons name="calendar" size={16} color="#666" />
              <Text style={styles.detailText}>{formatDate(order.deliveryDate)}</Text>
            </View>
          )}
          
          {hasRescheduling && (
            <View style={styles.reschedulingAlert}>
              <Ionicons name="warning" size={16} color="#FF9800" />
              <Text style={styles.reschedulingText}>
                Reprogramación solicitada: {formatDate(order.proposedDeliveryDate)}
              </Text>
            </View>
          )}
          
          <Text style={styles.totalText}>Total: ${order.total.toFixed(2)}</Text>
        </View>
        
        <View style={styles.orderActions}>
          {order.deliveryStatus === 'PAID' && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.scheduleBtn]}
              onPress={() => openScheduleModal(order)}
            >
              <Ionicons name="calendar" size={18} color="#fff" />
              <Text style={styles.actionBtnText}>Programar</Text>
            </TouchableOpacity>
          )}
          
          {hasRescheduling && (
            <>
              <TouchableOpacity
                style={[styles.actionBtn, styles.approveBtn]}
                onPress={() => handleRescheduling(order, true)}
              >
                <Ionicons name="checkmark" size={18} color="#fff" />
                <Text style={styles.actionBtnText}>Aprobar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.rejectBtn]}
                onPress={() => handleRescheduling(order, false)}
              >
                <Ionicons name="close" size={18} color="#fff" />
                <Text style={styles.actionBtnText}>Rechazar</Text>
              </TouchableOpacity>
            </>
          )}
          
          {!hasRescheduling && order.deliveryStatus !== 'PAID' && order.deliveryStatus !== 'DELIVERED' && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.nextStatusBtn]}
              onPress={() => changeDeliveryStatus(order)}
            >
              <Ionicons name="arrow-forward" size={18} color="#fff" />
              <Text style={styles.actionBtnText}>Siguiente Estado</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };
  
  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Programación de Entregas</Text>
          <View style={styles.headerPlaceholder} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6c5ce7" />
          <Text style={styles.loadingText}>Cargando entregas...</Text>
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Programación de Entregas</Text>
        <View style={styles.headerPlaceholder} />
      </View>
      
      {/* Filtros */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        {statusFilters.map((filter) => (
          <TouchableOpacity
            key={filter.value}
            style={[
              styles.filterBtn,
              selectedStatus === filter.value && styles.filterBtnActive,
            ]}
            onPress={() => setSelectedStatus(filter.value)}
          >
            <Ionicons
              name={filter.icon}
              size={18}
              color={selectedStatus === filter.value ? '#fff' : '#666'}
            />
            <Text
              style={[
                styles.filterBtnText,
                selectedStatus === filter.value && styles.filterBtnTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {/* Alerta de solicitudes pendientes */}
      {reschedulingRequests.length > 0 && (
        <View style={styles.alertBanner}>
          <Ionicons name="notifications" size={20} color="#FF9800" />
          <Text style={styles.alertText}>
            {reschedulingRequests.length} solicitud(es) de reprogramación pendiente(s)
          </Text>
        </View>
      )}
      
      {/* Lista de órdenes */}
      <ScrollView
        style={styles.ordersContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {orders.map((order) => (
          <OrderCard key={order._id} order={order} />
        ))}
        
        {orders.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No hay pedidos en este estado</Text>
          </View>
        )}
      </ScrollView>
      
      {/* Modal de programación */}
      <Modal
        visible={scheduleModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setScheduleModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Programar Entrega</Text>
              <TouchableOpacity onPress={() => setScheduleModalVisible(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <Text style={styles.modalLabel}>Pedido #{selectedOrder?._id.slice(-8)}</Text>
              <Text style={styles.modalSubtitle}>
                Cliente: {selectedOrder?.user?.nombre}
              </Text>
              
              {selectedOrder?.reschedulingStatus === 'REQUESTED' && (
                <View style={styles.rescheduleInfo}>
                  <Ionicons name="information-circle" size={20} color="#FF9800" />
                  <Text style={styles.rescheduleInfoText}>
                    Solicitud: {selectedOrder?.reschedulingReason}
                  </Text>
                </View>
              )}
              
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar" size={20} color="#6c5ce7" />
                <Text style={styles.dateButtonText}>
                  {deliveryDate.toLocaleDateString('es-SV', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Ionicons name="time" size={20} color="#6c5ce7" />
                <Text style={styles.dateButtonText}>
                  {deliveryDate.toLocaleTimeString('es-SV', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </TouchableOpacity>
              
              {showDatePicker && (
                <DateTimePicker
                  value={deliveryDate}
                  mode="date"
                  display="default"
                  onChange={(event, date) => {
                    setShowDatePicker(false);
                    if (date) setDeliveryDate(date);
                  }}
                  minimumDate={new Date()}
                />
              )}
              
              {showTimePicker && (
                <DateTimePicker
                  value={deliveryDate}
                  mode="time"
                  display="default"
                  onChange={(event, date) => {
                    setShowTimePicker(false);
                    if (date) setDeliveryDate(date);
                  }}
                />
              )}
              
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={selectedOrder?.reschedulingStatus === 'REQUESTED' ? handleApproveRescheduling : handleScheduleDelivery}
              >
                <Text style={styles.confirmButtonText}>
                  {selectedOrder?.reschedulingStatus === 'REQUESTED' ? 'Aprobar Reprogramación' : 'Programar y Notificar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerPlaceholder: {
    width: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  filterContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
    gap: 6,
  },
  filterBtnActive: {
    backgroundColor: '#6c5ce7',
  },
  filterBtnText: {
    fontSize: 14,
    color: '#666',
  },
  filterBtnTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    padding: 12,
    gap: 8,
  },
  alertText: {
    flex: 1,
    color: '#856404',
    fontSize: 14,
  },
  ordersContainer: {
    flex: 1,
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  customerName: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  orderDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  reschedulingAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  reschedulingText: {
    flex: 1,
    fontSize: 12,
    color: '#856404',
  },
  orderActions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    flex: 1,
    minWidth: 100,
    justifyContent: 'center',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  scheduleBtn: {
    backgroundColor: '#2196F3',
  },
  approveBtn: {
    backgroundColor: '#4CAF50',
  },
  rejectBtn: {
    backgroundColor: '#F44336',
  },
  nextStatusBtn: {
    backgroundColor: '#6c5ce7',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    padding: 16,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 12,
    gap: 12,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  confirmButton: {
    backgroundColor: '#6c5ce7',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  rescheduleInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  rescheduleInfoText: {
    flex: 1,
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
});

