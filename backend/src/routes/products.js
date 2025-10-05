import express from 'express';
import multer from 'multer';
import path from 'path';
import mongoose from 'mongoose';
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
    // Si recibimos JSON, permitir actualización parcial de stock/stockLimits
    const isJson = req.is('application/json');
    if (isJson) {
      const { disponibles, stockLimits } = req.body || {};

      const update = {};
      if (disponibles !== undefined) {
        const parsed = parseInt(disponibles);
        if (Number.isNaN(parsed) || parsed < 0) {
          return res.status(400).json({ error: 'El campo disponibles debe ser un número válido mayor o igual a 0' });
        }
        update.disponibles = parsed;
      }
      if (stockLimits && typeof stockLimits === 'object') {
        if ('maxStock' in stockLimits) {
          const maxParsed = stockLimits.maxStock === null ? null : parseInt(stockLimits.maxStock);
          if (maxParsed !== null && (Number.isNaN(maxParsed) || maxParsed < 0)) {
            return res.status(400).json({ error: 'stockLimits.maxStock debe ser un número válido mayor o igual a 0 o null' });
          }
          update['stockLimits.maxStock'] = maxParsed;
        }
        if ('isStockLimitActive' in stockLimits) {
          update['stockLimits.isStockLimitActive'] = Boolean(stockLimits.isStockLimitActive);
        }
      }

      if (Object.keys(update).length === 0) {
        return res.status(400).json({ error: 'No hay campos válidos para actualizar' });
      }

      const productoActualizado = await Product.findByIdAndUpdate(
        req.params.id,
        { $set: update },
        { new: true, runValidators: true }
      );

      if (!productoActualizado) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      return res.json(productoActualizado);
    }

    // Flujo original con multipart/form-data para actualización completa (incluye imagen)
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

// GET /api/products/popular - Obtener productos más vendidos para el carrusel
router.get('/popular', async (req, res) => {
  try {
    console.log('=== SOLICITUD PRODUCTOS POPULARES ===');
    console.log('Estado de MongoDB:', mongoose.connection.readyState);
    console.log('MONGO_URI definido:', !!process.env.MONGO_URI);
    
    // Verificar si hay conexión a la base de datos
    if (mongoose.connection.readyState !== 1) {
      console.warn('No hay conexión a MongoDB, devolviendo productos de ejemplo');
      
      // Productos de ejemplo cuando no hay base de datos
      const fallbackProducts = [
        {
          id: 'fallback-1',
          name: 'Llavero Personalizado',
          price: 15000,
          image: '/src/assets/llavero.png',
          category: 'Llavero',
          description: 'Llavero personalizado con tu diseño favorito',
          stock: 10
        },
        {
          id: 'fallback-2',
          name: 'Llavero de Acero',
          price: 20000,
          image: '/src/assets/llavero.png',
          category: 'Llavero',
          description: 'Llavero de acero inoxidable de alta calidad',
          stock: 5
        },
        {
          id: 'fallback-3',
          name: 'Llavero de Madera',
          price: 12000,
          image: '/src/assets/llavero.png',
          category: 'Llavero',
          description: 'Llavero artesanal de madera natural',
          stock: 8
        }
      ];
      
      return res.json({
        success: true,
        products: fallbackProducts,
        total: fallbackProducts.length,
        timestamp: new Date().toISOString(),
        message: 'Mostrando productos de ejemplo (base de datos no disponible)'
      });
    }

    // Obtener productos más vendidos basándose en órdenes completadas
    console.log(' Buscando productos más vendidos en órdenes...');
    
    // Agregación para obtener productos más vendidos de órdenes completadas
    const bestSellingProducts = await mongoose.connection.db.collection('orders').aggregate([
      // Solo órdenes completadas
      { $match: { status: 'COMPLETED' } },
      // Descomponer los items de cada orden
      { $unwind: '$items' },
      // Agrupar por producto y sumar cantidades vendidas
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        }
      },
      // Ordenar por cantidad vendida (más vendidos primero)
      { $sort: { totalSold: -1 } },
      // Limitar a los 3 más vendidos
      { $limit: 3 }
    ]).toArray();

    console.log(' Productos más vendidos encontrados:', bestSellingProducts.length);

    let popularProducts = [];

    if (bestSellingProducts.length > 0) {
      // Obtener los detalles de los productos más vendidos
      const productIds = bestSellingProducts.map(item => new mongoose.Types.ObjectId(item._id));
      const products = await Product.find({ _id: { $in: productIds } }).lean();
      
      // Ordenar según el orden de ventas
      popularProducts = bestSellingProducts.map(sale => {
        const product = products.find(p => p._id.toString() === sale._id.toString());
        return product ? {
          ...product,
          totalSold: sale.totalSold,
          totalRevenue: sale.totalRevenue
        } : null;
      }).filter(Boolean);
      
      console.log(' Productos populares obtenidos:', popularProducts.length);
    }

    // Si no hay productos vendidos, usar productos con más stock
    if (popularProducts.length === 0) {
      console.log(' No hay productos vendidos, usando productos con más stock');
      popularProducts = await Product.find()
        .sort({ disponibles: -1, createdAt: -1 })
        .limit(3)
        .lean();
    }
    
    const formattedProducts = popularProducts.map(product => ({
      id: product._id,
      name: product.nombre,
      price: product.precio,
      image: product.imagen || '/src/assets/llavero.png',
      category: product.categoria,
      description: product.descripcion,
      stock: product.disponibles,
      totalSold: product.totalSold || 0 // Agregar cantidad vendida si está disponible
    }));
    
    console.log(' Productos formateados para el carrusel:', formattedProducts.length);
    
    res.json({
      success: true,
      products: formattedProducts,
      total: formattedProducts.length,
      timestamp: new Date().toISOString(),
      message: popularProducts.length > 0 && popularProducts[0].totalSold 
        ? 'Productos más vendidos basados en ventas reales' 
        : 'Productos con más stock disponible'
    });
  } catch (error) {
    console.error('=== ERROR EN PRODUCTOS POPULARES ===');
    console.error('Tipo de error:', error.name);
    console.error('Mensaje:', error.message);
    console.error('Stack:', error.stack);
    console.error('Estado de MongoDB:', mongoose.connection.readyState);
    
    // En caso de error, devolver productos de ejemplo
    const fallbackProducts = [
      {
        id: 'error-fallback-1',
        name: 'Llavero de Ejemplo',
        price: 15000,
        image: '/src/assets/llavero.png',
        category: 'Llavero',
        description: 'Producto de ejemplo mientras se soluciona el error',
        stock: 10
      }
    ];
    
    res.json({
      success: true,
      products: fallbackProducts,
      total: fallbackProducts.length,
      timestamp: new Date().toISOString(),
      message: 'Error en base de datos, mostrando productos de ejemplo'
    });
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