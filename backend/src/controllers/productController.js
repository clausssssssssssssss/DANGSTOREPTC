// src/controllers/productController.js
import Product from "../models/Product.js";
import Order from "../models/Order.js";

/**
 * GET /api/products
 * Soporta búsqueda por nombre, filtro por categoría y paginación.
 * Query params opcionales: search, category, page (página), limit (por página)
 */
export const getProducts = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 12 } = req.query;
    const filter = {};

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    if (category) {
      filter.category = category;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [total, products] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter)
        .skip(skip)
        .limit(Number(limit))
    ]);

    res.json({
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      totalItems: total,
      items: products
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Error fetching products" });
  }
};

/**
 * GET /api/products/popular
 * Devuelve los productos más vendidos usando aggregation de Order.
 */
export const getPopularProducts = async (req, res) => {
  try {
    const popular = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.product', sold: { $sum: '$items.quantity' } } },
      { $sort: { sold: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          id: '$product._id',
          name: '$product.name',
          price: '$product.price',
          images: '$product.images',
          sold: 1
        }
      }
    ]);

    res.json(popular);
  } catch (error) {
    console.error("Error fetching popular products:", error);
    res.status(500).json({ message: "Error fetching popular products" });
  }
};

/**
 * GET /api/products/:id
 * Devuelve detalles de un producto por su ID.
 */
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Error fetching product" });
  }
};

/**
 * POST /api/products
 * Crea un nuevo producto.
 */
export const insertProduct = async (req, res) => {
  try {
    const { name, price, stock, description, category, images } = req.body;
    if (!name || price == null || stock == null || !category) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const newProduct = new Product({ name, price, stock, description, category, images });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Error creating product" });
  }
};

/**
 * PUT /api/products/:id
 * Actualiza un producto existente.
 */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updated = await Product.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!updated) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(updated);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Error updating product" });
  }
};

/**
 * DELETE /api/products/:id
 * Elimina un producto.
 */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Error deleting product" });
  }
};
