const productController = {};
import productModel from "../models/Product.js";

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

// Crear producto
productController.insertProduct = async (req, res) => {
    try {
        const { name, price, stock, description, category, images } = req.body;

        if (!name || price == null || stock == null || !category) {
            return res.status(400).json({ message: "Missing required fields: name, price, stock, or category" });
        }

        const newProduct = new productModel({
            name,
            price,
            stock,
            description,
            category,
            images
        });

        await newProduct.save();
        res.status(201).json({ message: "Product Added", product: newProduct });

    } catch (error) {
        res.status(500).json({ message: "Error creating product", error });
    }
};

// Eliminar producto
productController.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await productModel.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json({ message: "Product Deleted" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting product", error });
    }
};

// Actualizar producto
productController.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, stock, description, category, images } = req.body;

        const updatedProduct = await productModel.findByIdAndUpdate(
            id,
            { name, price, stock, description, category, images },
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json({ message: "Product Updated", product: updatedProduct });
    } catch (error) {
        res.status(500).json({ message: "Error updating product", error });
    }
};

// Obtener productos por categoría
productController.getProductsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const products = await productModel.find({ category });

        if (!products.length) {
            return res.status(404).json({ message: "No products found in this category" });
        }

        res.json(products);
    } catch (error) {
        res.status(500).json({ message: "Error fetching products by category", error });
    }
};

export default productController;
