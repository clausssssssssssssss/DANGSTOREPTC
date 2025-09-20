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
  ActivityIndicator,
} from 'react-native';

import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { AuthContext } from '../context/AuthContext';
import { useProducts } from '../hooks/useProducts';

const { width, height } = Dimensions.get('window');
const API_URL = 'http://192.168.0.9:4000/api/products'; // URL consistente con el backend

const Productos = ({ navigation }) => {
  const { products: productosHook, loading: loadingHook, lastStockUpdate, refresh: refreshProducts } = useProducts();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState(['Llavero', 'Cuadro']); // Categorías por defecto
  const [busqueda, setBusqueda] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalEditarVisible, setModalEditarVisible] = useState(false);
  const [modalCategoriaVisible, setModalCategoriaVisible] = useState(false);
  const [modalGestionarCategoriasVisible, setModalGestionarCategoriasVisible] = useState(false);
  const [modalEditarCategoriaVisible, setModalEditarCategoriaVisible] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState(null);
  const [nuevoNombreCategoria, setNuevoNombreCategoria] = useState('');
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [customAlert, setCustomAlert] = useState({
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
    // obtenerProductos(); // Comentado temporalmente - usando hook
    obtenerCategorias();
  }, []);

  // Sincronizar con el hook de productos
  useEffect(() => {
    setProductos(productosHook || []);
  }, [productosHook]);

  const showCustomAlert = (title, message, type = 'info', options = {}) => {
    setCustomAlert({
      visible: true,
      title,
      message,
      type,
      onConfirm: options.onConfirm || null,
      onCancel: options.onCancel || null,
      confirmText: options.confirmText || 'OK',
      cancelText: options.cancelText || 'Cancelar',
      showCancel: options.showCancel || false,
    });
  };

  const hideCustomAlert = () => {
    setCustomAlert(prev => ({ ...prev, visible: false }));
  };

  const obtenerProductos = async () => {
    try {
      setCargando(true);
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      setProductos(data);
    } catch (error) {
      console.log('Error obteniendo productos:', error);
      showCustomAlert('Error', 'No se pudieron cargar los productos', 'error');
    } finally {
      setCargando(false);
    }
  };

  const obtenerCategorias = async () => {
    try {
      const response = await fetch('http://192.168.0.9:4000/api/categories');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      // Guardar las categorías completas para poder acceder al _id
      setCategorias(data);
    } catch (error) {
      console.log('Error obteniendo categorías:', error);
      // Solo mostrar categorías por defecto si es un error de conexión real
      if (error.message.includes('fetch') || error.message.includes('Network') || error.message.includes('Failed to fetch')) {
        setCategorias(['Llavero', 'Cuadro']);
      } else {
        // Si es otro tipo de error (como 404, 500), mostrar array vacío
        setCategorias([]);
      }
    }
  };

  const agregarProducto = async () => {
    // Validaciones
    if (!nuevoProducto.nombre || !nuevoProducto.descripcion || !nuevoProducto.precio || !nuevoProducto.disponibles) {
      showCustomAlert('Error', 'Por favor completa todos los campos obligatorios (nombre, descripción, precio y disponibles)', 'error');
      return;
    }

    if (!nuevoProducto.imagen) {
      showCustomAlert('Error', 'Por favor selecciona una imagen', 'error');
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
      
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (!response.ok) {
        // Intentar obtener el mensaje de error del servidor
        let errorMessage = `HTTP ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          // Si no se puede parsear el JSON, usar el mensaje por defecto
        }
        throw new Error(errorMessage);
      }

      if (response.status === 201) {
        showCustomAlert('Éxito', 'Producto agregado correctamente', 'success');
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
      const errorMessage = error.message || 'No se pudo agregar el producto';
      showCustomAlert('Error', `Error al guardar el producto: ${errorMessage}`, 'error');
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
      showCustomAlert('Error', 'No se pudo seleccionar la imagen', 'error');
    }
  };

  const seleccionarImagenEditar = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      setProductoSeleccionado({ ...productoSeleccionado, imagen: result.assets[0].uri });
    }
  };

  const eliminarProducto = async (productId) => {
    showCustomAlert(
      'Confirmar eliminación',
      '¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.',
      'warning',
      {
        showCancel: true,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        onConfirm: async () => {
          try {
            const response = await fetch(`${API_URL}/${productId}`, {
              method: 'DELETE',
            });
            
            if (!response.ok) {
              throw new Error(`HTTP ${response.status} ${response.statusText}`);
            }
            
            obtenerProductos(); // Recargar la lista
            showCustomAlert('Éxito', 'Producto eliminado correctamente', 'success');
          } catch (error) {
            console.log('Error eliminando producto:', error);
            showCustomAlert('Error', 'No se pudo eliminar el producto', 'error');
          }
        },
        onCancel: () => hideCustomAlert(),
      }
    );
  };

  const editarProducto = async () => {
    try {
      const formData = new FormData();
      formData.append('nombre', productoSeleccionado.nombre);
      formData.append('descripcion', productoSeleccionado.descripcion);
      formData.append('precio', productoSeleccionado.precio);
      formData.append('disponibles', productoSeleccionado.disponibles);
      formData.append('categoria', productoSeleccionado.categoria);
      
      // Solo agregar imagen si se seleccionó una nueva
      if (productoSeleccionado.imagen && typeof productoSeleccionado.imagen === 'string' && productoSeleccionado.imagen.startsWith('file://')) {
        formData.append('imagen', {
          uri: productoSeleccionado.imagen,
          name: 'producto.jpg',
          type: 'image/jpeg',
        });
      }
      
      const response = await fetch(`${API_URL}/${productoSeleccionado._id}`, {
        method: 'PUT',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }
      
      setModalEditarVisible(false);
      setProductoSeleccionado(null);
      obtenerProductos();
    } catch (error) {
      console.log('Error editando producto:', error);
      const errorMessage = error.message || 'No se pudo editar el producto';
      showCustomAlert('Error', `Error al editar el producto: ${errorMessage}`, 'error');
    }
  };

  const abrirModalEditar = (producto) => {
    setProductoSeleccionado({
      _id: producto._id,
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      precio: producto.precio.toString(),
      disponibles: producto.disponibles.toString(),
      categoria: producto.categoria,
      imagen: null, // No cargar imagen existente, solo permitir nueva
    });
    setModalEditarVisible(true);
  };

  const crearCategoria = async () => {
    if (!nuevaCategoria.trim()) {
      showCustomAlert('Error', 'Por favor ingresa un nombre para la categoría', 'error');
      return;
    }

    try {
      setCargando(true);
      const response = await fetch('http://192.168.0.9:4000/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: nuevaCategoria.trim()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status} ${response.statusText}`);
      }

      showCustomAlert('Éxito', 'Categoría creada correctamente', 'success');
      setModalCategoriaVisible(false);
      setNuevaCategoria('');
      // Recargar las categorías para incluir la nueva
      obtenerCategorias();
    } catch (error) {
      console.log('Error creando categoría:', error);
      const errorMessage = error.message || 'No se pudo crear la categoría';
      showCustomAlert('Error', errorMessage, 'error');
    } finally {
      setCargando(false);
    }
  };

  const eliminarCategoria = async (categoriaId, categoriaNombre) => {
    const confirmMessage = `¿Estás seguro de que quieres eliminar la categoría "${categoriaNombre}"?\n\n⚠️ ATENCIÓN: También se eliminarán TODOS los productos que pertenecen a esta categoría.\n\nEsta acción no se puede deshacer.`;

    showCustomAlert(
      'Confirmar eliminación',
      confirmMessage,
      'warning',
      {
        showCancel: true,
        confirmText: 'Sí, eliminar todo',
        cancelText: 'Cancelar',
        onConfirm: async () => {
          try {
            setCargando(true);

            // Eliminar categoría del backend (también eliminará productos asociados)
            const response = await fetch(`http://192.168.0.9:4000/api/categories/${categoriaId}`, {
              method: 'DELETE',
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || `HTTP ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            
            // Mostrar mensaje con información de productos eliminados
            const message = result.deletedProducts > 0 
              ? `Categoría "${result.categoryName}" eliminada correctamente.\n\n${result.deletedProducts} productos también fueron eliminados.`
              : `Categoría "${result.categoryName}" eliminada correctamente.`;
            
            showCustomAlert('Éxito', message, 'success');
            
            // Recargar las categorías para actualizar la lista
            obtenerCategorias();
            // También refrescar productos para mostrar cambios
            refreshProducts();
          } catch (error) {
            console.log('Error eliminando categoría:', error);
            const errorMessage = error.message || 'No se pudo eliminar la categoría';
            showCustomAlert('Error', errorMessage, 'error');
          } finally {
            setCargando(false);
          }
        },
        onCancel: () => hideCustomAlert(),
      }
    );
  };

  const editarCategoria = (categoria) => {
    // Permitir editar todas las categorías
    setCategoriaEditando(categoria);
    setNuevoNombreCategoria(categoria.name || categoria);
    setModalEditarCategoriaVisible(true);
  };

  const actualizarCategoria = async () => {
    if (!nuevoNombreCategoria.trim()) {
      showCustomAlert('Error', 'Por favor ingresa un nombre para la categoría', 'error');
      return;
    }

    try {
      setCargando(true);

      // Todas las categorías ahora vienen del backend, actualizar vía API
      const response = await fetch(`http://192.168.0.9:4000/api/categories/${categoriaEditando._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: nuevoNombreCategoria.trim()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status} ${response.statusText}`);
      }

      showCustomAlert('Éxito', 'Categoría actualizada correctamente', 'success');
      setModalEditarCategoriaVisible(false);
      setCategoriaEditando(null);
      setNuevoNombreCategoria('');
      // Recargar las categorías
      obtenerCategorias();
    } catch (error) {
      console.log('Error actualizando categoría:', error);
      const errorMessage = error.message || 'No se pudo actualizar la categoría';
      showCustomAlert('Error', errorMessage, 'error');
    } finally {
      setCargando(false);
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

  const handleDisponiblesChangeEditar = (text) => {
    if (/^\d*$/.test(text)) {
      setProductoSeleccionado({ ...productoSeleccionado, disponibles: text });
      setDisponiblesError('');
    } else {
      setDisponiblesError('Solo se pueden usar números');
      setTimeout(() => setDisponiblesError(''), 1500);
    }
  };

  const handlePrecioChangeEditar = (text) => {
    if (/^\d*\.?\d*$/.test(text)) {
      setProductoSeleccionado({ ...productoSeleccionado, precio: text });
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
      <Image 
        source={{ uri: item.imagen || 'https://via.placeholder.com/150' }} 
        style={styles.cardImage} 
      />
      <Text style={styles.cardTitle}>{item.nombre}</Text>
      <Text style={styles.cardText}>Precio: ${item.precio}</Text>
      <Text style={[styles.cardText, item.stock <= 5 && styles.lowStockText]}>
        Disponibles: {item.disponibles || item.stock || 0}
        {(item.stock <= 5 || item.disponibles <= 5) && ' ⚠️'}
      </Text>
      
      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => abrirModalEditar(item)}
        >
          <Text style={styles.editButtonText}>✎</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => eliminarProducto(item._id)}
        >
          <Text style={styles.deleteButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
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
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Tus productos</Text>
          {lastStockUpdate && (
            <Text style={styles.stockUpdateIndicator}>
              📦 {new Date(lastStockUpdate).toLocaleTimeString()}
            </Text>
          )}
        </View>
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

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.nuevoBtn}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.nuevoBtnText}>+ Nuevo producto</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.categoriaBtn}
          onPress={() => setModalCategoriaVisible(true)}
        >
          <Text style={styles.categoriaBtnText}>+ Nueva categoría</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.managementButtonsContainer}>
        <TouchableOpacity
          style={styles.managementBtn}
          onPress={() => setModalGestionarCategoriasVisible(true)}
        >
          <Text style={styles.managementBtnText}>⚙ Gestionar Categorías</Text>
        </TouchableOpacity>
      </View>

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
        <View style={[styles.modalOverlay, { zIndex: 200 }]}>
          <View style={[styles.modalBox, { zIndex: 201 }]}>
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
                    {categorias.map((categoria, index) => (
                      <Picker.Item key={index} label={categoria.name || categoria} value={categoria.name || categoria} />
                    ))}
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

      {/* Modal para editar producto */}
      <Modal
        visible={modalEditarVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setModalEditarVisible(false)}
      >
        <View style={[styles.modalOverlay, { zIndex: 200 }]}>
          <View style={[styles.modalBox, { zIndex: 201 }]}>
            <TouchableOpacity
              style={styles.modalBack}
              onPress={() => setModalEditarVisible(false)}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <ScrollView contentContainerStyle={styles.modalContent}>
              <Text style={styles.modalTitle}>Editar Producto</Text>
              
              <TouchableOpacity
                style={styles.imagePicker}
                onPress={seleccionarImagenEditar}
              >
                {productoSeleccionado?.imagen ? (
                  <Image
                    source={{ uri: productoSeleccionado.imagen }}
                    style={styles.previewImage}
                  />
                ) : (
                  <Text style={styles.imagePickerText}>Cambiar imagen</Text>
                )}
              </TouchableOpacity>
              
              <TextInput
                style={styles.input}
                placeholder="Nombre"
                value={productoSeleccionado?.nombre || ''}
                onChangeText={text => setProductoSeleccionado({ ...productoSeleccionado, nombre: text })}
              />
              
              <View style={styles.descripcionContainer}>
                <TextInput
                  style={styles.descripcionInput}
                  placeholder="Descripción"
                  value={productoSeleccionado?.descripcion || ''}
                  onChangeText={text => setProductoSeleccionado({ ...productoSeleccionado, descripcion: text })}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
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
                      value={productoSeleccionado?.precio || ''}
                      onChangeText={handlePrecioChangeEditar}
                      maxLength={8}
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
                    value={productoSeleccionado?.disponibles || ''}
                    onChangeText={handleDisponiblesChangeEditar}
                    maxLength={5}
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
                    selectedValue={productoSeleccionado?.categoria || 'Llavero'}
                    style={styles.picker}
                    onValueChange={itemValue =>
                      setProductoSeleccionado({ ...productoSeleccionado, categoria: itemValue })
                    }
                    dropdownIconColor="#8B5CF6"
                    mode="dropdown"
                  >
                    {categorias.map((categoria, index) => (
                      <Picker.Item key={index} label={categoria.name || categoria} value={categoria.name || categoria} />
                    ))}
                  </Picker>
                </View>
              </View>
              
              <TouchableOpacity style={styles.agregarBtn} onPress={editarProducto}>
                <Text style={styles.agregarBtnText}>Guardar Cambios</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal para nueva categoría */}
      <Modal
        visible={modalCategoriaVisible}
        animationType="fade"
        transparent
        onRequestClose={() => !cargando && setModalCategoriaVisible(false)}
      >
        <View style={[styles.modalOverlay, { zIndex: 200 }]}>
          <View style={[styles.modalBox, { zIndex: 201 }]}>
            <TouchableOpacity
              style={styles.modalBack}
              onPress={() => !cargando && setModalCategoriaVisible(false)}
              disabled={cargando}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Nueva Categoría</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Nombre de la categoría"
                value={nuevaCategoria}
                onChangeText={setNuevaCategoria}
                editable={!cargando}
                maxLength={50}
              />
              
              <TouchableOpacity 
                style={[styles.agregarBtn, cargando && styles.btnDeshabilitado]} 
                onPress={crearCategoria}
                disabled={cargando}
              >
                {cargando ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.agregarBtnText}>Crear Categoría</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para gestionar categorías */}
      <Modal
        visible={modalGestionarCategoriasVisible}
        animationType="fade"
        transparent
        onRequestClose={() => !cargando && setModalGestionarCategoriasVisible(false)}
      >
        <View style={[styles.modalOverlay, { zIndex: 50 }]}>
          <View style={[styles.categoriasModalBox, { zIndex: 51 }]}>
            <View style={styles.categoriasModalHeader}>
              <TouchableOpacity
                style={styles.categoriasModalBack}
                onPress={() => !cargando && setModalGestionarCategoriasVisible(false)}
                disabled={cargando}
              >
                <Text style={styles.categoriasModalBackText}>←</Text>
              </TouchableOpacity>
              <Text style={styles.categoriasModalTitle}>Gestionar Categorías</Text>
              <View style={styles.categoriasModalPlaceholder} />
            </View>

            <View style={styles.categoriasModalContent}>
              <Text style={styles.categoriasModalSubtitle}>Administra las categorías de productos</Text>

              <ScrollView style={styles.categoriasList} showsVerticalScrollIndicator={false}>
                {categorias.map((categoria, index) => (
                  <View key={index} style={styles.categoriaItem}>
                    <View style={styles.categoriaInfo}>
                      <Text style={styles.categoriaItemText}>{categoria.name || categoria}</Text>
                      <Text style={styles.categoriaStatus}>
                        {categoria._id ? 'Creada' : 'Por defecto'}
                      </Text>
                    </View>
                    <View style={styles.categoriaActions}>
                      <TouchableOpacity
                        style={styles.editarCategoriaBtn}
                        onPress={() => editarCategoria(categoria)}
                        disabled={cargando}
                      >
                        <Text style={styles.editarCategoriaBtnText}>✏</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.eliminarCategoriaBtn}
                        onPress={() => eliminarCategoria(categoria._id, categoria.name || categoria)}
                        disabled={cargando}
                      >
                        <Text style={styles.eliminarCategoriaBtnText}>✖</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* Alerta integrada en el modal */}
          {customAlert.visible && (
            <View style={[styles.alertOverlay, { zIndex: 1000 }]}>
              <View style={[styles.alertContainer, { zIndex: 1001 }]}>
                <View style={[styles.alertIcon, styles[`alertIcon${customAlert.type.charAt(0).toUpperCase() + customAlert.type.slice(1)}`]]}>
                  <Text style={[styles.alertIconText, styles[`alertIconText${customAlert.type.charAt(0).toUpperCase() + customAlert.type.slice(1)}`]]}>
                    {customAlert.type === 'success' ? '✓' :
                     customAlert.type === 'error' ? '✕' :
                     customAlert.type === 'warning' ? '⚠' : 'ℹ'}
                  </Text>
                </View>

                <Text style={styles.alertTitle}>{customAlert.title}</Text>
                <Text style={styles.alertMessage}>{customAlert.message}</Text>

                <View style={styles.alertButtons}>
                  {customAlert.showCancel && (
                    <TouchableOpacity
                      style={[styles.alertButton, styles.alertButtonCancel]}
                      onPress={customAlert.onCancel || hideCustomAlert}
                    >
                      <Text style={styles.alertButtonCancelText}>{customAlert.cancelText}</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[styles.alertButton, styles[`alertButton${customAlert.type.charAt(0).toUpperCase() + customAlert.type.slice(1)}`]]}
                    onPress={customAlert.onConfirm || hideCustomAlert}
                  >
                    <Text style={styles[`alertButton${customAlert.type.charAt(0).toUpperCase() + customAlert.type.slice(1)}Text`]}>
                      {customAlert.confirmText}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      </Modal>

      {/* Modal para editar categoría */}
      <Modal
        visible={modalEditarCategoriaVisible}
        animationType="fade"
        transparent
        onRequestClose={() => !cargando && setModalEditarCategoriaVisible(false)}
      >
        <View style={[styles.modalOverlay, { zIndex: 200 }]}>
          <View style={[styles.modalBox, { zIndex: 201 }]}>
            <TouchableOpacity
              style={styles.modalBack}
              onPress={() => !cargando && setModalEditarCategoriaVisible(false)}
              disabled={cargando}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Editar Categoría</Text>

              <TextInput
                style={styles.input}
                placeholder="Nombre de la categoría"
                value={nuevoNombreCategoria}
                onChangeText={setNuevoNombreCategoria}
                editable={!cargando}
                maxLength={50}
              />

              <TouchableOpacity
                style={[styles.agregarBtn, cargando && styles.btnDeshabilitado]}
                onPress={actualizarCategoria}
                disabled={cargando}
              >
                {cargando ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.agregarBtnText}>Actualizar Categoría</Text>
                )}
              </TouchableOpacity>
            </View>
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
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Math.max(22, width * 0.055),
    fontWeight: 'bold',
    color: '#1F2937',
  },
  stockUpdateIndicator: {
    fontSize: 10,
    color: '#8B5CF6',
    marginTop: 2,
    fontWeight: '500',
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
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: width * 0.05,
    marginBottom: 15,
    gap: 12,
  },
  managementButtonsContainer: {
    marginHorizontal: width * 0.05,
    marginBottom: 15,
  },
  nuevoBtn: {
    backgroundColor: '#8B5CF6',
    flex: 1,
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 2,
    borderColor: '#7C3AED',
  },
  nuevoBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  categoriaBtn: {
    backgroundColor: '#10B981',
    flex: 1,
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 2,
    borderColor: '#059669',
  },
  categoriaBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  managementBtn: {
    backgroundColor: '#6366F1',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 25,
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 2,
    borderColor: '#4F46E5',
    width: '100%',
  },
  managementBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
    width: '100%',
  },
  editButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  editButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  deleteButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  // Estilos del Alert personalizado
  alertOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000,
  },
  alertContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    maxWidth: width * 0.85,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 30,
    zIndex: 10001,
  },
  alertIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  alertIconSuccess: {
    backgroundColor: '#D1FAE5',
  },
  alertIconError: {
    backgroundColor: '#FEE2E2',
  },
  alertIconWarning: {
    backgroundColor: '#EDE9FE',
  },
  alertIconInfo: {
    backgroundColor: '#DBEAFE',
  },
  alertIconText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  alertIconTextSuccess: {
    color: '#10B981',
  },
  alertIconTextError: {
    color: '#EF4444',
  },
  alertIconTextWarning: {
    color: '#8B5CF6',
  },
  alertIconTextInfo: {
    color: '#3B82F6',
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  alertMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  alertButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  alertButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  alertButtonSuccess: {
    backgroundColor: '#10B981',
  },
  alertButtonError: {
    backgroundColor: '#EF4444',
  },
  alertButtonWarning: {
    backgroundColor: '#8B5CF6',
  },
  alertButtonInfo: {
    backgroundColor: '#3B82F6',
  },
  alertButtonCancel: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  alertButtonSuccessText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  alertButtonErrorText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  alertButtonWarningText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  alertButtonInfoText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  alertButtonCancelText: {
    color: '#374151',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Estilos para gestión de categorías
  categoriasModalBox: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 60,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
    flex: 1,
    maxHeight: '80%',
  },
  categoriasModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoriasModalBack: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoriasModalBackText: {
    fontSize: 20,
    color: '#374151',
    fontWeight: 'bold',
  },
  categoriasModalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
    fontFamily: 'System',
    letterSpacing: 0.5,
  },
  categoriasModalPlaceholder: {
    width: 40,
  },
  categoriasModalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  categoriasModalSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
    fontWeight: '500',
    fontFamily: 'System',
    letterSpacing: 0.2,
  },
  categoriasList: {
    flex: 1,
    width: '100%',
  },
  categoriaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  categoriaInfo: {
    flex: 1,
    marginRight: 12,
  },
  categoriaItemText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: 0.3,
    marginBottom: 3,
    fontFamily: 'System',
  },
  categoriaStatus: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontFamily: 'System',
  },
  categoriaActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editarCategoriaBtn: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editarCategoriaBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
  eliminarCategoriaBtn: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eliminarCategoriaBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
  btnTextDeshabilitado: {
    color: '#9CA3AF',
  },
  lowStockText: {
    color: '#DC2626',
    fontWeight: 'bold',
  },
});

export default Productos;