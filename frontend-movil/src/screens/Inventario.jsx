import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  FlatList,
  Image,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { InventarioStyles } from '../components/styles/InventarioStyles';
import { getMaterials, createMaterial, updateMaterial, deleteMaterial } from '../services/materialService';
import { API_CONFIG } from '../config/api';
import AlertComponent from '../components/ui/Alert';
import { sharedStyles } from '../components/SharedStyles';
import ActionButton from '../components/ui/ActionButton';

const Inventario = ({ navigation }) => {
  const [materials, setMaterials] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [nuevoMaterial, setNuevoMaterial] = useState({
    name: '',
    type: '',
    quantity: '',
    investment: '',
    dateOfEntry: new Date().toISOString().split('T')[0],
    image: null,
  });
  const [quantityError, setQuantityError] = useState('');
  const [investmentError, setInvestmentError] = useState('');
  const [alert, setAlert] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info', // 'success', 'error', 'warning', 'info'
    onConfirm: null,
    onCancel: null,
    confirmText: 'OK',
    cancelText: 'Cancelar',
    showCancel: false,
  });

  // Usar la configuración centralizada de API
  const API_BASE = API_CONFIG.BASE_URL;

  useEffect(() => {
    obtenerMateriales();
  }, []);

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

  const obtenerMateriales = async () => {
    try {
      const data = await getMaterials(API_BASE);
      setMaterials(data);
    } catch (error) {
      showAlert('Error', 'No se pudieron cargar los materiales. Verifica la conexión.', 'error');
    }
  };

  const seleccionarImagen = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      console.log('Imagen seleccionada:', result.assets[0].uri);
      setNuevoMaterial({ ...nuevoMaterial, image: result.assets[0].uri });
    }
  };

  const resetForm = () => {
    setNuevoMaterial({
      name: '',
      type: '',
      quantity: '',
      investment: '',
      dateOfEntry: new Date().toISOString().split('T')[0],
      image: null,
    });
    setEditItem(null);
  };

  const handleQuantityChange = (text) => {
    if (/^\d*$/.test(text)) {
      setNuevoMaterial({ ...nuevoMaterial, quantity: text });
      setQuantityError('');
    } else {
      setQuantityError('Solo se pueden usar números');
      setTimeout(() => setQuantityError(''), 1500);
    }
  };

  const handleInvestmentChange = (text) => {
    if (/^\d*\.?\d*$/.test(text)) {
      setNuevoMaterial({ ...nuevoMaterial, investment: text });
      setInvestmentError('');
    } else {
      setInvestmentError('Solo se pueden usar números');
      setTimeout(() => setInvestmentError(''), 1500);
    }
  };

  const agregarMaterial = async () => {
    // Validar campos obligatorios
    if (!nuevoMaterial.name.trim()) {
      showAlert('Error', 'El nombre del material es obligatorio', 'error');
      return;
    }
    if (!nuevoMaterial.type.trim()) {
      showAlert('Error', 'El tipo de material es obligatorio', 'error');
      return;
    }
    if (!nuevoMaterial.quantity.trim()) {
      showAlert('Error', 'El stock es obligatorio', 'error');
      return;
    }
    if (!nuevoMaterial.investment.trim()) {
      showAlert('Error', 'La inversión es obligatoria', 'error');
      return;
    }

    try {
      const materialData = {
        name: nuevoMaterial.name.trim(),
        type: nuevoMaterial.type.trim(),
        quantity: parseInt(nuevoMaterial.quantity),
        investment: parseFloat(nuevoMaterial.investment),
        dateOfEntry: nuevoMaterial.dateOfEntry,
        image: nuevoMaterial.image,
      };

      let response;
      if (editItem) {
        // Editar material existente
        response = await updateMaterial(API_BASE, editItem._id, materialData);
        showAlert('Éxito', 'Material actualizado correctamente', 'success');
      } else {
        // Crear nuevo material
        response = await createMaterial(API_BASE, materialData);
        showAlert('Éxito', 'Material agregado correctamente', 'success');
      }
      
      setModalVisible(false);
      obtenerMateriales();
      resetForm();
    } catch (error) {
      showAlert('Error', error.message || 'Error al procesar la solicitud', 'error');
    }
  };

  const editMaterial = (material) => {
    setEditItem(material);
    setNuevoMaterial({
      name: material.name,
      type: material.type,
      quantity: material.quantity.toString(),
      investment: material.investment.toString(),
      dateOfEntry: material.dateOfEntry,
      image: material.image,
    });
    setModalVisible(true);
  };

  const confirmDelete = async (id) => {
    showAlert(
      'Confirmar eliminación',
      '¿Estás seguro de eliminar este material?',
      'warning',
      {
        showCancel: true,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        onConfirm: async () => {
          try { 
            await deleteMaterial(API_BASE, id);
            showAlert('Éxito', 'Material eliminado correctamente', 'success');
            obtenerMateriales(); 
          }
          catch (error) { 
            showAlert('Error', 'No se pudo eliminar el material', 'error'); 
          }
        },
        onCancel: () => setAlert(prev => ({ ...prev, visible: false })),
      }
    );
  };

  const materialesFiltrados = materials.filter(m =>
    m.name && m.name.toLowerCase().includes(busqueda.toLowerCase())
  );

  const renderMaterial = ({ item }) => (
    <View style={InventarioStyles.card}>
      <Image 
        source={{ uri: item.image || 'https://via.placeholder.com/150' }} 
        style={InventarioStyles.cardImage}
        onError={() => {}}
      />
      <Text style={InventarioStyles.cardTitle}>{item.name}</Text>
      <Text style={InventarioStyles.cardText}>Tipo: {item.type}</Text>
      <Text style={InventarioStyles.cardText}>Stock: {item.quantity}</Text>
      <Text style={InventarioStyles.cardText}>Inversión: ${item.investment}</Text>
      
      <View style={InventarioStyles.cardActions}>
        <TouchableOpacity 
          style={[InventarioStyles.editButton]}
          onPress={() => editMaterial(item)}
        >
          <Text style={InventarioStyles.editButtonText}>✎</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[InventarioStyles.deleteButton]}
          onPress={() => confirmDelete(item._id)}
        >
          <Text style={InventarioStyles.deleteButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={InventarioStyles.container}>
      <View style={InventarioStyles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={InventarioStyles.backButton}
        >
          <Text style={InventarioStyles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={InventarioStyles.headerTitle}>Inventario</Text>
        <View style={InventarioStyles.placeholder} />
      </View>

      <View style={InventarioStyles.searchContainer}>
        <TextInput
          style={InventarioStyles.searchInput}
          placeholder="Buscar material"
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      <View style={InventarioStyles.buttonContainer}>
        <TouchableOpacity
          style={InventarioStyles.nuevoBtn}
          onPress={() => setModalVisible(true)}
        >
          <Text style={InventarioStyles.nuevoBtnText}>+ Nuevo material</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={materialesFiltrados}
        keyExtractor={item => item._id}
        renderItem={renderMaterial}
        numColumns={2}
        contentContainerStyle={InventarioStyles.listContainer}
      />

      {/* Modal para agregar material */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={InventarioStyles.modalOverlay}>
          <View style={InventarioStyles.modalBox}>
            <TouchableOpacity
              style={InventarioStyles.modalBack}
              onPress={() => {
                setModalVisible(false);
                resetForm();
              }}
            >
              <Text style={InventarioStyles.backButtonText}>←</Text>
            </TouchableOpacity>
            <ScrollView contentContainerStyle={InventarioStyles.modalContent}>
              <TouchableOpacity
                style={[
                  InventarioStyles.imagePicker,
                  !nuevoMaterial.image && InventarioStyles.imagePickerRequired
                ]}
                onPress={seleccionarImagen}
              >
                {nuevoMaterial.image ? (
                  <Image
                    source={{ uri: nuevoMaterial.image }}
                    style={InventarioStyles.previewImage}
                  />
                ) : (
                  <View style={InventarioStyles.imagePickerEmpty}>
                    <Text style={InventarioStyles.imagePickerText}>Cámara</Text>
                    <Text style={InventarioStyles.imagePickerSubtext}>Subir imagen</Text>
                    <Text style={InventarioStyles.imagePickerRequired}>*Obligatorio</Text>
                  </View>
                )}
              </TouchableOpacity>
              <View style={InventarioStyles.inputWrapper}>
                <TextInput
                  style={InventarioStyles.input}
                  placeholder="Nombre del material *"
                  value={nuevoMaterial.name}
                  onChangeText={text => setNuevoMaterial({ ...nuevoMaterial, name: text })}
                />
              </View>
              <View style={InventarioStyles.inputWrapper}>
                <TextInput
                  style={InventarioStyles.input}
                  placeholder="Tipo de material *"
                  value={nuevoMaterial.type}
                  onChangeText={text => setNuevoMaterial({ ...nuevoMaterial, type: text })}
                />
              </View>
              <View style={InventarioStyles.row}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <TextInput
                    style={InventarioStyles.input}
                    placeholder="Stock disponible"
                    keyboardType="numeric"
                    value={nuevoMaterial.quantity}
                    onChangeText={handleQuantityChange}
                    maxLength={5}
                  />
                  {quantityError ? (
                    <Text style={InventarioStyles.errorText}>{quantityError}</Text>
                  ) : null}
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <View style={InventarioStyles.inputContainer}>
                    <Text style={InventarioStyles.precioSimbolo}>$</Text>
                    <TextInput
                      style={InventarioStyles.inputPrecio}
                      placeholder="Inversión"
                      keyboardType="numeric"
                      value={nuevoMaterial.investment}
                      onChangeText={handleInvestmentChange}
                      maxLength={8}
                    />
                  </View>
                  {investmentError ? (
                    <Text style={InventarioStyles.errorText}>{investmentError}</Text>
                  ) : null}
                </View>
              </View>
              <TextInput
                style={InventarioStyles.input}
                placeholder="Fecha de entrada (YYYY-MM-DD)"
                value={nuevoMaterial.dateOfEntry}
                onChangeText={text => setNuevoMaterial({ ...nuevoMaterial, dateOfEntry: text })}
              />
              <TouchableOpacity style={InventarioStyles.agregarBtn} onPress={agregarMaterial}>
                <Text style={InventarioStyles.agregarBtnText}>
                  {editItem ? 'Actualizar' : 'Agregar'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

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

      <ScrollView style={InventarioStyles.container}>
        <View style={sharedStyles.cardContainer}>
          <ActionButton 
            title="Nueva Categoría" 
            onPress={() => navigation.navigate('NuevaCategoria')}
          />
        </View>
        
        {/* Other cards with similar button styling */}
        <View style={sharedStyles.cardContainer}>
          <ActionButton 
            title="Gestionar Productos" 
            onPress={() => navigation.navigate('Productos')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};



export default Inventario;

