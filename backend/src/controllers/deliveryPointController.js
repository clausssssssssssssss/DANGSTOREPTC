import DeliveryPoint from '../models/DeliveryPoint.js';

// Obtener todos los puntos de entrega (solo activos para clientes)
export const getAllDeliveryPoints = async (req, res) => {
  try {
    const { includeInactive } = req.query;
    
    // Si es admin, puede ver todos; si no, solo los activos
    const filter = includeInactive === 'true' ? {} : { activo: true };
    
    const deliveryPoints = await DeliveryPoint.find(filter)
      .sort({ nombre: 1 });
    
    res.json({
      success: true,
      deliveryPoints
    });
  } catch (error) {
    console.error('Error obteniendo puntos de entrega:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener puntos de entrega'
    });
  }
};

// Obtener un punto de entrega por ID
export const getDeliveryPointById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deliveryPoint = await DeliveryPoint.findById(id);
    
    if (!deliveryPoint) {
      return res.status(404).json({
        success: false,
        message: 'Punto de entrega no encontrado'
      });
    }
    
    res.json({
      success: true,
      deliveryPoint
    });
  } catch (error) {
    console.error('Error obteniendo punto de entrega:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener punto de entrega'
    });
  }
};

// Crear un nuevo punto de entrega (solo admin)
export const createDeliveryPoint = async (req, res) => {
  try {
    const { nombre, direccion, coordenadas, descripcion, referencia, horarioAtencion } = req.body;
    
    // Validar datos requeridos
    if (!nombre || !direccion || !coordenadas || !coordenadas.lat || !coordenadas.lng) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, dirección y coordenadas son requeridos'
      });
    }
    
    // Validar que las coordenadas estén dentro de San Salvador (aproximadamente)
    // San Salvador: lat 13.6-13.8, lng -89.3 a -89.1
    const { lat, lng } = coordenadas;
    if (lat < 13.5 || lat > 13.9 || lng < -89.4 || lng > -89.0) {
      return res.status(400).json({
        success: false,
        message: 'Las coordenadas deben estar dentro del departamento de San Salvador'
      });
    }
    
    const newDeliveryPoint = new DeliveryPoint({
      nombre,
      direccion,
      departamento: 'San Salvador',
      coordenadas: {
        lat: parseFloat(lat),
        lng: parseFloat(lng)
      },
      descripcion: descripcion || '',
      referencia: referencia || '',
      horarioAtencion: horarioAtencion || 'Lunes a Viernes 9:00 AM - 5:00 PM',
      activo: true
    });
    
    await newDeliveryPoint.save();
    
    res.status(201).json({
      success: true,
      message: 'Punto de entrega creado exitosamente',
      deliveryPoint: newDeliveryPoint
    });
  } catch (error) {
    console.error('Error creando punto de entrega:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear punto de entrega'
    });
  }
};

// Actualizar un punto de entrega (solo admin)
export const updateDeliveryPoint = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, direccion, coordenadas, descripcion, referencia, horarioAtencion, activo } = req.body;
    
    const deliveryPoint = await DeliveryPoint.findById(id);
    
    if (!deliveryPoint) {
      return res.status(404).json({
        success: false,
        message: 'Punto de entrega no encontrado'
      });
    }
    
    // Validar coordenadas si se proporcionan
    if (coordenadas && coordenadas.lat && coordenadas.lng) {
      const { lat, lng } = coordenadas;
      if (lat < 13.5 || lat > 13.9 || lng < -89.4 || lng > -89.0) {
        return res.status(400).json({
          success: false,
          message: 'Las coordenadas deben estar dentro del departamento de San Salvador'
        });
      }
      deliveryPoint.coordenadas = {
        lat: parseFloat(lat),
        lng: parseFloat(lng)
      };
    }
    
    // Actualizar campos
    if (nombre !== undefined) deliveryPoint.nombre = nombre;
    if (direccion !== undefined) deliveryPoint.direccion = direccion;
    if (descripcion !== undefined) deliveryPoint.descripcion = descripcion;
    if (referencia !== undefined) deliveryPoint.referencia = referencia;
    if (horarioAtencion !== undefined) deliveryPoint.horarioAtencion = horarioAtencion;
    if (activo !== undefined) deliveryPoint.activo = activo;
    
    await deliveryPoint.save();
    
    res.json({
      success: true,
      message: 'Punto de entrega actualizado exitosamente',
      deliveryPoint
    });
  } catch (error) {
    console.error('Error actualizando punto de entrega:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar punto de entrega'
    });
  }
};

// Activar/Desactivar un punto de entrega (solo admin)
export const toggleDeliveryPointStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deliveryPoint = await DeliveryPoint.findById(id);
    
    if (!deliveryPoint) {
      return res.status(404).json({
        success: false,
        message: 'Punto de entrega no encontrado'
      });
    }
    
    deliveryPoint.activo = !deliveryPoint.activo;
    await deliveryPoint.save();
    
    res.json({
      success: true,
      message: `Punto de entrega ${deliveryPoint.activo ? 'activado' : 'desactivado'} exitosamente`,
      deliveryPoint
    });
  } catch (error) {
    console.error('Error cambiando estado del punto de entrega:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar estado del punto de entrega'
    });
  }
};

// Eliminar un punto de entrega (solo admin)
export const deleteDeliveryPoint = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deliveryPoint = await DeliveryPoint.findById(id);
    
    if (!deliveryPoint) {
      return res.status(404).json({
        success: false,
        message: 'Punto de entrega no encontrado'
      });
    }
    
    await DeliveryPoint.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Punto de entrega eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando punto de entrega:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar punto de entrega'
    });
  }
};

