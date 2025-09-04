import Category from "../models/Category.js";

const categoryController = {};

// Crear una nueva categoría
categoryController.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "El nombre de la categoría es obligatorio" });
    }

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(409).json({ message: "La categoría ya existe" });
    }

    const newCategory = await Category.create({ name, description });
    res.status(201).json({
      message: "Categoría creada correctamente",
      category: newCategory
    });
  } catch (error) {
    console.error("Error al crear categoría:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Obtener todas las categorías
categoryController.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    res.status(500).json({ message: "Error al obtener categorías" });
  }
};

// Obtener categoría por ID
categoryController.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }

    res.json(category);
  } catch (error) {
    console.error("Error al obtener categoría:", error);
    res.status(500).json({ message: "Error al obtener categoría" });
  }
};

// Actualizar categoría
categoryController.updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }

    res.json({
      message: "Categoría actualizada correctamente",
      category: updatedCategory
    });
  } catch (error) {
    console.error("Error al actualizar categoría:", error);
    res.status(500).json({ message: "Error al actualizar categoría" });
  }
};

// Eliminar categoría
categoryController.deleteCategory = async (req, res) => {
  try {
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);

    if (!deletedCategory) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }

    res.json({ message: "Categoría eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar categoría:", error);
    res.status(500).json({ message: "Error al eliminar categoría" });
  }
};

export default categoryController;
