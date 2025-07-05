import productModel from "../models/Product.js";

const productController = {};

// Obtener todos los productos
productController.getProducts = async (req, res) => {
  try {
    const products = await productModel.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error });
  }
};

// Obtener producto por ID
productController.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productModel.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Error fetching product", error });
  }
};

// Obtener productos populares (ejemplo simple)
productController.getPopularProducts = async (req, res) => {
  try {
    const popularProducts = await productModel.find().limit(5);
    res.json(popularProducts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching popular products", error });
  }
};

// Crear un nuevo producto
productController.insertProduct = async (req, res) => {
  try {
    const { name, price, stock, description, category, images } = req.body;
    if (!name || price == null || stock == null || !category) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const newProduct = new productModel({ name, price, stock, description, category, images });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Error creating product" });
  }
};

// Actualizar un producto existente
productController.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updated = await productModel.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!updated) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(updated);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Error updating product" });
  }
};

// Eliminar un producto
productController.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await productModel.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Error deleting product" });
  }
};

export default productController;
