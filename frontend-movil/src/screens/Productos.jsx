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
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { AuthContext } from '../context/AuthContext';
import { useProducts } from '../hooks/useProducts';
import { ProductosStyles } from '../components/styles/ProductosStyles';
import AlertComponent from '../components/ui/Alert';
import { useNotifications } from '../hooks/useNotifications'; // Importa el hook de notificaciones

const API_URL = 'https://dangstoreptc-production.up.railway.app/api/products'; // URL consistente con el backend
const API_BASE_URL = 'https://dangstoreptc-production.up.railway.app/api'; // URL base para otras peticiones

const Productos = ({ navigation }) => {
  const { products: productosHook, loading: loadingHook, lastStockUpdate, refresh: refreshProducts } = useProducts();
  const { authToken } = useContext(AuthContext);
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
  const [alert, setAlert] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
    onCancel: null,
    confirmText: 'OK',
    cancelText: 'Cancelar',
    showCancel: false,
  });
  const { addNotification } = useNotifications(); // Obtén la función para agregar notificaciones

  // Estados para gestión de stock
  const [modalStockVisible, setModalStockVisible] = useState(false);
  const [productoStockSeleccionado, setProductoStockSeleccionado] = useState(null);
  const [nuevoStock, setNuevoStock] = useState('');
  const [guardandoStock, setGuardandoStock] = useState(false);

  // Debug: Log cuando cambie el estado de alert
  useEffect(() => {
    console.log('alert state cambió:', alert);
  }, [alert]);
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
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    // obtenerProductos(); // Comentado temporalmente - usando hook
    obtenerCategorias();
  }, []);

  // Sincronizar con el hook de productos
  useEffect(() => {
    setProductos(productosHook || []);
  }, [productosHook]);

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

  // Funciones para gestión de stock
  const abrirModalStock = (producto) => {
    console.log('Abriendo modal de stock para producto:', producto);
    
    setProductoStockSeleccionado(producto);
    setNuevoStock(producto.disponibles?.toString() || '0');
    setModalStockVisible(true);
  };

  // Función para mostrar notificación cuando el producto vuelve a estar disponible
  const notifyStockAvailable = (producto) => {
    if (producto.disponibles > 0) {
      addNotification({
        title: '¡Producto disponible!',
        message: `Ya puedes volver a comprar el producto "${producto.nombre}".`,
        type: 'stock_available',
        data: { productId: producto._id, productName: producto.nombre }
      });
    }
  };

  const guardarStock = async () => {
    if (!productoStockSeleccionado) return;

    try {
      setGuardandoStock(true);

      // Actualizar stock disponible
      const stockActualizado = parseInt(nuevoStock) || 0;
      
      console.log('Guardando stock con datos:');
      console.log('- Stock actualizado:', stockActualizado);
      console.log('- Producto ID:', productoStockSeleccionado._id);

      // Enviar actualización al backend
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      const response = await fetch(`${API_URL}/${productoStockSeleccionado._id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          disponibles: stockActualizado
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          showAlert('Error de autenticación', 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', 'error');
          return;
        }
        
        let errorMessage = 'Error al actualizar el stock en el servidor';
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          console.log('No se pudo parsear el error del servidor:', e);
        }
        
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      console.log('Respuesta del servidor al guardar stock:', responseData);

      // Actualizar el producto localmente después de éxito en el backend
      setProductos(prev => prev.map(p =>
        p._id === productoStockSeleccionado._id
          ? {
              ...p,
              disponibles: stockActualizado
            }
          : p
      ));

      // Notificar si el producto vuelve a estar disponible
      if (productoStockSeleccionado.disponibles === 0 && stockActualizado > 0) {
        notifyStockAvailable({
          ...productoStockSeleccionado,
          disponibles: stockActualizado
        });
      }

      // Refrescar productos desde el servidor para asegurar datos actualizados
      refreshProducts();

      showAlert(
        'Éxito',
        'Stock actualizado correctamente',
        'success'
      );

      setModalStockVisible(false);
    } catch (error) {
      console.error('Error guardando stock:', error);
      showAlert(
        'Error',
        'No se pudo actualizar el stock: ' + error.message,
        'error'
      );
    } finally {
      setGuardandoStock(false);
    }
  };

  // Funciones helper de stock
  const getStockStatus = (producto) => {
    if (!producto.stockLimits?.isStockLimitActive) return 'unlimited';
    if (producto.disponibles === 0) return 'out';
    if (producto.disponibles <= 3) return 'low';
    return 'normal';
  };

  const getStockStatusColor = (status) => {
    switch (status) {
      case 'out': return '#EF4444';
      case 'low': return '#F59E0B';
      case 'normal': return '#10B981';
      case 'unlimited': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStockStatusText = (status) => {
    switch (status) {
      case 'out': return 'Sin stock';
      case 'low': return 'Stock bajo';
      case 'normal': return 'En stock';
      case 'unlimited': return 'Sin límite';
      default: return 'Desconocido';
    }
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
      showAlert('Error', 'No se pudieron cargar los productos', 'error');
    } finally {
      setCargando(false);
    }
  };

  const obtenerCategorias = async () => {
    try {
      const response = await fetch('https://dangstoreptc-production.up.railway.app/api/categories');
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
    try {
      console.log('Iniciando agregarProducto con:', nuevoProducto);
      
    // Validaciones
    if (!nuevoProducto.nombre || !nuevoProducto.descripcion || !nuevoProducto.precio || !nuevoProducto.disponibles) {
        console.log('Validación fallida: campos obligatorios');
        showAlert('Error', 'Por favor completa todos los campos obligatorios (nombre, descripción, precio y disponibles)', 'error');
      return;
    }

    if (!nuevoProducto.imagen) {
        console.log('Validación fallida: imagen requerida');
        showAlert('Error', 'Por favor selecciona una imagen', 'error');
      return;
    }

    // La validación de límite de stock se hace en el backend
    // No necesitamos validar aquí la creación de productos

      setCargando(true);
      console.log('Creando FormData...');
      
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
        console.log('Imagen agregada al FormData:', { filename, type });
      }
      
      console.log('Enviando petición a:', API_URL);
      const headers = {};
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
        headers,
      });
      
      console.log('Respuesta recibida:', response.status, response.statusText);
      
      if (!response.ok) {
        // Manejo específico para errores de autenticación
        if (response.status === 401) {
          showAlert('Error de autenticación', 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', 'error');
          return;
        }
        
        // Intentar obtener el mensaje de error del servidor
        let errorMessage = `HTTP ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          console.log('Error data del servidor:', errorData);
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          console.log('No se pudo parsear el error del servidor:', e);
        }
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      console.log('Respuesta exitosa:', responseData);

      showAlert('Éxito', 'Producto agregado correctamente', 'success');
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
    } catch (error) {
      console.error('Error completo al agregar producto:', error);
      const errorMessage = error.message || 'No se pudo agregar el producto';
      
      // Evitar que la app se cierre por errores de red o del servidor
      try {
      showAlert('Error', `Error al guardar el producto: ${errorMessage}`, 'error');
      } catch (alertError) {
        console.error('Error mostrando alerta:', alertError);
        // Si no se puede mostrar el alert, al menos loguear el error
      }
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
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setNuevoProducto({ ...nuevoProducto, imagen: result.assets[0].uri });
      }
    } catch (error) {
      console.log('Error seleccionando imagen:', error);
      try {
      showAlert('Error', 'No se pudo seleccionar la imagen', 'error');
      } catch (alertError) {
        console.error('Error mostrando alerta de imagen:', alertError);
      }
    }
  };

  const seleccionarImagenEditar = async () => {
    try {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
      setProductoSeleccionado({ ...productoSeleccionado, imagen: result.assets[0].uri });
      }
    } catch (error) {
      console.log('Error seleccionando imagen para editar:', error);
      try {
        showAlert('Error', 'No se pudo seleccionar la imagen', 'error');
      } catch (alertError) {
        console.error('Error mostrando alerta de imagen:', alertError);
      }
    }
  };

  const eliminarProducto = async (productId) => {
    console.log('Botón eliminar presionado para producto ID:', productId);
    showAlert(
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
            console.log('AuthToken disponible:', authToken ? 'SÍ' : 'NO');
            console.log('AuthToken:', authToken ? authToken.substring(0, 20) + '...' : 'null');
            
            const headers = {
              'Content-Type': 'application/json',
            };
            
            if (authToken) {
              headers['Authorization'] = `Bearer ${authToken}`;
              console.log('Header de autorización agregado');
            } else {
              console.log('No hay token de autenticación');
            }
            
            const response = await fetch(`${API_URL}/${productId}`, {
              method: 'DELETE',
              headers,
            });
            
            console.log('Respuesta del servidor:', response.status, response.statusText);
            
            if (!response.ok) {
              const errorData = await response.json().catch(() => null);
              console.log('Error data:', errorData);
              
              // Si es error 401, no mostrar error genérico
              if (response.status === 401) {
                showAlert('Error de autenticación', 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', 'error');
                return;
              }
              
              throw new Error(`HTTP ${response.status} ${response.statusText}`);
            }
            
            const result = await response.json();
            console.log('Producto eliminado exitosamente:', result);
            
            // Recargar la lista usando el hook
            refreshProducts();
            showAlert('Éxito', 'Producto eliminado correctamente', 'success');
          } catch (error) {
            console.log('Error eliminando producto:', error);
            showAlert('Error', 'No se pudo eliminar el producto', 'error');
          }
        },
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
      showAlert('Error', `Error al editar el producto: ${errorMessage}`, 'error');
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
      showAlert('Error', 'Por favor ingresa un nombre para la categoría', 'error');
      return;
    }

    try {
      setCargando(true);
      
      // Preparar headers con autenticación
      const headers = {
          'Content-Type': 'application/json',
      };
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          name: nuevaCategoria.trim()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status} ${response.statusText}`);
      }

      showAlert('Éxito', 'Categoría creada correctamente', 'success');
      setModalCategoriaVisible(false);
      setNuevaCategoria('');
      // Recargar las categorías para incluir la nueva
      obtenerCategorias();
    } catch (error) {
      console.log('Error creando categoría:', error);
      const errorMessage = error.message || 'No se pudo crear la categoría';
      showAlert('Error', errorMessage, 'error');
    } finally {
      setCargando(false);
    }
  };

  const eliminarCategoria = async (categoriaId, categoriaNombre) => {
    const confirmMessage = `¿Estás seguro de que quieres eliminar la categoría "${categoriaNombre}"?\n\n⚠️ ATENCIÓN: También se eliminarán TODOS los productos que pertenecen a esta categoría.\n\nEsta acción no se puede deshacer.`;

    showAlert(
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

            // Preparar headers con autenticación
            const headers = {
              'Content-Type': 'application/json',
            };
            
            if (authToken) {
              headers['Authorization'] = `Bearer ${authToken}`;
            }

            // Eliminar categoría del backend (también eliminará productos asociados)
            const response = await fetch(`${API_BASE_URL}/categories/${categoriaId}`, {
              method: 'DELETE',
              headers,
            });

            if (!response.ok) {
              const errorData = await response.json().catch(() => null);
              
              if (response.status === 401) {
                showAlert('Error de autenticación', 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', 'error');
                return;
              }
              
              throw new Error(errorData?.message || `HTTP ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            
            // Mostrar mensaje con información de productos eliminados
            const message = result.deletedProducts > 0 
              ? `Categoría "${result.categoryName}" eliminada correctamente.\n\n${result.deletedProducts} productos también fueron eliminados.`
              : `Categoría "${result.categoryName}" eliminada correctamente.`;
            
            showAlert('Éxito', message, 'success');
            
            // Recargar las categorías para actualizar la lista
            obtenerCategorias();
            // También refrescar productos para mostrar cambios
            refreshProducts();
          } catch (error) {
            console.log('Error eliminando categoría:', error);
            const errorMessage = error.message || 'No se pudo eliminar la categoría';
            showAlert('Error', errorMessage, 'error');
          } finally {
            setCargando(false);
          }
        },
        onCancel: () => setAlert(prev => ({ ...prev, visible: false })),
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
      showAlert('Error', 'Por favor ingresa un nombre para la categoría', 'error');
      return;
    }

    try {
      setCargando(true);

      // Preparar headers con autenticación
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      // Todas las categorías ahora vienen del backend, actualizar vía API
      const response = await fetch(`${API_BASE_URL}/categories/${categoriaEditando._id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          name: nuevoNombreCategoria.trim()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status} ${response.statusText}`);
      }

      showAlert('Éxito', 'Categoría actualizada correctamente', 'success');
      setModalEditarCategoriaVisible(false);
      setCategoriaEditando(null);
      setNuevoNombreCategoria('');
      // Recargar las categorías
      obtenerCategorias();
    } catch (error) {
      console.log('Error actualizando categoría:', error);
      const errorMessage = error.message || 'No se pudo actualizar la categoría';
      showAlert('Error', errorMessage, 'error');
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

  const renderProducto = ({ item }) => {
    const stockStatus = getStockStatus(item);
    const statusColor = getStockStatusColor(stockStatus);
    const statusText = getStockStatusText(stockStatus);

    return (
    <View style={ProductosStyles.card}>
      <Image 
        source={{ uri: item.imagen || 'https://via.placeholder.com/150' }} 
        style={ProductosStyles.cardImage} 
      />
      <Text style={ProductosStyles.cardTitle}>{item.nombre}</Text>
      <Text style={ProductosStyles.cardText}>Precio: ${item.precio}</Text>
        
        {/* Información de stock mejorada */}
        <View style={ProductosStyles.stockInfo}>
          <Text style={[ProductosStyles.cardText, { color: statusColor }]}>
        Disponibles: {item.disponibles || item.stock || 0}
      </Text>
          <Text style={[ProductosStyles.stockStatusText, { color: statusColor }]}>
            {statusText}
          </Text>
          {item.stockLimits?.maxStock && (
            <Text style={ProductosStyles.stockLimitText}>
              Límite: {item.stockLimits.maxStock}
            </Text>
          )}
        </View>
      
      <View style={ProductosStyles.cardActions}>
          <TouchableOpacity 
            style={ProductosStyles.stockButton}
            onPress={() => abrirModalStock(item)}
          >
            <Ionicons name="settings-outline" size={16} color="#000000" />
          </TouchableOpacity>
          
        <TouchableOpacity 
          style={ProductosStyles.editButton}
          onPress={() => abrirModalEditar(item)}
        >
          <Ionicons name="create-outline" size={16} color="#FFFFFF" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={ProductosStyles.deleteButton}
          onPress={() => {
            console.log('TouchableOpacity delete presionado');
            eliminarProducto(item._id);
          }}
        >
          <Ionicons name="close" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
  };

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
          <Text style={ProductosStyles.managementBtnText}>Gestionar Categorías</Text>
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
              <View style={ProductosStyles.modalFormContainer}>
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
                  style={ProductosStyles.agregarBtn} 
                  onPress={agregarProducto}
                >
                  <Text style={ProductosStyles.agregarBtnText}>
                    {editando ? 'Actualizar' : 'Agregar'}
                  </Text>
                </TouchableOpacity>
              </View>
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
              
              <View style={ProductosStyles.modalFormContainer}>
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
              </View>
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
                style={ProductosStyles.categoriaConfirmBtn} 
                onPress={crearCategoria}
              >
                <Text style={ProductosStyles.categoriaConfirmBtnText}>
                  Crear Categoría
                </Text>
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
                        style={[ProductosStyles.editarCategoriaBtn, cargando && ProductosStyles.btnDeshabilitado]}
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

      {/* Modal para gestión de stock */}
      <Modal
        visible={modalStockVisible}
        animationType="fade"
        transparent
        onRequestClose={() => !guardandoStock && setModalStockVisible(false)}
      >
        <SafeAreaView style={[ProductosStyles.modalOverlay, { zIndex: 200 }]}>
          <KeyboardAvoidingView 
            behavior="padding" 
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          >
          <View style={[ProductosStyles.modalBox, { zIndex: 201 }]}>
            <TouchableOpacity
              style={ProductosStyles.modalBack}
              onPress={() => !guardandoStock && setModalStockVisible(false)}
              disabled={guardandoStock}
            >
              <Text style={ProductosStyles.backButtonText}>←</Text>
            </TouchableOpacity>
              
              <ScrollView 
                contentContainerStyle={ProductosStyles.modalContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
              <Text style={ProductosStyles.modalTitle}>
                Gestionar Stock - {productoStockSeleccionado?.nombre}
              </Text>

                {/* Stock actual */}
                <View style={ProductosStyles.stockSection}>
                  <Text style={ProductosStyles.sectionTitle}>Stock Actual</Text>
                  <TextInput
                    style={ProductosStyles.stockInput}
                    placeholder="Cantidad disponible"
                    value={nuevoStock}
                    onChangeText={setNuevoStock}
                    keyboardType="numeric"
                    editable={!guardandoStock}
                  />
                </View>

              {/* Botones de acción */}
              <View style={ProductosStyles.stockButtonsContainer}>
                <TouchableOpacity
                  style={[ProductosStyles.cancelButton, guardandoStock && ProductosStyles.btnDeshabilitado]}
                  onPress={() => setModalStockVisible(false)}
                  disabled={guardandoStock}
                >
                  <Text style={ProductosStyles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[ProductosStyles.stockSaveButton, guardandoStock && ProductosStyles.btnDeshabilitado]}
                  onPress={guardarStock}
                  disabled={guardandoStock}
                >
                  {guardandoStock ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                      <Text style={ProductosStyles.stockSaveButtonText}>Guardar Stock</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
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
    </SafeAreaView>
  );
};

export default Productos;