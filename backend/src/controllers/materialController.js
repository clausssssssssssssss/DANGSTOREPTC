import { v2 as cloudinary } from 'cloudinary';
import Material from '../models/Material.js';
import { config } from '../../config.js';

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloudinary_name,
  api_key: config.cloudinary.cloudinary_api_key,
  api_secret: config.cloudinary.cloudinary_api_secret,
});

// Función para subir imagen a Cloudinary
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'material_images' },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    stream.end(buffer);
  });
};

const materialController = {};

// Validación de tipos de imagen permitidos
const validImageTypes = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'image/svg+xml', 'image/avif', 'image/jpg'
];

// Insertar un nuevo material con imagen
materialController.insertMaterial = async (req, res) => {
  try {
    const { name, type, quantity, dateOfEntry, investment } = req.body;
    const { image } = req.files; // Imagen enviada como archivo

    if (!image) {
      return res.status(400).json({ message: 'La imagen es obligatoria' });
    }

    // Validar el tipo de la imagen
    if (!validImageTypes.includes(image.mimetype)) {
      return res.status(400).json({ message: 'Formato de imagen no válido' });
    }

    // Subir la imagen a Cloudinary
    const result = await uploadToCloudinary(image.data); // Usamos el buffer de la imagen

    // Crear un nuevo objeto Material
    const newMaterial = new Material({
      name,
      type,
      quantity,
      dateOfEntry,
      investment,
      image: result.secure_url, // Guardamos la URL de la imagen
    });

    await newMaterial.save();
    res.status(201).json(newMaterial);
  } catch (error) {
    console.error('Error creando material:', error);
    res.status(500).json({ message: 'Error al crear material', error });
  }
};

// Obtener todos los materiales
materialController.getAllMaterials = async (req, res) => {
  try {
    const materials = await Material.find();
    res.json(materials);
  } catch (error) {
    console.error('Error obteniendo materiales:', error);
    res.status(500).json({ message: 'Error al obtener materiales', error });
  }
};

// Obtener un material por ID
materialController.getMaterialById = async (req, res) => {
  try {
    const { id } = req.params;
    const material = await Material.findById(id);

    if (!material) {
      return res.status(404).json({ message: 'Material no encontrado' });
    }

    res.json(material);
  } catch (error) {
    console.error('Error obteniendo material por ID:', error);
    res.status(500).json({ message: 'Error al obtener material', error });
  }
};

// Actualizar un material existente
materialController.updateMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, quantity, dateOfEntry, investment, image } = req.body;
    
    const materialToUpdate = await Material.findById(id);
    if (!materialToUpdate) {
      return res.status(404).json({ message: 'Material no encontrado' });
    }

    // Validar el tipo de la nueva imagen si se envía una nueva
    let imageUrl = materialToUpdate.image; // Mantener la imagen antigua si no se envía una nueva
    if (image) {
      if (!validImageTypes.includes(image.mimetype)) {
        return res.status(400).json({ message: 'Formato de imagen no válido' });
      }

      // Subir la nueva imagen a Cloudinary
      const result = await uploadToCloudinary(image.data); // Usamos el buffer de la nueva imagen
      imageUrl = result.secure_url; // Actualizamos la URL con la nueva imagen
    }

    // Actualizar el material con los nuevos datos
    const updatedMaterial = await Material.findByIdAndUpdate(
      id,
      { name, type, quantity, dateOfEntry, investment, image: imageUrl },
      { new: true, runValidators: true }
    );

    res.json(updatedMaterial);
  } catch (error) {
    console.error('Error actualizando material:', error);
    res.status(500).json({ message: 'Error al actualizar material', error });
  }
};

// Eliminar un material
materialController.deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const materialToDelete = await Material.findByIdAndDelete(id);

    if (!materialToDelete) {
      return res.status(404).json({ message: 'Material no encontrado' });
    }

    // Si el material tiene una imagen, eliminarla de Cloudinary
    if (materialToDelete.image) {
      const publicId = materialToDelete.image.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    }

    res.json({ message: 'Material eliminado correctamente' });
  } catch (error) {
    console.error('Error eliminando material:', error);
    res.status(500).json({ message: 'Error al eliminar material', error });
  }
};

// Buscar materiales (por nombre, tipo o cualquier otro campo)
materialController.searchMaterials = async (req, res) => {
  try {
    const { query } = req.query; 
    
    const materials = await Material.find({
      $or: [
        { name: { $regex: query, $options: 'i' } }, // Buscar por nombre (sin importar mayúsculas/minúsculas)
        { type: { $regex: query, $options: 'i' } }  // Buscar por tipo
      ]
    });

    res.json(materials);
  } catch (error) {
    console.error('Error buscando materiales:', error);
    res.status(500).json({ message: 'Error al buscar materiales', error });
  }
};

export default materialController;
