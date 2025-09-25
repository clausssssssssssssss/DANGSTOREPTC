import { v2 as cloudinary } from 'cloudinary';
import productModel from "../models/Product.js";
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
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      // Campos adicionales para compatibilidad
      name: product.nombre,
      description: product.descripcion,
      price: product.precio,
      stock: product.disponibles,
      category: product.categoria,
      images: product.imagen ? [product.imagen] : []
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
    
    // Validar formato del ID
    if (!id || id.length !== 24) {
      return res.status(400).json({ message: "ID de producto inválido" });
    }
    
    const product = await productModel.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    // Transformar para compatibilidad
    const transformedProduct = {
      _id: product._id,
      nombre: product.nombre,
      descripcion: product.descripcion,
      precio: product.precio,
      disponibles: product.disponibles,
      categoria: product.categoria,
      imagen: product.imagen,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      // Campos adicionales para compatibilidad
      name: product.nombre,
      description: product.descripcion,
      price: product.precio,
      stock: product.disponibles,
      category: product.categoria,
      images: product.imagen ? [product.imagen] : []
    };

    res.json(transformedProduct);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ message: "Error al obtener producto", error: error.message });
  }
};

// Obtener productos populares
productController.getPopularProducts = async (req, res) => {
  try {
    const popularProducts = await productModel.find().limit(5).lean();
    
    // Aplicar la misma transformación
    const transformedProducts = popularProducts.map(product => ({
      _id: product._id,
      nombre: product.nombre,
      descripcion: product.descripcion,
      precio: product.precio,
      disponibles: product.disponibles,
      categoria: product.categoria,
      imagen: product.imagen,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      // Compatibilidad
      name: product.nombre,
      description: product.descripcion,
      price: product.precio,
      stock: product.disponibles,
      category: product.categoria,
      images: product.imagen ? [product.imagen] : []
    }));

    res.json(transformedProducts);
  } catch (error) {
    console.error('Error al obtener productos populares:', error);
    res.status(500).json({ message: "Error al obtener productos populares", error: error.message });
  }
};

