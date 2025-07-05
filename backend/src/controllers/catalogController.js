import Product from "../models/Product.js"; // importamos el modelo Product

const catalogController = {};

/**
 * GET /api/catalog
 * Devuelve todos los productos, o filtra por nombre, categoría o rango de precio.
 * Se leen los filtros desde req.query (parámetros de la URL).
 */
catalogController.getCatalog = async (req, res) => {
  try {
    const query = {}; // aquí construiremos los filtros dinámicos

    const { search, category, minPrice, maxPrice } = req.query;

    // Si viene un parámetro `search`, se hace una búsqueda parcial en el nombre (insensible a mayúsculas)
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    // Si viene `category`, se filtra por categoría exacta
    if (category) {
      query.category = category;
    }

    // Si viene minPrice o maxPrice, se construye un rango de precios
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice); // precio >= minPrice
      if (maxPrice) query.price.$lte = Number(maxPrice); // precio <= maxPrice
    }

    // Ejecutar la consulta con los filtros que se hayan definido
    const products = await Product.find(query)
      .select("-__v") // opcional: excluir el campo __v que agrega mongoose
      .lean();        // opcional: devuelve objetos JS planos, no documentos de Mongoose

    res.json(products);
  } catch (error) {
    console.error("Error en getCatalog:", error);
    res.status(500).json({ message: "Error al obtener catálogo" });
  }
};

export default catalogController;
