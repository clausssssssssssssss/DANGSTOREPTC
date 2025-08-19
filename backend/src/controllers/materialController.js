// import { v2 as cloudinary } from 'cloudinary';
import Material from '../models/Material.js';
import { config } from '../../config.js';

// Configuro cloudinary con mis credenciales
// cloudinary.config({
//   cloud_name: config.cloudinary.cloudinary_name,
//   api_key: config.cloudinary.cloudinary_api_key,
//   api_secret: config.cloudinary.cloudinary_api_secret,
// });

// función para subir una imagen a cloudinary usando un buffer
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

// tipos válidos de imágenes que acepto
const validImageTypes = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'image/svg+xml', 'image/avif', 'image/jpg'
];

//  insertar un material con imagen
materialController.insertMaterial = async (req, res) => {
  try {
    const { name, type, quantity, dateOfEntry, investment } = req.body;
    const image = req.file; // multer

    if (!image || !image.buffer) {
      return res.status(400).json({ message: 'La imagen es obligatoria' });
    }

    // reviso que el formato de la imagen sea válido
    if (!validImageTypes.includes(image.mimetype)) {
      return res.status(400).json({ message: 'Formato de imagen no válido' });
    }

    // subo la imagen a cloudinary
    const result = await uploadToCloudinary(image.buffer);

    // creo el documento con la URL de la imagen de cloudinary
    const newMaterial = new Material({
      name,
      type,
      quantity,
      dateOfEntry,
      investment,
      image: result.secure_url,
    });

    await newMaterial.save();
    res.status(201).json(newMaterial);
  } catch (error) {
    console.error('Error creando material:', error);
    res.status(500).json({ message: 'Error al crear material', error });
  }
};

//  obtener todos los materiales
materialController.getAllMaterials = async (req, res) => {
  try {
    const materials = await Material.find(); // traigo todo
    res.json(materials);
  } catch (error) {
    console.error('Error obteniendo materiales:', error);
    res.status(500).json({ message: 'Error al obtener materiales', error });
  }
};

//  obtener material por ID
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

//  actualizar material existente
materialController.updateMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, quantity, dateOfEntry, investment } = req.body;
    const image = req.file; // multer
    
    const materialToUpdate = await Material.findById(id);
    if (!materialToUpdate) {
      return res.status(404).json({ message: 'Material no encontrado' });
    }

    let imageUrl = materialToUpdate.image; // si no mandan nueva imagen dejo la anterior
    if (image && image.buffer) {
      if (!validImageTypes.includes(image.mimetype)) {
        return res.status(400).json({ message: 'Formato de imagen no válido' });
      }

      // subo la nueva imagen
      const result = await uploadToCloudinary(image.buffer);
      imageUrl = result.secure_url;
    }

    // guardo los cambios
    const updateDoc = {
      ...(name !== undefined ? { name } : {}),
      ...(type !== undefined ? { type } : {}),
      ...(quantity !== undefined ? { quantity } : {}),
      ...(dateOfEntry !== undefined ? { dateOfEntry } : {}),
      ...(investment !== undefined ? { investment } : {}),
      image: imageUrl,
    };

    const updatedMaterial = await Material.findByIdAndUpdate(id, updateDoc, { new: true, runValidators: true });

    res.json(updatedMaterial);
  } catch (error) {
    console.error('Error actualizando material:', error);
    res.status(500).json({ message: 'Error al actualizar material', error });
  }
};

// eliminar material
materialController.deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const materialToDelete = await Material.findByIdAndDelete(id);

    if (!materialToDelete) {
      return res.status(404).json({ message: 'Material no encontrado' });
    }

    // si tiene imagen, la elimino también de cloudinary
    if (materialToDelete.image) {
      const publicId = materialToDelete.image.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    }

    res.json({ success: true, message: 'Material eliminado correctamente' });
  } catch (error) {
    console.error('Error eliminando material:', error);
    res.status(500).json({ message: 'Error al eliminar material', error });
  }
};

//  buscar materiales por nombre o tipo
materialController.searchMaterials = async (req, res) => {
  try {
    const { query } = req.query; 
    
    const materials = await Material.find({
      $or: [
        { name: { $regex: query, $options: 'i' } }, // búsqueda insensible a mayúsculas
        { type: { $regex: query, $options: 'i' } }
      ]
    });

    res.json(materials);
  } catch (error) {
    console.error('Error buscando materiales:', error);
    res.status(500).json({ message: 'Error al buscar materiales', error });
  }
};

export default materialController;