// Crear un nuevo producto
productController.insertProduct = async (req, res) => {
  try {
    // DEBUG: Ver qué datos llegan exactamente
    console.log('=== DEBUG: Creando producto ===');
    console.log('req.body:', JSON.stringify(req.body, null, 2));
    console.log('req.file:', req.file ? {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : 'No hay archivo');
    console.log('================================');

    // Extraer datos con flexibilidad para ambos formatos
    const nombre = req.body.nombre || req.body.name;
    const descripcion = req.body.descripcion || req.body.description;
    const precio = req.body.precio || req.body.price;
    const disponibles = req.body.disponibles || req.body.stock;
    const categoria = req.body.categoria || req.body.category;

    // DEBUG: Ver valores extraídos
    console.log('Valores extraídos:');
    console.log('nombre:', nombre);
    console.log('descripcion:', descripcion);
    console.log('precio:', precio, 'tipo:', typeof precio);
    console.log('disponibles:', disponibles, 'tipo:', typeof disponibles);
    console.log('categoria:', categoria);

    // Validación detallada
    const errors = [];
    
    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
      errors.push('nombre es requerido y debe ser una cadena válida');
    }
    
    if (precio === undefined || precio === null || precio === '') {
      errors.push('precio es requerido');
    } else {
      const precioNum = parseFloat(precio);
      if (isNaN(precioNum) || precioNum < 0) {
        errors.push('precio debe ser un número válido mayor o igual a 0');
      }
    }
    
    if (disponibles === undefined || disponibles === null || disponibles === '') {
      errors.push('disponibles es requerido');
    } else {
      const disponiblesNum = parseInt(disponibles);
      if (isNaN(disponiblesNum) || disponiblesNum < 0) {
        errors.push('disponibles debe ser un número entero válido mayor o igual a 0');
      }
    }
    
    if (!categoria || typeof categoria !== 'string' || categoria.trim() === '') {
      errors.push('categoria es requerida y debe ser una cadena válida');
    }

    if (errors.length > 0) {
      console.log('❌ Errores de validación:', errors);
      return res.status(400).json({ 
        message: "Datos de producto inválidos", 
        errors: errors,
        receivedFields: Object.keys(req.body),
        receivedData: req.body
      });
    }

    let imageUrl = null;

    // Procesar imagen si se envió
    if (req.file) {
      try {
        console.log('📸 Subiendo imagen a Cloudinary...');
        const result = await uploadToCloudinary(req.file.buffer);
        imageUrl = result.secure_url;
        console.log('✅ Imagen subida exitosamente:', imageUrl);
      } catch (uploadError) {
        console.error('❌ Error al subir imagen a Cloudinary:', uploadError);
        return res.status(500).json({ 
          message: "Error al subir la imagen", 
          error: uploadError.message 
        });
      }
    }

    // Crear el producto
    const productData = {
      nombre: nombre.trim(),
      descripcion: (descripcion || '').trim(),
      precio: parseFloat(precio),
      disponibles: parseInt(disponibles),
      categoria: categoria.trim(),
      imagen: imageUrl
    };

    console.log('💾 Creando producto con datos:', productData);

    const newProduct = new productModel(productData);
    await newProduct.save();
    
    console.log('✅ Producto creado exitosamente:', {
      id: newProduct._id,
      nombre: newProduct.nombre,
      precio: newProduct.precio
    });

    // Devolver producto con campos de compatibilidad
    const responseProduct = {
      _id: newProduct._id,
      nombre: newProduct.nombre,
      descripcion: newProduct.descripcion,
      precio: newProduct.precio,
      disponibles: newProduct.disponibles,
      categoria: newProduct.categoria,
      imagen: newProduct.imagen,
      createdAt: newProduct.createdAt,
      updatedAt: newProduct.updatedAt,
      // Compatibilidad
      name: newProduct.nombre,
      description: newProduct.descripcion,
      price: newProduct.precio,
      stock: newProduct.disponibles,
      category: newProduct.categoria,
      images: newProduct.imagen ? [newProduct.imagen] : []
    };

    res.status(201).json(responseProduct);
  } catch (error) {
    console.error('❌ Error al crear producto:', error);
    
    // Manejar errores específicos de Mongoose
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));
      
      return res.status(400).json({ 
        message: 'Error de validación del modelo', 
        errors: validationErrors
      });
    }
    
    // Error de conexión a la base de datos
    if (error.name === 'MongooseError' || error.name === 'MongoError') {
      return res.status(500).json({ 
        message: 'Error de base de datos', 
        error: error.message 
      });
    }
    
    // Error general
    res.status(500).json({ 
      message: 'Error interno al crear producto', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Actualizar un producto existente
productController.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('=== DEBUG: Actualizando producto ===');
    console.log('ID:', id);
    console.log('req.body:', JSON.stringify(req.body, null, 2));
    console.log('req.file:', req.file ? 'Archivo presente' : 'No hay archivo');
    
    // Validar formato del ID
    if (!id || id.length !== 24) {
      return res.status(400).json({ message: "ID de producto inválido" });
    }

    const product = await productModel.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Extraer datos con flexibilidad
    const nombre = req.body.nombre || req.body.name;
    const descripcion = req.body.descripcion || req.body.description;
    const precio = req.body.precio || req.body.price;
    const disponibles = req.body.disponibles || req.body.stock;
    const categoria = req.body.categoria || req.body.category;

    // Actualizar campos solo si se proporcionan
    if (nombre !== undefined) {
      if (typeof nombre !== 'string' || nombre.trim() === '') {
        return res.status(400).json({ message: 'nombre debe ser una cadena válida' });
      }
      product.nombre = nombre.trim();
    }
    
    if (descripcion !== undefined) {
      product.descripcion = (descripcion || '').trim();
    }
    
    if (precio !== undefined) {
      const precioNum = parseFloat(precio);
      if (isNaN(precioNum) || precioNum < 0) {
        return res.status(400).json({ message: 'precio debe ser un número válido mayor o igual a 0' });
      }
      product.precio = precioNum;
    }
    
    if (disponibles !== undefined) {
      const disponiblesNum = parseInt(disponibles);
      if (isNaN(disponiblesNum) || disponiblesNum < 0) {
        return res.status(400).json({ message: 'disponibles debe ser un número entero válido mayor o igual a 0' });
      }
      product.disponibles = disponiblesNum;
    }
    
    if (categoria !== undefined) {
      if (typeof categoria !== 'string' || categoria.trim() === '') {
        return res.status(400).json({ message: 'categoria debe ser una cadena válida' });
      }
      product.categoria = categoria.trim();
    }

    // Procesar nueva imagen si se envió
    if (req.file) {
      try {
        console.log('📸 Actualizando imagen en Cloudinary...');
        const result = await uploadToCloudinary(req.file.buffer);
        product.imagen = result.secure_url;
        console.log('✅ Imagen actualizada exitosamente:', result.secure_url);
      } catch (uploadError) {
        console.error('❌ Error al subir imagen a Cloudinary:', uploadError);
        return res.status(500).json({ 
          message: "Error al subir la imagen", 
          error: uploadError.message 
        });
      }
    }

    await product.save();
    
    console.log('✅ Producto actualizado exitosamente:', product.nombre);

    // Devolver producto con campos de compatibilidad
    const responseProduct = {
      _id: product._id,
      nombre: product.nombre,
      descripcion: product.descripcion,
      precio: product.precio,
      disponibles: product.disponibles,
      categoria: product.categoria,
      imagen: product.imagen,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      // Compatibilidad
      name: product.nombre,
      description: product.descripcion,
      price: product.precio,
      stock: product.disponibles,
      category: product.categoria,
      images: product.imagen ? [product.imagen] : []
    };

    res.json(responseProduct);
  } catch (error) {
    console.error('❌ Error al actualizar producto:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));
      
      return res.status(400).json({ 
        message: 'Error de validación del modelo', 
        errors: validationErrors
      });
    }
    
    res.status(500).json({ 
      message: 'Error al actualizar producto', 
      error: error.message 
    });
  }
};

// Eliminar un producto por su ID
productController.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('=== DEBUG: Eliminando producto ===');
    console.log('ID:', id);

    // Validar formato del ID
    if (!id || id.length !== 24) {
      return res.status(400).json({ message: "ID de producto inválido" });
    }

    const deleted = await productModel.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    console.log('✅ Producto eliminado exitosamente:', deleted.nombre);
    res.json({ 
      message: "Producto eliminado exitosamente", 
      deletedProduct: {
        id: deleted._id,
        nombre: deleted.nombre
      }
    });
  } catch (error) {
    console.error("❌ Error al eliminar producto:", error);
    res.status(500).json({ 
      message: "Error al eliminar producto", 
      error: error.message 
    });
  }
};

export default productController;