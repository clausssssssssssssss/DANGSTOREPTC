import express from 'express';
import multer from 'multer';
import path from 'path';
import Product from '../models/Product.js';
import { v2 as cloudinary } from 'cloudinary';
import { config } from '../../config.js';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloudinary_name,
  api_key: config.cloudinary.cloudinary_api_key,
  api_secret: config.cloudinary.cloudinary_api_secret,
});

const router = express.Router();

// Configuración de multer para subir imágenes a memoria (para Cloudinary)
const storage = multer.memoryStorage();

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // Límite de 5MB
  }
});

// Función para subir imagen a Cloudinary
const uploadToCloudinary = (buffer, folder = 'product_images') => {
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

// GET /api/products - Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/products/:id - Obtener un producto por ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/products - Crear un nuevo producto
router.post('/', upload.single('imagen'), async (req, res) => {
  try {
    const { nombre, descripcion, precio, disponibles, categoria } = req.body;
    
    // Validaciones básicas
    if (!nombre || !descripcion || !precio || !disponibles) {
      return res.status(400).json({ error: 'Nombre, descripción, precio y disponibles son campos obligatorios' });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'La imagen es obligatoria' });
    }
    
    // Subir imagen a Cloudinary
    let imageUrl = null;
    try {
      console.log('Subiendo imagen a Cloudinary...');
      const result = await uploadToCloudinary(req.file.buffer);
      imageUrl = result.secure_url;
      console.log('Imagen subida exitosamente a Cloudinary:', imageUrl);
    } catch (uploadError) {
      console.error('Error al subir imagen a Cloudinary:', uploadError);
      return res.status(500).json({ error: 'Error al subir la imagen' });
    }
    
    const nuevoProducto = new Product({
      nombre,
      descripcion: descripcion || '',
      precio: parseFloat(precio),
      disponibles: parseInt(disponibles),
      categoria: categoria || 'Llavero',
      imagen: imageUrl
    });

    console.log('Guardando producto en la base de datos:', {
      nombre,
      descripcion,
      precio: parseFloat(precio),
      disponibles: parseInt(disponibles),
      categoria,
      imagen: imageUrl
    });

    const productoGuardado = await nuevoProducto.save();
    console.log('Producto guardado exitosamente:', productoGuardado);
    res.status(201).json(productoGuardado);
  } catch (error) {
    console.error('Error al crear producto:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Datos de producto inválidos' });
    }
    
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/products/:id - Actualizar un producto
router.put('/:id', upload.single('imagen'), async (req, res) => {
  try {
    const { nombre, descripcion, precio, disponibles, categoria } = req.body;
    
    // Validaciones básicas
    if (!nombre || !descripcion || !precio || !disponibles) {
      return res.status(400).json({ error: 'Nombre, descripción, precio y disponibles son campos obligatorios' });
    }
    
    const updateData = {
      nombre,
      descripcion,
      precio: parseFloat(precio),
      disponibles: parseInt(disponibles),
      categoria
    };
    
    // Si se subió una nueva imagen, actualizarla
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.buffer);
        updateData.imagen = result.secure_url;
      } catch (uploadError) {
        console.error('Error al subir imagen a Cloudinary:', uploadError);
        return res.status(500).json({ error: 'Error al subir la imagen' });
      }
    }
    
    const productoActualizado = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!productoActualizado) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    res.json(productoActualizado);
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Datos de producto inválidos' });
    }
    
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/products/:id - Eliminar un producto
router.delete('/:id', async (req, res) => {
  try {
    console.log('=== INTENTO DE ELIMINAR PRODUCTO ===');
    console.log('ID del producto a eliminar:', req.params.id);
    
    const productoEliminado = await Product.findByIdAndDelete(req.params.id);
    
    if (!productoEliminado) {
      console.log('Producto no encontrado con ID:', req.params.id);
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    console.log('Producto eliminado exitosamente:', productoEliminado.nombre);
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/products/popular - Obtener productos populares para el carrusel
router.get('/popular', async (req, res) => {
  try {
    // Por ahora, obtener los 6 productos más recientes o con más stock
    // En el futuro se puede implementar lógica más compleja basada en ventas/ratings
    const popularProducts = await Product.find()
      .sort({ disponibles: -1, createdAt: -1 }) // Ordenar por stock y fecha
      .limit(6)
      .lean();
    
    const formattedProducts = popularProducts.map(product => ({
      id: product._id,
      name: product.nombre,
      price: product.precio,
      image: product.imagen,
      category: product.categoria,
      description: product.descripcion,
      stock: product.disponibles
    }));
    
    res.json({
      success: true,
      products: formattedProducts,
      total: formattedProducts.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error al obtener productos populares:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/products/stock/summary - Obtener solo información de stock (más eficiente)
router.get('/stock/summary', async (req, res) => {
  try {
    const products = await Product.find({}, '_id nombre disponibles').lean();
    const stockSummary = products.map(product => ({
      id: product._id,
      name: product.nombre,
      stock: product.disponibles
    }));
    
    res.json({
      timestamp: new Date().toISOString(),
      products: stockSummary,
      totalProducts: stockSummary.length
    });
  } catch (error) {
    console.error('Error al obtener resumen de stock:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;