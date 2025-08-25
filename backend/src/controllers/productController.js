import { v2 as cloudinary } from 'cloudinary';
import productModel from "../models/Product.js";
import { config } from '../../config.js';

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

// obtener todos los productos
productController.getProducts = async (req, res) => {
  try {
    // Usar .lean() para devolver objetos JS puros y no documentos mongoose
    const products = await productModel.find().lean();

    // Garantizar que images exista y sea array
    const fixedProducts = products.map(p => ({
      ...p,
      images: Array.isArray(p.images) ? p.images : []
    }));

    res.json(fixedProducts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error });
  }
};

// obtener un producto por su ID
productController.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productModel.findById(id); // busco producto por id

    if (!product) {
      return res.status(404).json({ message: "Product not found" }); // si no lo encuentro aviso
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Error fetching product", error });
  }
};

//  obtener productos populares (solo ejemplo)
productController.getPopularProducts = async (req, res) => {
  try {
    const popularProducts = await productModel.find().limit(5); // traigo máximo 5
    res.json(popularProducts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching popular products", error });
  }
};

//  crear un nuevo producto
productController.insertProduct = async (req, res) => {
  try {
    const { name, price, stock, description, category } = req.body;

    if (!name || price == null || stock == null || !category) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let imageUrls = [];

    if (req.files && req.files.length > 0) {
      imageUrls = await Promise.all(
        req.files.map(file => uploadToCloudinary(file.buffer))
      );
    }

    const newProduct = new productModel({
      name,
      price,
      stock,
      description,
      category,
      images: imageUrls.map(result => result.secure_url)
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Error creating product', error });
  }
};  

//  actualizar un producto existente
productController.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, stock, description, category } = req.body;

    const product = await productModel.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Actualizar campos básicos
    if (name !== undefined) product.name = name;
    if (price !== undefined) product.price = price;
    if (stock !== undefined) product.stock = stock;
    if (description !== undefined) product.description = description;
    if (category !== undefined) product.category = category;

    // Procesar nuevas imágenes si se envían
    if (req.files && req.files.length > 0) {
      const uploadedImages = await Promise.all(
        req.files.map(file => uploadToCloudinary(file.buffer))
      );

      // REEMPLAZAR imágenes actuales por nuevas
      product.images = uploadedImages.map(result => result.secure_url);

      // Si quieres conservar las anteriores y agregar las nuevas:
      // product.images.push(...uploadedImages.map(r => r.secure_url));
    }

    await product.save();
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Error updating product', error });
  }
};


// eliminar un producto por su ID
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
