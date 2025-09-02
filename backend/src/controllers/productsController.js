import Product from '../models/Product.js';

export const getProducts = async (req, res) => {
  try {
    const productos = await Product.find();
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { nombre, descripcion, precio, disponibles, categoria } = req.body;
    const imagen = req.file ? req.file.path : null;
    
    const producto = new Product({
      nombre,
      descripcion,
      precio: parseFloat(precio),
      disponibles: parseInt(disponibles),
      categoria,
      imagen,
    });
    
    await producto.save();
    res.status(201).json(producto);
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ error: 'Error al crear producto' });
  }
};