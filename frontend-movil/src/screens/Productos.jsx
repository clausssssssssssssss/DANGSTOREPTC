import React, { useEffect, useState, useContext } from 'react';
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
  ActivityIndicator,
} from 'react-native';

import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { AuthContext } from '../context/AuthContext';
import { useProducts } from '../hooks/useProducts';
import { ProductosStyles } from '../components/styles/ProductosStyles';

const API_URL = 'http://10.10.1.8:4000/api/products'; // URL consistente con el backend

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

  // Debug: Log cuando cambie el estado de customAlert
  useEffect(() => {
    console.log('customAlert state cambió:', customAlert);
  }, [customAlert]);
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
    console.log('showCustomAlert llamado con:', { title, message, type, options });
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
    console.log('customAlert state actualizado');
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
        refreshProducts();
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
    console.log('Botón eliminar presionado para producto ID:', productId);
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
            console.log('Intentando eliminar producto con ID:', productId);
            console.log('URL de eliminación:', `${API_URL}/${productId}`);
            
            const response = await fetch(`${API_URL}/${productId}`, {
              method: 'DELETE',
            });
            
            console.log('Respuesta del servidor:', response.status, response.statusText);
            
            if (!response.ok) {
              const errorData = await response.json().catch(() => null);
              console.log('Error data:', errorData);
              throw new Error(`HTTP ${response.status} ${response.statusText}`);
            }
            
            const result = await response.json();
            console.log('Producto eliminado exitosamente:', result);
            
            // Recargar la lista usando el hook
            refreshProducts();
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
      refreshProducts();
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
    <View style={ProductosStyles.card}>
      <Image 
        source={{ uri: item.imagen || 'https://via.placeholder.com/150' }} 
        style={ProductosStyles.cardImage} 
      />
      <Text style={ProductosStyles.cardTitle}>{item.nombre}</Text>
      <Text style={ProductosStyles.cardText}>Precio: ${item.precio}</Text>
      <Text style={[ProductosStyles.cardText, item.stock <= 5 && ProductosStyles.lowStockText]}>
        Disponibles: {item.disponibles || item.stock || 0}
        {(item.stock <= 5 || item.disponibles <= 5) && ' ⚠️'}
      </Text>
      
      <View style={ProductosStyles.cardActions}>
        <TouchableOpacity 
          style={ProductosStyles.editButton}
          onPress={() => abrirModalEditar(item)}
        >
          <Text style={ProductosStyles.editButtonText}>✎</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={ProductosStyles.deleteButton}
          onPress={() => {
            console.log('TouchableOpacity delete presionado');
            eliminarProducto(item._id);
          }}
        >
          <Text style={ProductosStyles.deleteButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={ProductosStyles.container}>
      <View style={ProductosStyles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={ProductosStyles.backButton}
        >
          <Text style={ProductosStyles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={ProductosStyles.headerTitleContainer}>
          <Text style={ProductosStyles.headerTitle}>Tus productos</Text>
          {lastStockUpdate && (
            <Text style={ProductosStyles.stockUpdateIndicator}>
              📦 {new Date(lastStockUpdate).toLocaleTimeString()}
            </Text>
          )}
        </View>
        <View style={ProductosStyles.placeholder} />
      </View>

      <View style={ProductosStyles.searchContainer}>
        <TextInput
          style={ProductosStyles.searchInput}
          placeholder="Buscar producto"
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      <View style={ProductosStyles.buttonsContainer}>
        <TouchableOpacity
          style={ProductosStyles.nuevoBtn}
          onPress={() => setModalVisible(true)}
        >
          <Text style={ProductosStyles.nuevoBtnText}>+ Nuevo producto</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={ProductosStyles.categoriaBtn}
          onPress={() => setModalCategoriaVisible(true)}
        >
          <Text style={ProductosStyles.categoriaBtnText}>+ Nueva categoría</Text>
        </TouchableOpacity>
      </View>
      
      <View style={ProductosStyles.managementButtonsContainer}>
        <TouchableOpacity
          style={ProductosStyles.managementBtn}
          onPress={() => setModalGestionarCategoriasVisible(true)}
        >
          <Text style={ProductosStyles.managementBtnText}>⚙ Gestionar Categorías</Text>
        </TouchableOpacity>
      </View>

      {cargando && (
        <View style={ProductosStyles.cargandoContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
      )}

      <FlatList
        data={productosFiltrados}
        keyExtractor={item => item._id}
        renderItem={renderProducto}
        numColumns={2}
        contentContainerStyle={ProductosStyles.listContainer}
      />

      {/* Modal para agregar producto */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => !cargando && setModalVisible(false)}
      >
        <View style={[ProductosStyles.modalOverlay, { zIndex: 200 }]}>
          <View style={[ProductosStyles.modalBox, { zIndex: 201 }]}>
            <TouchableOpacity
              style={ProductosStyles.modalBack}
              onPress={() => !cargando && setModalVisible(false)}
              disabled={cargando}
            >
              <Text style={ProductosStyles.backButtonText}>←</Text>
            </TouchableOpacity>
            <ScrollView contentContainerStyle={ProductosStyles.modalContent}>
              <TouchableOpacity
                style={ProductosStyles.imagePicker}
                onPress={seleccionarImagen}
                disabled={cargando}
              >
                {nuevoProducto.imagen ? (
                  <Image
                    source={{ uri: nuevoProducto.imagen }}
                    style={ProductosStyles.previewImage}
                  />
                ) : (
                  <Text style={ProductosStyles.imagePickerText}>Subir imagen</Text>
                )}
              </TouchableOpacity>
              <TextInput
                style={ProductosStyles.input}
                placeholder="Nombre"
                value={nuevoProducto.nombre}
                onChangeText={text => setNuevoProducto({ ...nuevoProducto, nombre: text })}
                editable={!cargando}
              />
              <View style={ProductosStyles.descripcionContainer}>
                <TextInput
                  style={ProductosStyles.descripcionInput}
                  placeholder="Descripción"
                  value={nuevoProducto.descripcion}
                  onChangeText={text => setNuevoProducto({ ...nuevoProducto, descripcion: text })}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  editable={!cargando}
                />
              </View>
              <View style={ProductosStyles.row}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <View style={ProductosStyles.inputContainer}>
                    <Text style={ProductosStyles.precioSimbolo}>$</Text>
                    <TextInput
                      style={ProductosStyles.inputPrecio}
                      placeholder="Precio"
                      keyboardType="numeric"
                      value={nuevoProducto.precio}
                      onChangeText={handlePrecioChange}
                      maxLength={8}
                      editable={!cargando}
                    />
                  </View>
                  {precioError ? (
                    <Text style={ProductosStyles.errorText}>{precioError}</Text>
                  ) : null}
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <TextInput
                    style={ProductosStyles.input}
                    placeholder="Disponibles"
                    keyboardType="numeric"
                    value={nuevoProducto.disponibles}
                    onChangeText={handleDisponiblesChange}
                    maxLength={5}
                    editable={!cargando}
                  />
                  {disponiblesError ? (
                    <Text style={ProductosStyles.errorText}>{disponiblesError}</Text>
                  ) : null}
                </View>
              </View>
              <View style={ProductosStyles.row}>
                <Text style={ProductosStyles.categoriaLabel}>Categoría:</Text>
                <View style={ProductosStyles.pickerContainer}>
                  <Picker
                    selectedValue={nuevoProducto.categoria}
                    style={ProductosStyles.picker}
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
                style={[ProductosStyles.agregarBtn, cargando && ProductosStyles.btnDeshabilitado]} 
                onPress={agregarProducto}
                disabled={cargando}
              >
                {cargando ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={ProductosStyles.agregarBtnText}>Agregar</Text>
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
        <View style={[ProductosStyles.modalOverlay, { zIndex: 200 }]}>
          <View style={[ProductosStyles.modalBox, { zIndex: 201 }]}>
            <TouchableOpacity
              style={ProductosStyles.modalBack}
              onPress={() => setModalEditarVisible(false)}
            >
              <Text style={ProductosStyles.backButtonText}>←</Text>
            </TouchableOpacity>
            <ScrollView contentContainerStyle={ProductosStyles.modalContent}>
              <Text style={ProductosStyles.modalTitle}>Editar Producto</Text>
              
              <TouchableOpacity
                style={ProductosStyles.imagePicker}
                onPress={seleccionarImagenEditar}
              >
                {productoSeleccionado?.imagen ? (
                  <Image
                    source={{ uri: productoSeleccionado.imagen }}
                    style={ProductosStyles.previewImage}
                  />
                ) : (
                  <Text style={ProductosStyles.imagePickerText}>Cambiar imagen</Text>
                )}
              </TouchableOpacity>
              
              <TextInput
                style={ProductosStyles.input}
                placeholder="Nombre"
                value={productoSeleccionado?.nombre || ''}
                onChangeText={text => setProductoSeleccionado({ ...productoSeleccionado, nombre: text })}
              />
              
              <View style={ProductosStyles.descripcionContainer}>
                <TextInput
                  style={ProductosStyles.descripcionInput}
                  placeholder="Descripción"
                  value={productoSeleccionado?.descripcion || ''}
                  onChangeText={text => setProductoSeleccionado({ ...productoSeleccionado, descripcion: text })}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
              
              <View style={ProductosStyles.row}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <View style={ProductosStyles.inputContainer}>
                    <Text style={ProductosStyles.precioSimbolo}>$</Text>
                    <TextInput
                      style={ProductosStyles.inputPrecio}
                      placeholder="Precio"
                      keyboardType="numeric"
                      value={productoSeleccionado?.precio || ''}
                      onChangeText={handlePrecioChangeEditar}
                      maxLength={8}
                    />
                  </View>
                  {precioError ? (
                    <Text style={ProductosStyles.errorText}>{precioError}</Text>
                  ) : null}
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <TextInput
                    style={ProductosStyles.input}
                    placeholder="Disponibles"
                    keyboardType="numeric"
                    value={productoSeleccionado?.disponibles || ''}
                    onChangeText={handleDisponiblesChangeEditar}
                    maxLength={5}
                  />
                  {disponiblesError ? (
                    <Text style={ProductosStyles.errorText}>{disponiblesError}</Text>
                  ) : null}
                </View>
              </View>
              
              <View style={ProductosStyles.row}>
                <Text style={ProductosStyles.categoriaLabel}>Categoría:</Text>
                <View style={ProductosStyles.pickerContainer}>
                  <Picker
                    selectedValue={productoSeleccionado?.categoria || 'Llavero'}
                    style={ProductosStyles.picker}
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
              
              <TouchableOpacity style={ProductosStyles.agregarBtn} onPress={editarProducto}>
                <Text style={ProductosStyles.agregarBtnText}>Guardar Cambios</Text>
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
        <View style={[ProductosStyles.modalOverlay, { zIndex: 200 }]}>
          <View style={[ProductosStyles.modalBox, { zIndex: 201 }]}>
            <TouchableOpacity
              style={ProductosStyles.modalBack}
              onPress={() => !cargando && setModalCategoriaVisible(false)}
              disabled={cargando}
            >
              <Text style={ProductosStyles.backButtonText}>←</Text>
            </TouchableOpacity>
            <View style={ProductosStyles.modalContent}>
              <Text style={ProductosStyles.modalTitle}>Nueva Categoría</Text>
              
              <TextInput
                style={ProductosStyles.input}
                placeholder="Nombre de la categoría"
                value={nuevaCategoria}
                onChangeText={setNuevaCategoria}
                editable={!cargando}
                maxLength={50}
              />
              
              <TouchableOpacity 
                style={[ProductosStyles.agregarBtn, cargando && ProductosStyles.btnDeshabilitado]} 
                onPress={crearCategoria}
                disabled={cargando}
              >
                {cargando ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={ProductosStyles.agregarBtnText}>Crear Categoría</Text>
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
        <View style={[ProductosStyles.modalOverlay, { zIndex: 50 }]}>
          <View style={[ProductosStyles.categoriasModalBox, { zIndex: 51 }]}>
            <View style={ProductosStyles.categoriasModalHeader}>
              <TouchableOpacity
                style={ProductosStyles.categoriasModalBack}
                onPress={() => !cargando && setModalGestionarCategoriasVisible(false)}
                disabled={cargando}
              >
                <Text style={ProductosStyles.categoriasModalBackText}>←</Text>
              </TouchableOpacity>
              <Text style={ProductosStyles.categoriasModalTitle}>Gestionar Categorías</Text>
              <View style={ProductosStyles.categoriasModalPlaceholder} />
            </View>

            <View style={ProductosStyles.categoriasModalContent}>
              <Text style={ProductosStyles.categoriasModalSubtitle}>Administra las categorías de productos</Text>

              <ScrollView style={ProductosStyles.categoriasList} showsVerticalScrollIndicator={false}>
                {categorias.map((categoria, index) => (
                  <View key={index} style={ProductosStyles.categoriaItem}>
                    <View style={ProductosStyles.categoriaInfo}>
                      <Text style={ProductosStyles.categoriaItemText}>{categoria.name || categoria}</Text>
                      <Text style={ProductosStyles.categoriaStatus}>
                        {categoria._id ? 'Creada' : 'Por defecto'}
                      </Text>
                    </View>
                    <View style={ProductosStyles.categoriaActions}>
                      <TouchableOpacity
                        style={ProductosStyles.editarCategoriaBtn}
                        onPress={() => editarCategoria(categoria)}
                        disabled={cargando}
                      >
                        <Text style={ProductosStyles.editarCategoriaBtnText}>✏</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={ProductosStyles.eliminarCategoriaBtn}
                        onPress={() => eliminarCategoria(categoria._id, categoria.name || categoria)}
                        disabled={cargando}
                      >
                        <Text style={ProductosStyles.eliminarCategoriaBtnText}>✖</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>

        </View>
      </Modal>

      {/* Modal para editar categoría */}
      <Modal
        visible={modalEditarCategoriaVisible}
        animationType="fade"
        transparent
        onRequestClose={() => !cargando && setModalEditarCategoriaVisible(false)}
      >
        <View style={[ProductosStyles.modalOverlay, { zIndex: 200 }]}>
          <View style={[ProductosStyles.modalBox, { zIndex: 201 }]}>
            <TouchableOpacity
              style={ProductosStyles.modalBack}
              onPress={() => !cargando && setModalEditarCategoriaVisible(false)}
              disabled={cargando}
            >
              <Text style={ProductosStyles.backButtonText}>←</Text>
            </TouchableOpacity>
            <View style={ProductosStyles.modalContent}>
              <Text style={ProductosStyles.modalTitle}>Editar Categoría</Text>

              <TextInput
                style={ProductosStyles.input}
                placeholder="Nombre de la categoría"
                value={nuevoNombreCategoria}
                onChangeText={setNuevoNombreCategoria}
                editable={!cargando}
                maxLength={50}
              />

              <TouchableOpacity
                style={[ProductosStyles.agregarBtn, cargando && ProductosStyles.btnDeshabilitado]}
                onPress={actualizarCategoria}
                disabled={cargando}
              >
                {cargando ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={ProductosStyles.agregarBtnText}>Actualizar Categoría</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Alerta personalizada - fuera de todos los modales */}
      {customAlert.visible && (
        <View style={[ProductosStyles.alertOverlay, { zIndex: 10000 }]}>
          <View style={[ProductosStyles.alertContainer, { zIndex: 10001 }]}>
            <View style={[ProductosStyles.alertIcon, ProductosStyles[`alertIcon${customAlert.type.charAt(0).toUpperCase() + customAlert.type.slice(1)}`]]}>
              <Text style={[ProductosStyles.alertIconText, ProductosStyles[`alertIconText${customAlert.type.charAt(0).toUpperCase() + customAlert.type.slice(1)}`]]}>
                {customAlert.type === 'success' ? '✓' :
                 customAlert.type === 'error' ? '✕' :
                 customAlert.type === 'warning' ? '⚠' : 'ℹ'}
              </Text>
            </View>

            <Text style={ProductosStyles.alertTitle}>{customAlert.title}</Text>
            <Text style={ProductosStyles.alertMessage}>{customAlert.message}</Text>

            <View style={ProductosStyles.alertButtons}>
              {customAlert.showCancel && (
                <TouchableOpacity
                  style={[ProductosStyles.alertButton, ProductosStyles.alertButtonCancel]}
                  onPress={customAlert.onCancel || hideCustomAlert}
                >
                  <Text style={ProductosStyles.alertButtonCancelText}>{customAlert.cancelText}</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[ProductosStyles.alertButton, ProductosStyles[`alertButton${customAlert.type.charAt(0).toUpperCase() + customAlert.type.slice(1)}`]]}
                onPress={customAlert.onConfirm || hideCustomAlert}
              >
                <Text style={ProductosStyles.alertButtonText}>
                  {customAlert.confirmText}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

    </SafeAreaView>
  );
};


export default Productos;