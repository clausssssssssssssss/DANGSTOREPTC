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
import DateFilter from '../components/DateFilter';
import { useOrdersWithFilters } from '../hooks/useOrdersWithFilters';

const Pendientes = ({ navigation }) => {
  const { authToken, user } = useContext(AuthContext);
  const { orders, loading, error, activeFilter, dateFilter, changeFilter, refresh } = useOrdersWithFilters();
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [price, setPrice] = useState('');
  const [comment, setComment] = useState('');
  const [priceError, setPriceError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    refresh().finally(() => setRefreshing(false));
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
      refresh(); // Refrescar la lista
    } catch (error) {
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
              refresh();
            } catch (error) {
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
      return `Tipo: ${modelType}`;
    }
    
    return label;
  };

  const renderOrderCard = ({ item }) => {
    // Validar que el item tenga los datos necesarios
    if (!item || !item._id) {
      return null;
    }

    // Log temporal para ver el status de las órdenes
    console.log('Order status:', item.status, 'Order ID:', item._id);

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
            {item.user?.phone ? (
              <Text style={styles.clientContact}>{item.user.phone}</Text>
            ) : null}
            <Text style={styles.orderDate}>
              {item.createdAt ? formatDate(item.createdAt) : 'Fecha no disponible'}
            </Text>
          </View>
          <View style={[
            styles.statusBadge,
            item.status === 'quoted' && styles.statusBadgeQuoted,
            item.status === 'accepted' && styles.statusBadgeAccepted,
            item.status === 'rejected' && styles.statusBadgeRejected
          ]}>
            <Text style={[
              styles.statusText,
              item.status === 'quoted' && styles.statusTextQuoted,
              item.status === 'accepted' && styles.statusTextAccepted,
              item.status === 'rejected' && styles.statusTextRejected
            ]}>
              {item.status === 'quoted' ? 'COTIZADA' :
               item.status === 'accepted' ? 'ACEPTADA' :
               item.status === 'rejected' ? 'RECHAZADA' :
               'PENDIENTE'}
            </Text>
          </View>
        </View>

        {item.imageUrl && (
          <Image 
            source={{ uri: getImageUrl(item.imageUrl) }}
            style={styles.orderImage}
            resizeMode="cover"
          />
        )}

        <View style={styles.orderDetails}>
          <Text style={styles.modelType}>
            {getModelTypeLabel(item.modelType || 'tipo_desconocido')}
          </Text>
          {item.description ? (
            <Text style={styles.description}>{item.description}</Text>
          ) : null}
        </View>

        {activeFilter === 'pending' ? (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => openQuoteModal(item)}
          >
            <Text style={styles.actionButtonText}>Cotizar</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.statusContainer}>
            <Text style={[
              styles.statusText,
              activeFilter === 'quoted' && styles.statusTextQuoted,
              activeFilter === 'rejected' && styles.statusTextRejected
            ]}>
              {activeFilter === 'quoted' ? 'Cotizada' : 'Rechazada'}
            </Text>
            {activeFilter === 'quoted' && item.price ? (
              <Text style={styles.priceText}>${item.price}</Text>
            ) : null}
          </View>
        )}
      </View>
    );
  };

  const renderEmptyState = () => {
    const getEmptyMessage = () => {
      switch (activeFilter) {
        case 'pending':
          return {
            title: 'No hay órdenes pendientes',
            description: 'Cuando los clientes soliciten cotizaciones para productos personalizados, aparecerán aquí.'
          };
        case 'quoted':
          return {
            title: 'No hay órdenes cotizadas',
            description: 'Las órdenes que ya han sido cotizadas aparecerán aquí.'
          };
        case 'rejected':
          return {
            title: 'No hay órdenes rechazadas',
            description: 'Las órdenes que han sido rechazadas aparecerán aquí.'
          };
        default:
          return {
            title: 'No hay órdenes',
            description: 'No se encontraron órdenes para mostrar.'
          };
      }
    };

    const message = getEmptyMessage();
    
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>{message.title}</Text>
        <Text style={styles.emptyDescription}>{message.description}</Text>
      </View>
    );
  };

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Error al cargar órdenes</Text>
      <Text style={styles.errorDescription}>
        {error || 'Ocurrió un error inesperado'}
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={refresh}>
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
        <View style={styles.placeholder} />
      </View>

      <DateFilter 
        activeFilter={activeFilter}
        onFilterChange={changeFilter}
      />

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
