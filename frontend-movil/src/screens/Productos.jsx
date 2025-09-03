import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  TextInput,
  FlatList,
  Image,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { AuthContext } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');
const API_URL = 'http://192.168.0.9:4000/api/products'; // Cambia la IP si es necesario

const Productos = ({ navigation }) => {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    disponibles: '',
    categoria: 'Llavero',
    imagen: null,
  });
  const [disponiblesError, setDisponiblesError] = useState('');
  const [precioError, setPrecioError] = useState('');
  const { authToken } = useContext(AuthContext);

  useEffect(() => {
    obtenerProductos();
  }, []);

  const obtenerProductos = async () => {
    try {
      setCargando(true);
      const res = await axios.get(API_URL);
      setProductos(res.data);
    } catch (error) {
      console.log('Error obteniendo productos:', error);
      Alert.alert('Error', 'No se pudieron cargar los productos');
    } finally {
      setCargando(false);
    }
  };

  const agregarProducto = async () => {
    // Validaciones
    if (!nuevoProducto.nombre || !nuevoProducto.precio || !nuevoProducto.disponibles) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    if (!nuevoProducto.imagen) {
      Alert.alert('Error', 'Por favor selecciona una imagen');
      return;
    }

    try {
      setCargando(true);
      const formData = new FormData();
      formData.append('nombre', nuevoProducto.nombre);
      formData.append('descripcion', nuevoProducto.descripcion);
      formData.append('precio', nuevoProducto.precio);
      formData.append('disponibles', nuevoProducto.disponibles);
      formData.append('categoria', nuevoProducto.categoria);
      
      if (nuevoProducto.imagen) {
        // Extraer el nombre del archivo de la URI
        let filename = nuevoProducto.imagen.split('/').pop();
        let match = /\.(\w+)$/.exec(filename);
        let type = match ? `image/${match[1]}` : 'image/jpeg';
        
        formData.append('imagen', {
          uri: nuevoProducto.imagen,
          name: filename,
          type,
        });
      }

      const response = await axios.post(API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
      });

      if (response.status === 201) {
        Alert.alert('Éxito', 'Producto agregado correctamente');
        setModalVisible(false);
        obtenerProductos();
        setNuevoProducto({
          nombre: '',
          descripcion: '',
          precio: '',
          disponibles: '',
          categoria: 'Llavero',
          imagen: null,
        });
      }
    } catch (error) {
      console.log('Error al agregar producto:', error);
      Alert.alert('Error', 'No se pudo agregar el producto');
    } finally {
      setCargando(false);
    }
  };

  const seleccionarImagen = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      
      if (!result.canceled) {
        setNuevoProducto({ ...nuevoProducto, imagen: result.assets[0].uri });
      }
    } catch (error) {
      console.log('Error seleccionando imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const handleDisponiblesChange = (text) => {
    if (/^\d*$/.test(text)) {
      setNuevoProducto({ ...nuevoProducto, disponibles: text });
      setDisponiblesError('');
    } else {
      setDisponiblesError('Solo se pueden usar números');
      setTimeout(() => setDisponiblesError(''), 1500);
    }
  };

  const handlePrecioChange = (text) => {
    if (/^\d*\.?\d*$/.test(text)) {
      setNuevoProducto({ ...nuevoProducto, precio: text });
      setPrecioError('');
    } else {
      setPrecioError('Solo se pueden usar números');
      setTimeout(() => setPrecioError(''), 1500);
    }
  };

  const productosFiltrados = productos.filter(p =>
    p.nombre && p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const renderProducto = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: `http://192.168.0.9:4000/uploads/${item.imagen}` }} style={styles.cardImage} />
      <Text style={styles.cardTitle}>{item.nombre}</Text>
      <Text style={styles.cardText}>Precio: ${item.precio}</Text>
      <Text style={styles.cardText}>Disponibles: {item.disponibles}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tus productos</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar producto"
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      <TouchableOpacity
        style={styles.nuevoBtn}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.nuevoBtnText}>+ Nuevo producto</Text>
      </TouchableOpacity>

      {cargando && (
        <View style={styles.cargandoContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
      )}

      <FlatList
        data={productosFiltrados}
        keyExtractor={item => item._id}
        renderItem={renderProducto}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
      />

      {/* Modal para agregar producto */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => !cargando && setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <TouchableOpacity
              style={styles.modalBack}
              onPress={() => !cargando && setModalVisible(false)}
              disabled={cargando}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <ScrollView contentContainerStyle={styles.modalContent}>
              <TouchableOpacity
                style={styles.imagePicker}
                onPress={seleccionarImagen}
                disabled={cargando}
              >
                {nuevoProducto.imagen ? (
                  <Image
                    source={{ uri: nuevoProducto.imagen }}
                    style={styles.previewImage}
                  />
                ) : (
                  <Text style={styles.imagePickerText}>Subir imagen</Text>
                )}
              </TouchableOpacity>
              <TextInput
                style={styles.input}
                placeholder="Nombre"
                value={nuevoProducto.nombre}
                onChangeText={text => setNuevoProducto({ ...nuevoProducto, nombre: text })}
                editable={!cargando}
              />
              <View style={styles.descripcionContainer}>
                <TextInput
                  style={styles.descripcionInput}
                  placeholder="Descripción"
                  value={nuevoProducto.descripcion}
                  onChangeText={text => setNuevoProducto({ ...nuevoProducto, descripcion: text })}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  editable={!cargando}
                />
              </View>
              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.precioSimbolo}>$</Text>
                    <TextInput
                      style={styles.inputPrecio}
                      placeholder="Precio"
                      keyboardType="numeric"
                      value={nuevoProducto.precio}
                      onChangeText={handlePrecioChange}
                      maxLength={8}
                      editable={!cargando}
                    />
                  </View>
                  {precioError ? (
                    <Text style={styles.errorText}>{precioError}</Text>
                  ) : null}
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <TextInput
                    style={styles.input}
                    placeholder="Disponibles"
                    keyboardType="numeric"
                    value={nuevoProducto.disponibles}
                    onChangeText={handleDisponiblesChange}
                    maxLength={5}
                    editable={!cargando}
                  />
                  {disponiblesError ? (
                    <Text style={styles.errorText}>{disponiblesError}</Text>
                  ) : null}
                </View>
              </View>
              <View style={styles.row}>
                <Text style={styles.categoriaLabel}>Categoría:</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={nuevoProducto.categoria}
                    style={styles.picker}
                    onValueChange={itemValue =>
                      setNuevoProducto({ ...nuevoProducto, categoria: itemValue })
                    }
                    dropdownIconColor="#8B5CF6"
                    mode="dropdown"
                    enabled={!cargando}
                  >
                    <Picker.Item label="Llavero" value="Llavero" />
                    <Picker.Item label="Cuadro" value="Cuadro" />
                  </Picker>
                </View>
              </View>
              <TouchableOpacity 
                style={[styles.agregarBtn, cargando && styles.btnDeshabilitado]} 
                onPress={agregarProducto}
                disabled={cargando}
              >
                {cargando ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.agregarBtnText}>Agregar</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.02,
    paddingBottom: height * 0.025,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  backButton: { padding: 8 },
  backButtonText: {
    fontSize: Math.max(20, width * 0.06),
    color: '#8B5CF6',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: Math.max(22, width * 0.055),
    fontWeight: 'bold',
    color: '#1F2937',
  },
  placeholder: { width: 40 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: width * 0.05,
    backgroundColor: '#EDE9FE',
    borderRadius: 20,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#1F2937',
  },
  nuevoBtn: {
    backgroundColor: '#8B5CF6',
    marginHorizontal: width * 0.2,
    marginBottom: 10,
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  nuevoBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
  },
  listContainer: {
    paddingHorizontal: width * 0.05,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 8,
    flex: 1,
    alignItems: 'center',
    padding: 12,
    elevation: 2,
    maxWidth: (width - width * 0.15) / 2,
  },
  cardImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F3F4F6',
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  cardText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(60, 40, 120, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: width * 0.85,
    borderRadius: 30,
    backgroundColor: '#fff',
    padding: 24,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    alignItems: 'center',
    position: 'relative',
  },
  modalBack: {
    position: 'absolute',
    left: 16,
    top: 16,
    zIndex: 2,
  },
  modalContent: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 12,
  },
  imagePicker: {
    width: 110,
    height: 110,
    borderRadius: 16,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#C4B5FD',
  },
  imagePickerText: {
    color: '#8B5CF6',
    fontWeight: 'bold',
    fontSize: 16,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  input: {
    backgroundColor: '#EDE9FE',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    width: '100%',
    fontSize: 16,
    minHeight: 40,
    maxHeight: 60,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: width * 0.7,
    marginBottom: 12,
  },
  categoriaLabel: {
    fontSize: 16,
    color: '#8B5CF6',
    fontWeight: 'bold',
    marginRight: 8,
  },
  descripcionContainer: {
    width: width * 0.7,
    marginBottom: 12,
  },
  descripcionInput: {
    backgroundColor: '#EDE9FE',
    borderRadius: 12,
    padding: 10,
    fontSize: 16,
    minHeight: 70,
    maxHeight: 120,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE9FE',
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 40,
    width: '100%',
  },
  precioSimbolo: {
    fontSize: 18,
    color: '#8B5CF6',
    marginRight: 4,
    fontWeight: 'bold',
  },
  inputPrecio: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: 'transparent',
    padding: 0,
    height: 40,
  },
  pickerContainer: {
    flex: 1,
    backgroundColor: '#EDE9FE',
    borderRadius: 12,
    overflow: 'hidden',
    marginLeft: 8,
    justifyContent: 'center',
    height: 50,
  },
  picker: {
    height: 50,
    color: '#1F2937',
    fontSize: 18,
    width: '100%',
  },
  agregarBtn: {
    backgroundColor: '#8B5CF6',
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
    width: width * 0.7,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  agregarBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
  },
  errorText: {
    color: '#D97706',
    fontSize: 13,
    marginTop: 2,
    marginLeft: 4,
    fontWeight: 'bold',
  },
  cargandoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 1000,
  },
  btnDeshabilitado: {
    opacity: 0.6,
  },
});

export default Productos;