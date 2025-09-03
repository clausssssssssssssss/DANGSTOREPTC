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

  const API_URL = 'https://dangstoreptc.onrender.com/api/material';
  const API_URL_WITHOUT_IMAGE = 'https://dangstoreptc.onrender.com/api/material/without-image';

  useEffect(() => {
    obtenerMateriales();
  }, []);

  const obtenerMateriales = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setMaterials(data);
    } catch (error) {
      console.error('Error obteniendo materiales:', error);
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
      setNuevoMaterial({ ...nuevoMaterial, image: result.assets[0].uri });
    }
  };

  const resetForm = () => setNuevoMaterial({
    name: '',
    type: '',
    quantity: '',
    investment: '',
    dateOfEntry: new Date().toISOString().split('T')[0],
    image: null,
  });

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
      Alert.alert('Error', 'El nombre del material es obligatorio');
      return;
    }
    if (!nuevoMaterial.type.trim()) {
      Alert.alert('Error', 'El tipo de material es obligatorio');
      return;
    }
    if (!nuevoMaterial.quantity.trim()) {
      Alert.alert('Error', 'El stock es obligatorio');
      return;
    }
    if (!nuevoMaterial.investment.trim()) {
      Alert.alert('Error', 'La inversión es obligatoria');
      return;
    }
    // Temporalmente hacer la imagen opcional para debugging
    if (!nuevoMaterial.image) {
      console.log('⚠️ Imagen no seleccionada - continuando sin imagen para debug');
      // Alert.alert('Error', 'La imagen es obligatoria');
      // return;
    }

    try {
      // PRUEBA 1: Enviar solo datos básicos sin imagen
      const materialData = {
        name: nuevoMaterial.name.trim(),
        type: nuevoMaterial.type.trim(),
        quantity: parseInt(nuevoMaterial.quantity),
        investment: parseFloat(nuevoMaterial.investment),
        dateOfEntry: nuevoMaterial.dateOfEntry,
      };

      console.log('Enviando datos básicos:', materialData);

      const response = await fetch(API_URL_WITHOUT_IMAGE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(materialData),
      });

      // Remover logs antiguos que ya no aplican

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage += `, message: ${errorData.message || 'Error desconocido'}`;
          console.error('Error completo del servidor:', errorData);
        } catch (parseError) {
          console.error('No se pudo parsear el error del servidor:', parseError);
        }
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      console.log('Respuesta del servidor:', responseData);
      
      Alert.alert('Éxito', 'Material agregado correctamente');
      setModalVisible(false);
      obtenerMateriales();
      resetForm();
    } catch (error) {
      console.error('Error al agregar material:', error);
      Alert.alert('Error', error.message || 'Error al procesar la solicitud');
    }
  };

  const confirmDelete = async (id) => {
    Alert.alert('Eliminar', '¿Estás seguro de eliminar este material?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        try { 
          const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
          });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          Alert.alert('Material eliminado');
          obtenerMateriales(); 
        }
        catch { Alert.alert('Error', 'No se pudo eliminar'); }
      }}
    ]);
  };

  const materialesFiltrados = materials.filter(m =>
    m.name && m.name.toLowerCase().includes(busqueda.toLowerCase())
  );

  const renderMaterial = ({ item }) => (
    <View style={InventarioStyles.card}>
      <Image source={{ uri: item.image }} style={InventarioStyles.cardImage} />
      <Text style={InventarioStyles.cardTitle}>{item.name}</Text>
      <Text style={InventarioStyles.cardText}>Tipo: {item.type}</Text>
      <Text style={InventarioStyles.cardText}>Stock: {item.quantity}</Text>
      <Text style={InventarioStyles.cardText}>Inversión: ${item.investment}</Text>
      <Text style={InventarioStyles.cardText}>Fecha: {new Date(item.dateOfEntry).toLocaleDateString()}</Text>
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
        
                 <TouchableOpacity
           style={InventarioStyles.testBtn}
           onPress={async () => {
             try {
               const response = await fetch(API_URL);
               if (!response.ok) {
                 throw new Error(`HTTP error! status: ${response.status}`);
               }
               const data = await response.json();
               Alert.alert('Conexión exitosa', `Conectado al backend. Materiales disponibles: ${data.length}`);
             } catch (error) {
               Alert.alert('Error de conexión', 'No se pudo conectar con el backend');
               console.error('Error de conexión:', error);
             }
           }}
         >
           <Text style={InventarioStyles.testBtnText}>🔍 Probar conexión</Text>
         </TouchableOpacity>
         
         <TouchableOpacity
           style={[InventarioStyles.testBtn, { backgroundColor: '#F59E0B' }]}
           onPress={async () => {
             try {
               const testData = {
                 name: 'Material de Prueba',
                 type: 'Test',
                 quantity: 1,
                 investment: 10.50,
                 dateOfEntry: new Date().toISOString().split('T')[0],
               };
               
               console.log('Probando con datos básicos:', testData);
               
                               const response = await fetch(API_URL_WITHOUT_IMAGE, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(testData),
                });
               
               if (!response.ok) {
                 const errorData = await response.json().catch(() => ({}));
                 throw new Error(`Error ${response.status}: ${errorData.message || 'Error desconocido'}`);
               }
               
               const result = await response.json();
               Alert.alert('Prueba exitosa', 'Material de prueba creado correctamente');
               console.log('Resultado de prueba:', result);
               obtenerMateriales();
             } catch (error) {
               Alert.alert('Error en prueba', error.message);
               console.error('Error en prueba:', error);
             }
           }}
         >
           <Text style={InventarioStyles.testBtnText}>🧪 Probar sin imagen</Text>
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
              onPress={() => setModalVisible(false)}
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
                    <Text style={InventarioStyles.imagePickerText}>📷</Text>
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
                {!nuevoMaterial.name.trim() && (
                  <Text style={InventarioStyles.fieldRequired}>Campo obligatorio</Text>
                )}
              </View>
              <View style={InventarioStyles.inputWrapper}>
                <TextInput
                  style={InventarioStyles.input}
                  placeholder="Tipo de material *"
                  value={nuevoMaterial.type}
                  onChangeText={text => setNuevoMaterial({ ...nuevoMaterial, type: text })}
                />
                {!nuevoMaterial.type.trim() && (
                  <Text style={InventarioStyles.fieldRequired}>Campo obligatorio</Text>
                )}
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
                <Text style={InventarioStyles.agregarBtnText}>Agregar</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};



export default Inventario;  
