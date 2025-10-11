import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Switch,
  Modal,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import API_URL from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PuntosEntregaSimple() {
  const navigation = useNavigation();
  const [deliveryPoints, setDeliveryPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPoint, setEditingPoint] = useState(null);
  
  // Ubicación seleccionada
  const [selectedLocation, setSelectedLocation] = useState({
    latitude: 13.6929,
    longitude: -89.2182,
  });
  
  // Región del mapa (para centrarlo)
  const [mapRegion, setMapRegion] = useState({
    latitude: 13.6929,
    longitude: -89.2182,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  
  // Key para forzar re-render del mapa
  const [mapKey, setMapKey] = useState(0);
  
  // Formulario
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    descripcion: '',
    referencia: '',
    activo: true,
  });
  
  // Motor de búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  
  // Ubicaciones verificadas en El Salvador (coordenadas de Google Maps)
  const ubicaciones = [
    { id: 1, nombre: 'Metrocentro', direccion: 'Blvd. de los Héroes, San Salvador', lat: 13.6989, lng: -89.1919, ref: 'Centro Comercial' },
    { id: 2, nombre: 'Plaza Mundo', direccion: 'Blvd. del Hipódromo, San Salvador', lat: 13.7158, lng: -89.1524, ref: 'Centro Comercial' },
    { id: 3, nombre: 'Galerías Escalón', direccion: 'Paseo Gral. Escalón, San Salvador', lat: 13.7069, lng: -89.2405, ref: 'Centro Comercial' },
    { id: 4, nombre: 'UCA', direccion: 'Blvd. Los Próceres, San Salvador', lat: 13.7108, lng: -89.2354, ref: 'Universidad' },
    { id: 5, nombre: 'La Gran Vía', direccion: 'Antiguo Cuscatlán, La Libertad', lat: 13.6742, lng: -89.2398, ref: 'Centro Comercial' },
    { id: 6, nombre: 'Multiplaza', direccion: 'Antiguo Cuscatlán, La Libertad', lat: 13.6726, lng: -89.2389, ref: 'Centro Comercial' },
    { id: 7, nombre: 'Centro Histórico', direccion: 'Centro de San Salvador', lat: 13.6989, lng: -89.1914, ref: 'Plaza Libertad' },
    { id: 8, nombre: 'Hospital Rosales', direccion: 'San Salvador', lat: 13.7117, lng: -89.2036, ref: 'Hospital Nacional' },
  ];
  
  useEffect(() => {
    loadDeliveryPoints();
  }, []);
  
  const getAuthHeaders = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      };
    } catch (error) {
      console.error('Error obteniendo token:', error);
      return { 'Content-Type': 'application/json' };
    }
  };
  
  const loadDeliveryPoints = async () => {
    try {
      setLoading(true);
      const headers = await getAuthHeaders();
      const url = `${API_URL}/delivery-points?includeInactive=true`;
      
      console.log('Cargando puntos desde:', url);
      
      const response = await fetch(url, { headers });
      
      console.log('Respuesta HTTP:', response.status);
      
      if (!response.ok) {
        const text = await response.text();
        console.log('Respuesta del servidor:', text);
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Puntos cargados:', data.deliveryPoints?.length || 0);
      
      if (data.success) {
        setDeliveryPoints(data.deliveryPoints || []);
      } else {
        throw new Error(data.message || 'Error al cargar');
      }
    } catch (error) {
      console.error('Error cargando puntos:', error);
      Alert.alert('Error', 'No se pudieron cargar los puntos de entrega. Verifica que el backend esté actualizado.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.trim().length > 0) {
      const filtered = ubicaciones.filter(u => 
        u.nombre.toLowerCase().includes(text.toLowerCase()) ||
        u.direccion.toLowerCase().includes(text.toLowerCase())
      );
      setSearchResults(filtered);
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };
  
  const selectUbicacion = (ubi) => {
    console.log('========================================');
    console.log('UBICACIÓN SELECCIONADA:', ubi.nombre);
    console.log('COORDENADAS:', ubi.lat, ubi.lng);
    
    const newLocation = {
      latitude: ubi.lat,
      longitude: ubi.lng,
    };
    
    const newRegion = {
      latitude: ubi.lat,
      longitude: ubi.lng,
      latitudeDelta: 0.005, // MÁS ZOOM
      longitudeDelta: 0.005,
    };
    
    setSelectedLocation(newLocation);
    setMapRegion(newRegion);
    setMapKey(prev => prev + 1); // FORZAR RE-RENDER
    setFormData({
      nombre: ubi.nombre,
      direccion: ubi.direccion,
      descripcion: `Punto de entrega en ${ubi.nombre}`,
      referencia: `Cerca de ${ubi.ref}`,
      activo: true,
    });
    // NO borrar el query para que el usuario vea qué seleccionó
    setShowResults(false);
    
    console.log('MAPA RE-RENDERIZADO A:', ubi.nombre);
    console.log('LAT/LNG:', ubi.lat, ubi.lng);
    console.log('========================================');
  };
  
  const openAddModal = () => {
    setEditingPoint(null);
    setFormData({
      nombre: '',
      direccion: '',
      descripcion: '',
      referencia: '',
      activo: true,
    });
    setSelectedLocation({
      latitude: 13.6929,
      longitude: -89.2182,
    });
    setMapRegion({
      latitude: 13.6929,
      longitude: -89.2182,
      latitudeDelta: 0.15,
      longitudeDelta: 0.15,
    });
    setMapKey(prev => prev + 1);
    setSearchQuery('');
    setShowResults(false);
    setModalVisible(true);
  };
  
  const openEditModal = (point) => {
    setEditingPoint(point);
    setFormData({
      nombre: point.nombre,
      direccion: point.direccion,
      descripcion: point.descripcion || '',
      referencia: point.referencia || '',
      activo: point.activo,
    });
    setSelectedLocation({
      latitude: point.coordenadas.lat,
      longitude: point.coordenadas.lng,
    });
    setMapRegion({
      latitude: point.coordenadas.lat,
      longitude: point.coordenadas.lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
    setMapKey(prev => prev + 1);
    setSearchQuery('');
    setShowResults(false);
    setModalVisible(true);
  };
  
  const handleSave = async () => {
    if (!formData.nombre.trim()) {
      Alert.alert('Error', 'El nombre es requerido');
      return;
    }
    
    if (!formData.direccion.trim()) {
      Alert.alert('Error', 'La dirección es requerida');
      return;
    }
    
    try {
      const url = editingPoint
        ? `${API_URL}/delivery-points/${editingPoint._id}`
        : `${API_URL}/delivery-points`;
      
      const method = editingPoint ? 'PUT' : 'POST';
      const headers = await getAuthHeaders();
      
      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify({
          ...formData,
          coordenadas: {
            lat: selectedLocation.latitude,
            lng: selectedLocation.longitude,
          },
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        Alert.alert(
          'Éxito',
          editingPoint ? 'Punto actualizado' : 'Punto creado'
        );
        setModalVisible(false);
        loadDeliveryPoints();
      } else {
        Alert.alert('Error', data.message || 'Error al guardar');
      }
    } catch (error) {
      console.error('Error guardando:', error);
      Alert.alert('Error', 'No se pudo guardar el punto. Verifica tu conexión.');
    }
  };
  
  const handleToggleStatus = async (point) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/delivery-points/${point._id}/toggle`, {
        method: 'PATCH',
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        loadDeliveryPoints();
      } else {
        Alert.alert('Error', data.message || 'Error al cambiar estado');
      }
    } catch (error) {
      console.error('Error cambiando estado:', error);
      Alert.alert('Error', 'No se pudo cambiar el estado');
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
              const headers = await getAuthHeaders();
              const response = await fetch(`${API_URL}/delivery-points/${point._id}`, {
                method: 'DELETE',
                headers,
              });
              
              if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
              }
              
              const data = await response.json();
              
              if (data.success) {
                Alert.alert('Éxito', 'Punto eliminado');
                loadDeliveryPoints();
              } else {
                Alert.alert('Error', data.message || 'Error al eliminar');
              }
            } catch (error) {
              console.error('Error eliminando:', error);
              Alert.alert('Error', 'No se pudo eliminar el punto');
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
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Puntos de Entrega</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Ionicons name="add-circle" size={32} color="#6c5ce7" />
        </TouchableOpacity>
      </View>
      
      {/* Lista */}
      <View style={styles.listContainer}>
        
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {deliveryPoints.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="location-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No hay puntos de entrega</Text>
              <Text style={styles.emptySubtext}>Presiona el + para agregar uno</Text>
            </View>
          ) : (
            deliveryPoints.map((point) => (
              <View key={point._id} style={styles.pointCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.pointInfo}>
                    <Text style={styles.pointName}>{point.nombre}</Text>
                    <Text style={styles.pointAddress}>{point.direccion}</Text>
                    {point.referencia && (
                      <Text style={styles.pointRef}>
                        <Ionicons name="location" size={12} color="#666" /> {point.referencia}
                      </Text>
                    )}
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: point.activo ? '#E8F5E9' : '#FFEBEE' }]}>
                    <Text style={[styles.statusText, { color: point.activo ? '#4CAF50' : '#F44336' }]}>
                      {point.activo ? 'Activo' : 'Inactivo'}
                    </Text>
                  </View>
                </View>
                <View style={styles.pointActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => openEditModal(point)}
                  >
                    <Ionicons name="create-outline" size={20} color="#2196F3" />
                    <Text style={[styles.actionText, { color: '#2196F3' }]}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleDelete(point)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#F44336" />
                    <Text style={[styles.actionText, { color: '#F44336' }]}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
      
      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide">
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
            {/* Motor de búsqueda */}
            <View style={styles.searchSection}>
              <Text style={styles.searchLabel}>Buscar ubicación</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Ej: Metrocentro, UCA, Plaza Mundo..."
                value={searchQuery}
                onChangeText={handleSearch}
              />
              
              {showResults && searchResults.length > 0 && (
                <ScrollView style={styles.resultsContainer} nestedScrollEnabled>
                  {searchResults.map(ubi => (
                    <TouchableOpacity
                      key={ubi.id}
                      style={styles.resultItem}
                      onPress={() => selectUbicacion(ubi)}
                    >
                      <View style={styles.resultContent}>
                        <Text style={styles.resultName}>{ubi.nombre}</Text>
                        <Text style={styles.resultAddress}>{ubi.direccion}</Text>
                      </View>
                      <Ionicons name="location" size={20} color="#6c5ce7" />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
            
            {/* Mapa */}
            <View style={styles.modalMapContainer}>
              <MapView
                key={`map-${mapKey}`}
                style={styles.modalMap}
                initialRegion={mapRegion}
                mapType="standard"
                showsUserLocation={false}
                showsMyLocationButton={false}
                showsCompass={true}
                showsScale={false}
                showsBuildings={true}
                showsTraffic={false}
                showsIndoors={true}
                scrollEnabled={true}
                zoomEnabled={true}
                pitchEnabled={true}
                rotateEnabled={true}
                toolbarEnabled={false}
                onPress={(event) => {
                  const coord = event.nativeEvent.coordinate;
                  console.log('MAPA TOCADO:', coord.latitude, coord.longitude);
                  setSelectedLocation(coord);
                }}
              >
                <Marker 
                  coordinate={selectedLocation} 
                  pinColor="#6c5ce7"
                  title="Punto seleccionado"
                />
              </MapView>
              <View style={styles.mapInfo}>
                <Text style={styles.mapHint}>Toca el mapa para seleccionar</Text>
                <Text style={styles.mapCoords}>
                  Mapa: {mapRegion.latitude.toFixed(4)}, {mapRegion.longitude.toFixed(4)}
                </Text>
                <Text style={styles.mapCoords}>
                  Marcador: {selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)}
                </Text>
              </View>
            </View>
            
            {/* Formulario */}
            <View style={styles.form}>
              <Text style={styles.label}>Nombre *</Text>
              <TextInput
                style={styles.input}
                value={formData.nombre}
                onChangeText={(text) => setFormData({ ...formData, nombre: text })}
                placeholder="Nombre del punto"
              />
              
              <Text style={styles.label}>Dirección *</Text>
              <TextInput
                style={styles.input}
                value={formData.direccion}
                onChangeText={(text) => setFormData({ ...formData, direccion: text })}
                placeholder="Dirección completa"
                multiline
              />
              
              <Text style={styles.label}>Descripción</Text>
              <TextInput
                style={styles.input}
                value={formData.descripcion}
                onChangeText={(text) => setFormData({ ...formData, descripcion: text })}
                placeholder="Descripción"
                multiline
              />
              
              <Text style={styles.label}>Referencia</Text>
              <TextInput
                style={styles.input}
                value={formData.referencia}
                onChangeText={(text) => setFormData({ ...formData, referencia: text })}
                placeholder="Referencia cercana"
              />
              
              <View style={styles.switchContainer}>
                <Text style={styles.label}>Activo</Text>
                <Switch
                  value={formData.activo}
                  onValueChange={(value) => setFormData({ ...formData, activo: value })}
                  trackColor={{ false: '#ccc', true: '#6c5ce7' }}
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
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
  },
  addButton: {
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 8,
  },
  pointCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  pointInfo: {
    flex: 1,
    marginRight: 12,
  },
  pointName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  pointAddress: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    lineHeight: 20,
  },
  pointRef: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
    fontStyle: 'italic',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  pointActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
    marginTop: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
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
    paddingTop: 50,
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
    height: 500, // MÁS ALTO PARA VER MEJOR
    margin: 16,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  modalMap: {
    flex: 1,
  },
  mapInfo: {
    backgroundColor: '#f5f5f5',
    padding: 8,
  },
  mapHint: {
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  mapCoords: {
    textAlign: 'center',
    fontSize: 10,
    color: '#2196F3',
    fontFamily: 'monospace',
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
  searchSection: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  resultsContainer: {
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    maxHeight: 200,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultContent: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  resultAddress: {
    fontSize: 14,
    color: '#666',
  },
});

