import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Image,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { customOrdersAPI, getImageUrl } from '../services/api';

const { width, height } = Dimensions.get('window');

const Pendientes = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [price, setPrice] = useState('');
  const [comment, setComment] = useState('');
  const [priceError, setPriceError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  const fetchPendingOrders = async () => {
    try {
      const data = await customOrdersAPI.getPendingOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching pending orders:', error);
      Alert.alert('Error', 'No se pudieron cargar las órdenes pendientes');
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
    const labels = {
      'cuadro_chico': 'Cuadro Pequeño',
      'llavero': 'Llavero',
      'cuadro_grande': 'Cuadro Grande',
    };
    return labels[modelType] || modelType;
  };

  const renderOrderCard = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.clientInfo}>
          <Text style={styles.clientName}>{item.user?.name || 'Usuario'}</Text>
          <Text style={styles.clientContact}>{item.user?.email}</Text>
          {item.user?.phone && (
            <Text style={styles.clientContact}>{item.user.phone}</Text>
          )}
          <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
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
        />
      )}

      <View style={styles.orderDetails}>
        <Text style={styles.modelType}>{getModelTypeLabel(item.modelType)}</Text>
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

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyTitle}>No hay órdenes pendientes</Text>
      <Text style={styles.emptyDescription}>
        Cuando los clientes soliciten cotizaciones para productos personalizados, aparecerán aquí.
      </Text>
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

      <View style={styles.content}>
        <FlatList
          data={orders}
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
                placeholder="Añade un comentario sobre la cotización"
                value={comment}
                onChangeText={setComment}
                multiline
                textAlignVertical="top"
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
                  {submitting ? 'Enviando...' : 'Enviar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#8B5CF6',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  clientInfo: {
    flex: 1,
    marginRight: 12,
  },
  clientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  clientContact: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  statusBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D97706',
  },
  orderImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginBottom: 12,
  },
  orderDetails: {
    marginBottom: 12,
  },
  modelType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  actionButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 10,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  formSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  priceInput: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  commentInput: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    minHeight: 80,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#8B5CF6',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  rejectButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
});

export default Pendientes;
