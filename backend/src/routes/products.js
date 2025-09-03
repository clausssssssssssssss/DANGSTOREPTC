import express from 'express';
import multer from 'multer';
import path from 'path';
import Product from '../models/Product.js';

const router = express.Router();

// Configuración de multer para subir imágenes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

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
    if (!nombre || !precio || !disponibles) {
      return res.status(400).json({ error: 'Nombre, precio y disponibles son campos obligatorios' });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'La imagen es obligatoria' });
    }
    
    const nuevoProducto = new Product({
      nombre,
      descripcion: descripcion || '',
      precio: parseFloat(precio),
      disponibles: parseInt(disponibles),
      categoria: categoria || 'Llavero',
      imagen: req.file.filename
    });

    const productoGuardado = await nuevoProducto.save();
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
    
    const updateData = {
      nombre,
      descripcion,
      precio: parseFloat(precio),
      disponibles: parseInt(disponibles),
      categoria
    };
    
    // Si se subió una nueva imagen, actualizarla
    if (req.file) {
      updateData.imagen = req.file.filename;
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
    const productoEliminado = await Product.findByIdAndDelete(req.params.id);
    
    if (!productoEliminado) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;