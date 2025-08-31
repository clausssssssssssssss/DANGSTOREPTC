const Product = require('../models/Product');

exports.getProducts = async (req, res) => {
  const productos = await Product.find();
  res.json(productos);
};

exports.createProduct = async (req, res) => {
  try {
    const { nombre, descripcion, precio, disponibles, categoria } = req.body;
    const imagen = req.file ? req.file.path : null;
    const producto = new Product({
      nombre,
      descripcion,
      precio,
      disponibles,
      categoria,
      imagen,
    });
    await producto.save();
    res.status(201).json(producto);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear producto' });
  }
};