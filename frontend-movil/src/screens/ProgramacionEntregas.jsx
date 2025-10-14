import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AlertComponent from '../components/ui/Alert';
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
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deliveryDate, setDeliveryDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [reschedulingRequests, setReschedulingRequests] = useState([]);

  // Función para mostrar alertas personalizadas
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
  
  const statusFilters = [
    { value: 'ALL', label: 'Todos', icon: 'list', color: '#6B7280' },
    { value: 'REVIEWING', label: 'Revisando', icon: 'eye', color: '#F59E0B' },
    { value: 'MAKING', label: 'Elaborando', icon: 'hammer', color: '#EF4444' },
    { value: 'READY_FOR_DELIVERY', label: 'Listos', icon: 'cube', color: '#10B981' },
    { value: 'CONFIRMED', label: 'Confirmados', icon: 'checkmark-circle', color: '#10B981' },
  ];
  
  const deliveryStatuses = {
    'PAID': { label: 'Pagado', color: '#2196F3' },
    'REVIEWING': { label: 'Revisando', color: '#FF9800' },
    'MAKING': { label: 'Elaborando', color: '#FF5722' },
    'READY_FOR_DELIVERY': { label: 'Listo', color: '#9C27B0' },
    'CONFIRMED': { label: 'Confirmado', color: '#10B981' },
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
      
      // Obtener token de autenticación
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${API_URL}/delivery-schedule/orders${statusParam}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      console.log('Respuesta del servidor:', response.status, response.statusText);
      console.log('Datos recibidos:', data);
      
      if (response.ok) {
        // El endpoint /delivery-schedule/orders devuelve {success: true, orders: [...]}
        if (data.success) {
          const ordersArray = data.orders || [];
          console.log('Órdenes cargadas:', ordersArray.length);
          
          // Filtrar por estado si no es 'ALL'
          let filteredOrders = ordersArray;
          if (selectedStatus !== 'ALL') {
            filteredOrders = ordersArray.filter(order => order.deliveryStatus === selectedStatus);
          }
          
          console.log('Órdenes filtradas:', filteredOrders.length);
          setOrders(filteredOrders);
        } else {
          console.error('Error en respuesta:', data.message);
          showAlert('Error', data.message || 'No se pudieron cargar las órdenes', 'error');
        }
      } else if (response.status === 401) {
        // Token expirado o inválido
        console.log('Token expirado, limpiando y redirigiendo al login');
        await AsyncStorage.removeItem('authToken');
        showAlert(
          'Sesión Expirada', 
          'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
          'error',
          {
            showCancel: false,
            confirmText: 'OK',
            onConfirm: () => navigation.navigate('AuthApp')
          }
        );
      } else {
        console.error('Error en respuesta:', data.message);
        showAlert('Error', data.message || 'No se pudieron cargar las órdenes', 'error');
      }
    } catch (error) {
      console.error('Error cargando órdenes:', error);
      showAlert('Error', 'No se pudieron cargar las órdenes', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const loadReschedulingRequests = async () => {
    try {
      // Por ahora, simplemente establecer array vacío para evitar errores
      setReschedulingRequests([]);
    } catch (error) {
      console.error('Error cargando solicitudes:', error);
      setReschedulingRequests([]);
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
    
    // Debug: Mostrar el estado de la orden
    console.log('🔍 Estado de la orden:', selectedOrder.deliveryStatus);
    console.log('🔍 Orden completa:', selectedOrder);
    
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const requestBody = {
        deliveryDate: deliveryDate.toISOString(),
      };
      
      // Debug: Mostrar datos que se envían al backend
      console.log('🔍 Enviando al backend:', {
        url: `${API_URL}/delivery-schedule/${selectedOrder._id}/schedule`,
        body: requestBody,
        orderId: selectedOrder._id
      });
      
      const response = await fetch(
        `${API_URL}/delivery-schedule/${selectedOrder._id}/schedule`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );
      
      const data = await response.json();
      
      // Debug: Mostrar respuesta completa del backend
      console.log('🔍 Respuesta del backend:', response.status, data);
      
      if (data.success) {
        showAlert('Éxito', 'Entrega programada y notificación enviada al cliente', 'success');
        setScheduleModalVisible(false);
        loadOrders();
      } else {
        // Si el error es por estado inválido, mostrar opciones
        if (data.message && data.message.includes('revisión o pagadas')) {
          showAlert(
            'Estado de Orden Incorrecto',
            `La orden está en estado "${selectedOrder.deliveryStatus}". Cambiando automáticamente a "PAID" para poder programar la entrega...`,
            'warning',
            {
              showCancel: false,
              confirmText: 'Continuar',
              onConfirm: async () => {
                try {
                  await changeDeliveryStatus(selectedOrder._id, 'PAID');
                  // Después de cambiar el estado, intentar programar de nuevo
                  setTimeout(() => {
                    handleScheduleDelivery();
                  }, 1500);
                } catch (error) {
                  console.error('Error en flujo automático:', error);
                  showAlert('Error', 'No se pudo cambiar el estado de la orden', 'error');
                }
              }
            }
          );
        } else {
          // Si el error no es por estado, mostrar opción de programar manualmente
          showAlert(
            'Error al Programar',
            `Error: ${data.message || 'Error al programar entrega'}. ¿Quieres programar manualmente?`,
            'error',
            {
              showCancel: true,
              confirmText: 'Programar Manualmente',
              cancelText: 'Cancelar',
              onConfirm: async () => {
                await programarEntregaManual();
              }
            }
          );
        }
      }
    } catch (error) {
      console.error('Error programando entrega:', error);
      showAlert('Error', 'No se pudo programar la entrega', 'error');
    }
  };
  
  const startMakingOrder = async (orderId) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(
        `${API_URL}/delivery-schedule/${orderId}/start-making`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      const data = await response.json();
      
      if (data.success) {
        showAlert('Éxito', 'Estado actualizado a "Elaborando"', 'success');
        loadOrders();
      } else {
        showAlert('Error', data.message || 'Error al actualizar estado', 'error');
      }
    } catch (error) {
      console.error('Error starting making order:', error);
      showAlert('Error', 'Error de conexión', 'error');
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
      showAlert(
        'Rechazar Reprogramación',
        '¿Confirmas rechazar la reprogramación?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Rechazar',
            style: 'destructive',
            onPress: async () => {
              try {
                const token = await AsyncStorage.getItem('authToken');
                
                const response = await fetch(
                  `${API_URL}/delivery-schedule/${order._id}/rescheduling`,
                  {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      approve: false,
                    }),
                  }
                );
                
                const data = await response.json();
                
                if (data.success) {
                  showAlert('Éxito', 'Reprogramación rechazada', 'success');
                  loadOrders();
                  loadReschedulingRequests();
                } else {
                  showAlert('Error', data.message, 'error');
                }
              } catch (error) {
                console.error('Error:', error);
                showAlert('Error', 'No se pudo procesar la solicitud', 'error');
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
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(
        `${API_URL}/delivery-schedule/${selectedOrder._id}/rescheduling`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            approve: true,
            newDate: deliveryDate.toISOString(),
          }),
        }
      );
      
      const data = await response.json();
      
      if (data.success) {
        showAlert('Éxito', 'Reprogramación aprobada y notificación enviada al cliente', 'success');
        setScheduleModalVisible(false);
        loadOrders();
        loadReschedulingRequests();
      } else {
        showAlert('Error', data.message || 'Error al aprobar reprogramación', 'error');
      }
    } catch (error) {
      console.error('Error aprobando reprogramación:', error);
      showAlert('Error', 'No se pudo aprobar la reprogramación', 'error');
    }
  };

  const programarEntregaManual = async () => {
    if (!selectedOrder) return;
    
    try {
      // Actualizar la orden localmente
      const updatedOrders = orders.map(order => {
        if (order._id === selectedOrder._id) {
          return {
            ...order,
            deliveryDate: deliveryDate.toISOString(),
            deliveryStatus: 'READY_FOR_DELIVERY',
            deliveryConfirmed: false,
            statusHistory: [
              ...order.statusHistory,
              {
                status: 'READY_FOR_DELIVERY',
                changedBy: 'admin',
                changedAt: new Date(),
                notes: `Entrega programada manualmente para ${deliveryDate.toLocaleString('es-SV')}`
              }
            ]
          };
        }
        return order;
      });
      
      setOrders(updatedOrders);
      
      showAlert(
        'Entrega Programada Manualmente',
        `La entrega se programó para ${deliveryDate.toLocaleString('es-SV')}. Nota: Esta información solo se guardó localmente.`,
        'success'
      );
      
      setScheduleModalVisible(false);
      
    } catch (error) {
      console.error('Error en programación manual:', error);
      showAlert('Error', 'No se pudo programar manualmente', 'error');
    }
  };

  const changeDeliveryStatus = async (orderId, newStatus) => {
    try {
      console.log('🔄 Cambiando estado:', { orderId, newStatus });
      const token = await AsyncStorage.getItem('authToken');
      
      console.log('📤 Enviando petición a:', `${API_URL}/delivery-schedule/${orderId}/status`);
      
      const response = await fetch(
        `${API_URL}/delivery-schedule/${orderId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      
      console.log('📨 Respuesta del servidor:', response.status, response.statusText);
      
      const data = await response.json();
      console.log('📋 Datos de respuesta:', data);
      
      if (data.success) {
        showAlert('Éxito', `Estado cambiado a "${deliveryStatuses[newStatus]?.label || newStatus}"`, 'success');
        loadOrders();
      } else {
        // Si el error es por estado inválido, intentar con un estado válido
        if (data.message && data.message.includes('Estado de entrega inválido')) {
          console.log('🔄 Estado inválido, intentando con PAID...');
          showAlert('Info', 'Cambiando a estado PAID...', 'info');
          // Intentar con PAID que siempre es válido
          const retryResponse = await fetch(
            `${API_URL}/delivery-schedule/${orderId}/status`,
            {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({ status: 'PAID' }),
            }
          );
          
          const retryData = await retryResponse.json();
          
          if (retryData.success) {
            showAlert('Éxito', 'Estado cambiado a PAID', 'success');
            loadOrders();
          } else {
            showAlert('Error', 'No se pudo cambiar el estado de la orden', 'error');
          }
        } else {
          showAlert('Error', data.message || 'Error al cambiar estado', 'error');
        }
      }
    } catch (error) {
      console.error('Error cambiando estado:', error);
      showAlert('Error', 'No se pudo cambiar el estado', 'error');
    }
  };

  const changeDeliveryStatusOld = (order) => {
    const nextStatuses = {
      'PAID': 'REVIEWING',
      'REVIEWING': 'MAKING',
      'MAKING': 'READY_FOR_DELIVERY',
      'READY_FOR_DELIVERY': 'CONFIRMED',
      'CONFIRMED': 'DELIVERED',
    };
    
    const nextStatus = nextStatuses[order.deliveryStatus];
    
    if (!nextStatus) {
      showAlert('Info', 'Este pedido ya no puede cambiar de estado', 'info');
      return;
    }
    
    showAlert(
      'Cambiar Estado',
      `¿Cambiar estado a "${deliveryStatuses[nextStatus].label}"?`,
      'info',
      {
        showCancel: true,
        confirmText: 'Confirmar',
        cancelText: 'Cancelar',
        onConfirm: async () => {
          try {
            const token = await AsyncStorage.getItem('authToken');
            
            const response = await fetch(
              `${API_URL}/delivery-schedule/${order._id}/status`,
              {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                  status: nextStatus,
                }),
              }
            );
            
            const data = await response.json();
            
            if (data.success) {
              showAlert('Éxito', 'Estado actualizado', 'success');
              loadOrders();
            } else {
              showAlert('Error', data.message, 'error');
            }
          } catch (error) {
            console.error('Error:', error);
            showAlert('Error', 'No se pudo actualizar el estado', 'error');
          }
        }
      }
    );
  };

  const deleteOrder = async (orderId) => {
    showAlert(
      'Eliminar Orden',
      '¿Estás seguro de que quieres eliminar esta orden? Esta acción no se puede deshacer.',
      'warning',
      {
        showCancel: true,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        onConfirm: async () => {
          try {
            // Intentar eliminar del servidor primero
            const token = await AsyncStorage.getItem('authToken');
            
            try {
              const response = await fetch(`${API_URL}/delivery-schedule/orders/${orderId}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
              });
              
              if (response.ok) {
                const data = await response.json();
                console.log('Delete order response:', data);
                showAlert('Éxito', data.message || 'Orden eliminada del servidor', 'success');
                loadOrders(); // Recargar la lista
                return;
              }
            } catch (serverError) {
              console.log('Error del servidor, eliminando localmente:', serverError);
            }
            
            // Si falla el servidor, eliminar localmente
            const updatedOrders = orders.filter(order => order._id !== orderId);
            setOrders(updatedOrders);
            showAlert('Éxito', 'Orden eliminada de la lista local', 'success');
            
          } catch (error) {
            console.error('Error eliminando orden:', error);
            showAlert('Error', 'No se pudo eliminar la orden', 'error');
          }
        }
      }
    );
  };

  const deleteAllOrders = async () => {
    showAlert(
      'Eliminar Todas las Órdenes',
      '¿Estás seguro de que quieres eliminar TODAS las órdenes? Esta acción no se puede deshacer.',
      'error',
      {
        showCancel: true,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        onConfirm: async () => {
          try {
            // Intentar eliminar del servidor primero
            const token = await AsyncStorage.getItem('authToken');
            
            try {
              const response = await fetch(`${API_URL}/delivery-schedule/orders`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
              });
              
              if (response.ok) {
                const data = await response.json();
                console.log('Delete response:', data);
                showAlert('Éxito', data.message || 'Todas las órdenes eliminadas del servidor', 'success');
                loadOrders(); // Recargar la lista
                return;
              }
            } catch (serverError) {
              console.log('Error del servidor, eliminando localmente:', serverError);
            }
            
            // Si falla el servidor, eliminar localmente
            const orderCount = orders.length;
            setOrders([]);
            showAlert('Éxito', `${orderCount} órdenes eliminadas de la lista local`, 'success');
            
          } catch (error) {
            console.error('Error eliminando órdenes:', error);
            showAlert('Error', 'No se pudieron eliminar las órdenes', 'error');
          }
        }
      }
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
          <View style={styles.orderHeaderRight}>
            <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
              <Text style={styles.statusText}>{status.label}</Text>
            </View>
            <TouchableOpacity 
              onPress={() => deleteOrder(order._id)}
              style={styles.deleteButton}
            >
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
            </TouchableOpacity>
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
          {order.deliveryStatus === 'REVIEWING' && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.makeBtn]}
              onPress={() => startMakingOrder(order._id)}
            >
              <Ionicons name="hammer" size={18} color="#fff" />
              <Text style={styles.actionBtnText}>Iniciar Elaboración</Text>
            </TouchableOpacity>
          )}
          
          {order.deliveryStatus === 'MAKING' && (
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
          
          {!hasRescheduling && order.deliveryStatus !== 'PAID' && order.deliveryStatus !== 'DELIVERED' && order.deliveryStatus !== 'CANCELLED' && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.nextStatusBtn]}
              onPress={() => {
                const nextStatuses = {
                  'PAID': 'REVIEWING',
                  'REVIEWING': 'MAKING',
                  'MAKING': 'READY_FOR_DELIVERY',
                  'READY_FOR_DELIVERY': 'CONFIRMED',
                  'CONFIRMED': 'DELIVERED',
                };
                
                const nextStatus = nextStatuses[order.deliveryStatus];
                
                if (nextStatus) {
                  showAlert(
                    'Cambiar Estado',
                    `¿Cambiar estado a "${deliveryStatuses[nextStatus]?.label || nextStatus}"?`,
                    'info',
                    {
                      showCancel: true,
                      confirmText: 'Confirmar',
                      cancelText: 'Cancelar',
                      onConfirm: () => changeDeliveryStatus(order._id, nextStatus)
                    }
                  );
                } else {
                  showAlert('Info', 'Este pedido ya no puede cambiar de estado', 'info');
                }
              }}
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
          <Ionicons name="arrow-back" size={24} color="#8B5CF6" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Programación de Entregas</Text>
        </View>
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
          <Ionicons name="arrow-back" size={24} color="#8B5CF6" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Programación de Entregas</Text>
          {orders.length > 0 && (
            <Text style={styles.orderCount}>{orders.length} pedidos</Text>
          )}
        </View>
        <View style={styles.headerButtons}>
          {orders.length > 0 && (
            <TouchableOpacity 
              onPress={deleteAllOrders}
              style={styles.deleteAllButton}
            >
              <Ionicons name="trash-outline" size={22} color="#EF4444" />
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            onPress={loadOrders}
            style={styles.refreshButton}
          >
            <Ionicons name="refresh" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Filtros */}
      {/* Filtros compactos */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          {statusFilters.map((filter) => (
            <TouchableOpacity
              key={filter.value}
              style={[
                styles.filterChip,
                selectedStatus === filter.value && {
                  backgroundColor: filter.color,
                  borderColor: filter.color,
                },
              ]}
              onPress={() => setSelectedStatus(filter.value)}
            >
              <Ionicons
                name={filter.icon}
                size={16}
                color={selectedStatus === filter.value ? '#fff' : filter.color}
              />
              <Text
                style={[
                  styles.filterChipText,
                  selectedStatus === filter.value && styles.filterChipTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
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
            <View style={styles.emptyIconContainer}>
              <Ionicons name="cube-outline" size={48} color="#D1D5DB" />
            </View>
            <Text style={styles.emptyText}>
              {selectedStatus === 'ALL' 
                ? 'No hay pedidos registrados' 
                : `No hay pedidos en estado "${statusFilters.find(f => f.value === selectedStatus)?.label}"`
              }
            </Text>
            <Text style={styles.emptySubtext}>
              Los pedidos aparecerán aquí cuando los clientes realicen compras
            </Text>
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

      {/* Componente de alerta personalizada */}
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  backButton: {
    padding: 4,
  },
  headerTitleContainer: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: -0.5,
  },
  orderCount: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '500',
  },
  headerPlaceholder: {
    width: 32,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  refreshButton: {
    padding: 4,
  },
  deleteAllButton: {
    padding: 6,
    borderRadius: 18,
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
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterScrollContent: {
    paddingHorizontal: 4,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginRight: 8,
    gap: 4,
  },
  filterChipText: {
    fontSize: 12,
    color: '#495057',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
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
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteButton: {
    padding: 6,
    borderRadius: 18,
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
  makeBtn: {
    backgroundColor: '#FF5722',
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
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
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

