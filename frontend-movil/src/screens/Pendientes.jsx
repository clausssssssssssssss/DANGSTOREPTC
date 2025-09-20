import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Image,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { customOrdersAPI, getImageUrl } from '../services/customOrders';
import { AuthContext } from '../context/AuthContext';
import { pendientesStyles as styles } from '../components/styles/PendientesStyles';

const Pendientes = ({ navigation }) => {
  const { authToken, user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [price, setPrice] = useState('');
  const [comment, setComment] = useState('');
  const [priceError, setPriceError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authToken) {
      fetchPendingOrders();
    } else {
      setLoading(false);
      Alert.alert('Error', 'No estás autenticado. Por favor inicia sesión.');
    }
  }, [authToken]);

  const fetchPendingOrders = async () => {
    try {
      setError(null); // Limpiar errores previos
      console.log('🔄 Iniciando fetch de órdenes pendientes...');
      const data = await customOrdersAPI.getPendingOrders();
      console.log('✅ Órdenes obtenidas:', data);
      
      // Verificar que data sea un array
      if (Array.isArray(data)) {
        setOrders(data);
        console.log(`📊 ${data.length} órdenes cargadas correctamente`);
      } else {
        console.error('❌ Data no es un array:', typeof data, data);
        throw new Error('Formato de datos inesperado del servidor');
      }
    } catch (error) {
      console.error('❌ Error fetching pending orders:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      setError(error.message);
      
      // Mostrar mensaje de error más específico
      let errorMessage = 'No se pudieron cargar las órdenes pendientes';
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        errorMessage = 'Sesión expirada. Por favor inicia sesión nuevamente.';
      } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
        errorMessage = 'No tienes permisos para ver las órdenes pendientes.';
      } else if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
        errorMessage = 'Error del servidor. Intenta nuevamente más tarde.';
      } else if (error.message.includes('Network') || error.message.includes('fetch')) {
        errorMessage = 'Error de conexión. Verifica tu internet.';
      }
      
      Alert.alert('Error de Conexión', errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPendingOrders();
  };

  const openQuoteModal = (order) => {
    setSelectedOrder(order);
    setPrice('');
    setComment('');
    setPriceError('');
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedOrder(null);
    setPrice('');
    setComment('');
    setPriceError('');
  };

  const validatePrice = (priceValue) => {
    const numericPrice = parseFloat(priceValue);
    if (!priceValue || isNaN(numericPrice) || numericPrice <= 0) {
      setPriceError('El precio debe ser un número mayor a 0');
      return false;
    }
    setPriceError('');
    return true;
  };

  const submitQuote = async () => {
    if (!validatePrice(price)) {
      return;
    }

    setSubmitting(true);
    try {
      await customOrdersAPI.quoteOrder(selectedOrder._id, price, comment);
      Alert.alert('Éxito', 'Cotización enviada correctamente');
      closeModal();
      fetchPendingOrders(); // Refrescar la lista
    } catch (error) {
      console.error('Error submitting quote:', error);
      Alert.alert('Error', 'No se pudo enviar la cotización');
    } finally {
      setSubmitting(false);
    }
  };

  const rejectOrder = async () => {
    Alert.alert(
      'Confirmar rechazo',
      '¿Estás seguro de que quieres rechazar esta orden?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rechazar',
          style: 'destructive',
          onPress: async () => {
            setSubmitting(true);
            try {
              await customOrdersAPI.rejectOrder(selectedOrder._id, comment);
              Alert.alert('Orden rechazada', 'La orden ha sido rechazada');
              closeModal();
              fetchPendingOrders();
            } catch (error) {
              console.error('Error rejecting order:', error);
              Alert.alert('Error', 'No se pudo rechazar la orden');
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getModelTypeLabel = (modelType) => {
    if (!modelType) {
      console.warn('⚠️ modelType no definido en getModelTypeLabel');
      return 'Tipo no especificado';
    }
    
    const labels = {
      'cuadro_chico': 'Cuadro Pequeño',
      'cuadro_grande': 'Cuadro Grande',
      'llavero': 'Llavero',
      'tipo_desconocido': 'Tipo no especificado'
    };
    
    const label = labels[modelType];
    if (!label) {
      console.warn(`⚠️ Tipo de modelo no reconocido: ${modelType}`);
      return `Tipo: ${modelType}`;
    }
    
    return label;
  };

  const renderOrderCard = ({ item }) => {
    // Validar que el item tenga los datos necesarios
    if (!item || !item._id) {
      console.warn('⚠️ Item inválido en renderOrderCard:', item);
      return null;
    }

    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View style={styles.clientInfo}>
            <Text style={styles.clientName}>
              {item.user?.name || 'Usuario sin nombre'}
            </Text>
            <Text style={styles.clientContact}>
              {item.user?.email || 'Sin email'}
            </Text>
            {item.user?.phone && (
              <Text style={styles.clientContact}>{item.user.phone}</Text>
            )}
            <Text style={styles.orderDate}>
              {item.createdAt ? formatDate(item.createdAt) : 'Fecha no disponible'}
            </Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>PENDIENTE</Text>
          </View>
        </View>

        {item.imageUrl && (
          <Image 
            source={{ uri: getImageUrl(item.imageUrl) }}
            style={styles.orderImage}
            resizeMode="cover"
            onError={(error) => console.warn('Error cargando imagen:', error)}
          />
        )}

        <View style={styles.orderDetails}>
          <Text style={styles.modelType}>
            {getModelTypeLabel(item.modelType || 'tipo_desconocido')}
          </Text>
          {item.description && (
            <Text style={styles.description}>{item.description}</Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => openQuoteModal(item)}
        >
          <Text style={styles.actionButtonText}>Cotizar</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyTitle}>No hay órdenes pendientes</Text>
      <Text style={styles.emptyDescription}>
        Cuando los clientes soliciten cotizaciones para productos personalizados, aparecerán aquí.
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorIcon}>⚠️</Text>
      <Text style={styles.errorTitle}>Error al cargar órdenes</Text>
      <Text style={styles.errorDescription}>
        {error || 'Ocurrió un error inesperado'}
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={fetchPendingOrders}>
        <Text style={styles.retryButtonText}>Reintentar</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Órdenes Cotizadas</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Cargando órdenes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Órdenes Cotizadas</Text>
        <View style={styles.authStatus}>
          <Text style={styles.authStatusText}>
            {authToken ? '🔐' : '❌'}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        {error ? (
          renderErrorState()
        ) : (
          <FlatList
            data={orders.filter(order => order && order._id)} // Filtrar órdenes válidas
            renderItem={renderOrderCard}
            keyExtractor={(item) => item._id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#8B5CF6"
              />
            }
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Modal de cotización */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              {selectedOrder?.imageUrl && (
                <Image 
                  source={{ uri: getImageUrl(selectedOrder.imageUrl) }}
                  style={styles.modalImage}
                  resizeMode="cover"
                />
              )}
              <Text style={styles.modalTitle}>
                {getModelTypeLabel(selectedOrder?.modelType)}
              </Text>
              <Text style={styles.modalSubtitle}>
                {selectedOrder?.user?.name}
              </Text>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.inputLabel}>Precio (COP)</Text>
              <TextInput
                style={[
                  styles.priceInput,
                  priceError ? { borderColor: '#EF4444' } : {}
                ]}
                placeholder="Ingresa el precio"
                value={price}
                onChangeText={(text) => {
                  setPrice(text);
                  if (priceError) validatePrice(text);
                }}
                keyboardType="numeric"
                editable={!submitting}
              />
              {priceError ? (
                <Text style={styles.errorText}>{priceError}</Text>
              ) : null}
            </View>

            <View style={styles.formSection}>
              <Text style={styles.inputLabel}>Comentario (opcional)</Text>
              <TextInput
                style={styles.commentInput}
                placeholder="Agregar comentario o instrucciones..."
                value={comment}
                onChangeText={setComment}
                multiline
                editable={!submitting}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeModal}
                disabled={submitting}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.rejectButton]}
                onPress={rejectOrder}
                disabled={submitting}
              >
                <Text style={styles.rejectButtonText}>Rechazar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={submitQuote}
                disabled={submitting}
              >
                <Text style={styles.confirmButtonText}>
                  {submitting ? 'Enviando...' : 'Enviar Cotización'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Pendientes;
