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
  Switch,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import API_URL from '../config/api';

export default function PuntosEntrega() {
  const [deliveryPoints, setDeliveryPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPoint, setEditingPoint] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    descripcion: '',
    referencia: '',
    horarioAtencion: 'Lunes a Viernes 9:00 AM - 5:00 PM',
    activo: true,
  });
  
  // Centro de San Salvador
  const sanSalvadorCenter = {
    latitude: 13.6929,
    latitudeDelta: 0.15,
    longitude: -89.2182,
    longitudeDelta: 0.15,
  };
  
  useEffect(() => {
    loadDeliveryPoints();
  }, []);
  
  const loadDeliveryPoints = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/delivery-points?includeInactive=true`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setDeliveryPoints(data.deliveryPoints || []);
      }
    } catch (error) {
      console.error('Error cargando puntos de entrega:', error);
      Alert.alert('Error', 'No se pudieron cargar los puntos de entrega');
    } finally {
      setLoading(false);
    }
  };
  
  const openAddModal = () => {
    setEditingPoint(null);
    setFormData({
      nombre: '',
      direccion: '',
      descripcion: '',
      referencia: '',
      horarioAtencion: 'Lunes a Viernes 9:00 AM - 5:00 PM',
      activo: true,
    });
    setSelectedLocation(null);
    setModalVisible(true);
  };
  
  const openEditModal = (point) => {
    setEditingPoint(point);
    setFormData({
      nombre: point.nombre,
      direccion: point.direccion,
      descripcion: point.descripcion || '',
      referencia: point.referencia || '',
      horarioAtencion: point.horarioAtencion || 'Lunes a Viernes 9:00 AM - 5:00 PM',
      activo: point.activo,
    });
    setSelectedLocation({
      latitude: point.coordenadas.lat,
      longitude: point.coordenadas.lng,
    });
    setModalVisible(true);
  };
  
  const handleMapPress = (event) => {
    const { coordinate } = event.nativeEvent;
    setSelectedLocation(coordinate);
  };
  
  const validateCoordinates = (lat, lng) => {
    // Validar que esté dentro de San Salvador (aproximadamente)
    return lat >= 13.5 && lat <= 13.9 && lng >= -89.4 && lng <= -89.0;
  };
  
  const handleSave = async () => {
    // Validaciones
    if (!formData.nombre.trim()) {
      Alert.alert('Error', 'El nombre es requerido');
      return;
    }
    
    if (!formData.direccion.trim()) {
      Alert.alert('Error', 'La dirección es requerida');
      return;
    }
    
    if (!selectedLocation) {
      Alert.alert('Error', 'Selecciona una ubicación en el mapa');
      return;
    }
    
    if (!validateCoordinates(selectedLocation.latitude, selectedLocation.longitude)) {
      Alert.alert(
        'Error',
        'La ubicación debe estar dentro del departamento de San Salvador'
      );
      return;
    }
    
    try {
      const url = editingPoint
        ? `${API_URL}/delivery-points/${editingPoint._id}`
        : `${API_URL}/delivery-points`;
      
      const method = editingPoint ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          coordenadas: {
            lat: selectedLocation.latitude,
            lng: selectedLocation.longitude,
          },
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        Alert.alert(
          'Éxito',
          editingPoint
            ? 'Punto de entrega actualizado'
            : 'Punto de entrega creado'
        );
        setModalVisible(false);
        loadDeliveryPoints();
      } else {
        Alert.alert('Error', data.message || 'Error al guardar');
      }
    } catch (error) {
      console.error('Error guardando punto:', error);
      Alert.alert('Error', 'No se pudo guardar el punto de entrega');
    }
  };
  
  const handleToggleStatus = async (point) => {
    try {
      const response = await fetch(
        `${API_URL}/delivery-points/${point._id}/toggle`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      const data = await response.json();
      
      if (data.success) {
        loadDeliveryPoints();
      }
    } catch (error) {
      console.error('Error cambiando estado:', error);
    }
  };
  
  const handleDelete = (point) => {
    Alert.alert(
      'Eliminar punto',
      `¿Estás seguro de eliminar "${point.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(
                `${API_URL}/delivery-points/${point._id}`,
                {
                  method: 'DELETE',
                }
              );
              
              const data = await response.json();
              
              if (data.success) {
                Alert.alert('Éxito', 'Punto eliminado');
                loadDeliveryPoints();
              }
            } catch (error) {
              console.error('Error eliminando punto:', error);
              Alert.alert('Error', 'No se pudo eliminar');
            }
          },
        },
      ]
    );
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6c5ce7" />
        <Text style={styles.loadingText}>Cargando puntos de entrega...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {/* Mapa */}
      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={sanSalvadorCenter}
        >
          {deliveryPoints.map((point) => (
            <Marker
              key={point._id}
              coordinate={{
                latitude: point.coordenadas.lat,
                longitude: point.coordenadas.lng,
              }}
              title={point.nombre}
              description={point.direccion}
              pinColor={point.activo ? '#4CAF50' : '#9E9E9E'}
              onCalloutPress={() => openEditModal(point)}
            />
          ))}
        </MapView>
      </View>
      
      {/* Lista de puntos */}
      <View style={styles.listContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Puntos de Entrega</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={openAddModal}
          >
            <Ionicons name="add-circle" size={32} color="#6c5ce7" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.scrollView}>
          {deliveryPoints.map((point) => (
            <View
              key={point._id}
              style={[
                styles.pointCard,
                !point.activo && styles.pointCardInactive,
              ]}
            >
              <View style={styles.pointHeader}>
                <View style={styles.pointInfo}>
                  <Text style={styles.pointName}>{point.nombre}</Text>
                  <Text style={styles.pointAddress}>{point.direccion}</Text>
                </View>
                <View style={styles.pointActions}>
                  <TouchableOpacity
                    onPress={() => handleToggleStatus(point)}
                    style={styles.actionButton}
                  >
                    <Ionicons
                      name={point.activo ? 'checkmark-circle' : 'close-circle'}
                      size={24}
                      color={point.activo ? '#4CAF50' : '#9E9E9E'}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => openEditModal(point)}
                    style={styles.actionButton}
                  >
                    <Ionicons name="create" size={24} color="#2196F3" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(point)}
                    style={styles.actionButton}
                  >
                    <Ionicons name="trash" size={24} color="#F44336" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
          
          {deliveryPoints.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="location-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>
                No hay puntos de entrega configurados
              </Text>
              <Text style={styles.emptySubtext}>
                Presiona el botón + para agregar uno
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
      
      {/* Modal de edición/creación */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingPoint ? 'Editar' : 'Nuevo'} Punto
            </Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.saveButton}>Guardar</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {/* Mapa para seleccionar ubicación */}
            <View style={styles.modalMapContainer}>
              <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.modalMap}
                initialRegion={{
                  ...sanSalvadorCenter,
                  ...(selectedLocation && {
                    latitude: selectedLocation.latitude,
                    longitude: selectedLocation.longitude,
                  }),
                }}
                onPress={handleMapPress}
              >
                {selectedLocation && (
                  <Marker
                    coordinate={selectedLocation}
                    pinColor="#6c5ce7"
                  />
                )}
              </MapView>
              <Text style={styles.mapHint}>
                Toca el mapa para seleccionar la ubicación
              </Text>
            </View>
            
            {/* Formulario */}
            <View style={styles.form}>
              <Text style={styles.label}>Nombre *</Text>
              <TextInput
                style={styles.input}
                value={formData.nombre}
                onChangeText={(text) =>
                  setFormData({ ...formData, nombre: text })
                }
                placeholder="Ej: Centro Comercial Galerías"
              />
              
              <Text style={styles.label}>Dirección *</Text>
              <TextInput
                style={styles.input}
                value={formData.direccion}
                onChangeText={(text) =>
                  setFormData({ ...formData, direccion: text })
                }
                placeholder="Dirección completa"
                multiline
              />
              
              <Text style={styles.label}>Descripción</Text>
              <TextInput
                style={styles.input}
                value={formData.descripcion}
                onChangeText={(text) =>
                  setFormData({ ...formData, descripcion: text })
                }
                placeholder="Descripción adicional"
                multiline
              />
              
              <Text style={styles.label}>Referencia</Text>
              <TextInput
                style={styles.input}
                value={formData.referencia}
                onChangeText={(text) =>
                  setFormData({ ...formData, referencia: text })
                }
                placeholder="Punto de referencia cercano"
              />
              
              <Text style={styles.label}>Horario de Atención</Text>
              <TextInput
                style={styles.input}
                value={formData.horarioAtencion}
                onChangeText={(text) =>
                  setFormData({ ...formData, horarioAtencion: text })
                }
                placeholder="Horario"
              />
              
              <View style={styles.switchContainer}>
                <Text style={styles.label}>Activo</Text>
                <Switch
                  value={formData.activo}
                  onValueChange={(value) =>
                    setFormData({ ...formData, activo: value })
                  }
                  trackColor={{ false: '#ccc', true: '#6c5ce7' }}
                  thumbColor={formData.activo ? '#fff' : '#f4f3f4'}
                />
              </View>
            </View>
          </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  mapContainer: {
    height: 300,
  },
  map: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  pointCard: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  pointCardInactive: {
    backgroundColor: '#f5f5f5',
  },
  pointHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  pointInfo: {
    flex: 1,
  },
  pointName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  pointAddress: {
    fontSize: 14,
    color: '#666',
  },
  pointActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
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
  saveButton: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6c5ce7',
  },
  modalContent: {
    flex: 1,
  },
  modalMapContainer: {
    height: 250,
  },
  modalMap: {
    flex: 1,
  },
  mapHint: {
    padding: 8,
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f5f5f5',
  },
  form: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
});

