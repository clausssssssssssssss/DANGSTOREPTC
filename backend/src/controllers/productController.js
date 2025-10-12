import { v2 as cloudinary } from 'cloudinary';
import productModel from "../models/Product.js";
import CustomizedOrder from '../models/CustomOrder.js';
import { config } from '../../config.js';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloudinary_name,
  api_key: config.cloudinary.cloudinary_api_key,
  api_secret: config.cloudinary.cloudinary_api_secret,
});

export const uploadToCloudinary = (buffer, folder = 'product_images') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    stream.end(buffer);
  });
};

const productController = {};

// Obtener todos los productos
productController.getProducts = async (req, res) => {
  try {
    const products = await productModel.find().lean();
    
    // Transformar los datos para mantener consistencia con el frontend
const transformedProducts = products.map(product => ({
  _id: product._id,
  nombre: product.nombre,
  descripcion: product.descripcion,
  precio: product.precio,
  disponibles: product.disponibles,
  categoria: product.categoria,
  imagen: product.imagen,
  stockLimits: product.stockLimits || { maxStock: null, isStockLimitActive: true },
  // Campos adicionales para compatibilidad - MEJORADOS
  name: product.nombre || product.name,
  description: product.descripcion || product.description,
  price: product.precio || product.price,  // ← CLAVE: Intentar ambos campos
  stock: product.disponibles || product.stock,
  category: product.categoria || product.category,
  images: product.imagen ? [product.imagen] : (product.images || [])
}));

    res.json(transformedProducts);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ message: "Error al obtener productos", error });
  }
};

// Obtener un producto por su ID
productController.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productModel.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.json(product);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ message: "Error al obtener producto", error });
  }
};

// Obtener productos populares
productController.getPopularProducts = async (req, res) => {
  try {
    const popularProducts = await productModel.find().limit(5);
    res.json(popularProducts);
  } catch (error) {
    console.error('Error al obtener productos populares:', error);
    res.status(500).json({ message: "Error al obtener productos populares", error });
  }
};

// Crear un nuevo producto
productController.insertProduct = async (req, res) => {
  try {
    const { nombre, descripcion, precio, disponibles, categoria } = req.body;

    if (!nombre || !precio || !disponibles || !categoria) {
      return res.status(400).json({ message: "Faltan campos requeridos" });
    }

    let imageUrl = null;

    // Procesar imagen si se envió
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.buffer);
        imageUrl = result.secure_url;
      } catch (uploadError) {
        console.error('Error al subir imagen a Cloudinary:', uploadError);
        return res.status(500).json({ message: "Error al subir la imagen" });
      }
    }

    const newProduct = new productModel({
      nombre,
      descripcion: descripcion || '',
      precio: parseFloat(precio),
      disponibles: parseInt(disponibles),
      categoria,
      imagen: imageUrl
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ message: 'Error al crear producto', error });
  }
};

// Actualizar un producto existente
productController.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio, disponibles, categoria, stockLimits } = req.body;

    console.log('Actualizando producto:', id);
    console.log('Datos recibidos:', { nombre, descripcion, precio, disponibles, categoria, stockLimits });

    const product = await productModel.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Actualizar campos
    if (nombre !== undefined) product.nombre = nombre;
    if (descripcion !== undefined) product.descripcion = descripcion;
    if (precio !== undefined) product.precio = precio;
    if (disponibles !== undefined) product.disponibles = disponibles;
    if (categoria !== undefined) product.categoria = categoria;
    
    // Actualizar stock limits
    if (stockLimits !== undefined) {
      console.log('Actualizando stock limits:', stockLimits);
      product.stockLimits = {
        ...product.stockLimits,
        ...stockLimits
      };
    }

    // Procesar nueva imagen si se envió
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.buffer);
        product.imagen = result.secure_url;
      } catch (uploadError) {
        console.error('Error al subir imagen a Cloudinary:', uploadError);
        return res.status(500).json({ message: "Error al subir la imagen" });
      }
    }

    await product.save();
    console.log('Producto guardado con stock limits:', product.stockLimits);
    res.json(product);
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ message: 'Error al actualizar producto', error });
  }
};

// Eliminar un producto por su ID
productController.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await productModel.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.json({ message: "Producto eliminado" });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).json({ message: "Error al eliminar producto" });
  }
};

/**
 * Crear producto desde encargo personalizado aceptado
 * Esta función se llama automáticamente cuando un encargo es aceptado
 */
productController.createProductFromCustomOrder = async (customOrderId) => {
  try {
    console.log('🔄 Creando producto desde encargo personalizado:', customOrderId);
    
    // Buscar el encargo personalizado
    const customOrder = await CustomizedOrder.findById(customOrderId)
      .populate('user', 'name email');
    
    if (!customOrder) {
      throw new Error('Encargo personalizado no encontrado');
    }
    
    if (customOrder.status !== 'accepted') {
      throw new Error('El encargo debe estar aceptado para crear el producto');
    }
    
    if (!customOrder.price) {
      throw new Error('El encargo debe tener precio asignado');
    }
    
    // Verificar si ya existe un producto para este encargo
    const existingProduct = await productModel.findOne({
      originalCustomOrderId: customOrderId
    });
    
    if (existingProduct) {
      console.log('⚠️ Ya existe un producto para este encargo:', customOrderId);
      return existingProduct;
    }
    
    // Crear el producto desde el encargo
    const newProduct = new productModel({
      nombre: `${customOrder.modelType} - ${customOrder.description?.substring(0, 50) || 'Personalizado'}`,
      descripcion: customOrder.description || `Producto personalizado de tipo ${customOrder.modelType}`,
      precio: customOrder.price,
      disponibles: 1, // Stock inicial de 1 para productos personalizados
      categoria: customOrder.modelType,
      imagen: customOrder.imageUrl,
      isFromCustomOrder: true,
      originalCustomOrderId: customOrder._id,
      originalCustomer: customOrder.user._id
    });
    
    const savedProduct = await newProduct.save();
    console.log('✅ Producto creado exitosamente desde encargo:', savedProduct._id);
    
    return savedProduct;
    
  } catch (error) {
    console.error('❌ Error creando producto desde encargo personalizado:', error);
    throw error;
  }
};

export default productController;