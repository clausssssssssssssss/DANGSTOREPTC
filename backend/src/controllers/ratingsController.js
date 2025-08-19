import Rating from "../models/Ratings.js";
import Customer from "../models/Customers.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

const ratingsController = {};

// Obtener todas las reseñas de un producto
ratingsController.getProductRatings = async (req, res) => {
  console.log('GETPRODUCTRATINGS EJECUTÁNDOSE para producto:', req.params.productId);
  try {
    const { productId } = req.params;
    
    // Validar que el productId sea válido
    if (!productId) {
      return res.status(400).json({ message: "ID de producto requerido" });
    }

    console.log('Buscando reseñas para producto:', productId);
    
    // Buscar todas las reseñas del producto con información del cliente
    const ratings = await Rating.find({ id_product: productId })
      .populate('id_customer', 'name')
      .sort({ createdAt: -1 });
    
    console.log('Reseñas encontradas:', ratings.length);
    console.log('Reseñas:', ratings);

    // Calcular promedio y total
    const totalRatings = ratings.length;
    const averageRating = totalRatings > 0 
      ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / totalRatings 
      : 0;

    // Formatear las reseñas para incluir el nombre del cliente
    const formattedRatings = ratings.map(rating => ({
      _id: rating._id,
      rating: rating.rating,
      comment: rating.comment,
      customerName: rating.id_customer?.name || 'Cliente',
      createdAt: rating.createdAt,
      updatedAt: rating.updatedAt
    }));

    console.log('Enviando respuesta:', {
      ratings: formattedRatings.length,
      totalRatings,
      averageRating: Math.round(averageRating * 10) / 10
    });
    
    res.json({
      ratings: formattedRatings,
      totalRatings,
      averageRating: Math.round(averageRating * 10) / 10 // Redondear a 1 decimal
    });

  } catch (error) {
    console.error("Error obteniendo reseñas del producto:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Crear una nueva reseña
ratingsController.createRating = async (req, res) => {
  try {
    const { id_product, id_customer, rating, comment } = req.body;

    // Validar datos requeridos
    if (!id_product || !id_customer || !rating || !comment) {
      return res.status(400).json({ 
        message: "Todos los campos son obligatorios" 
      });
    }

    // Validar que el rating esté entre 1 y 5
    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return res.status(400).json({ 
        message: "La puntuación debe ser un número entero entre 1 y 5" 
      });
    }

    // Validar que el comentario no esté vacío
    if (!comment.trim()) {
      return res.status(400).json({ 
        message: "El comentario no puede estar vacío" 
      });
    }

    // Verificar que el producto existe
    const product = await Product.findById(id_product);
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    // Verificar que el cliente existe
    const customer = await Customer.findById(id_customer);
    if (!customer) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    // Verificar que el cliente haya comprado el producto
    const hasPurchased = await Order.findOne({
      user: id_customer,
      "items.product": id_product,
      status: "COMPLETED"
    });

    if (!hasPurchased) {
      return res.status(403).json({ 
        message: "Debes comprar este producto antes de poder dejar una reseña" 
      });
    }

    // Verificar si el cliente ya tiene una reseña para este producto
    const existingRating = await Rating.findOne({ 
      id_product, 
      id_customer 
    });

    if (existingRating) {
      return res.status(400).json({ 
        message: "Ya tienes una reseña para este producto. Puedes editarla o eliminarla." 
      });
    }

    // Crear la nueva reseña
    const newRating = new Rating({
      id_product,
      id_customer,
      rating,
      comment: comment.trim()
    });

    await newRating.save();

    // Poblar la información del cliente para la respuesta
    await newRating.populate('id_customer', 'name');

    res.status(201).json({
      _id: newRating._id,
      rating: newRating.rating,
      comment: newRating.comment,
      customerName: newRating.id_customer.name,
      createdAt: newRating.createdAt,
      updatedAt: newRating.updatedAt
    });

  } catch (error) {
    console.error("Error creando reseña:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

  // Actualizar una reseña existente
  ratingsController.updateRating = async (req, res) => {
    try {
      const { ratingId } = req.params;
      const { rating, comment } = req.body;
      const customerId = req.user?._id || req.user?.userId; // El middleware inyecta req.user._id

    // Validar datos requeridos
    if (!rating || !comment) {
      return res.status(400).json({ 
        message: "Puntuación y comentario son obligatorios" 
      });
    }

    // Validar que el rating esté entre 1 y 5
    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return res.status(400).json({ 
        message: "La puntuación debe ser un número entero entre 1 y 5" 
      });
    }

    // Validar que el comentario no esté vacío
    if (!comment.trim()) {
      return res.status(400).json({ 
        message: "El comentario no puede estar vacío" 
      });
    }

    // Buscar la reseña
    const existingRating = await Rating.findById(ratingId);
    if (!existingRating) {
      return res.status(404).json({ message: "Reseña no encontrada" });
    }

    // Verificar que el cliente sea el propietario de la reseña
    if (existingRating.id_customer.toString() !== customerId) {
      return res.status(403).json({ 
        message: "No tienes permisos para editar esta reseña" 
      });
    }

    // Verificar que el cliente haya comprado el producto (para actualizaciones)
    const hasPurchased = await Order.findOne({
      user: customerId,
      "items.product": existingRating.id_product,
      status: "COMPLETED"
    });

    if (!hasPurchased) {
      return res.status(403).json({ 
        message: "Debes comprar este producto antes de poder dejar una reseña" 
      });
    }

    // Actualizar la reseña
    existingRating.rating = rating;
    existingRating.comment = comment.trim();
    existingRating.updatedAt = new Date();

    await existingRating.save();

    // Poblar la información del cliente para la respuesta
    await existingRating.populate('id_customer', 'name');

    res.json({
      _id: existingRating._id,
      rating: existingRating.rating,
      comment: existingRating.comment,
      customerName: existingRating.id_customer.name,
      createdAt: existingRating.createdAt,
      updatedAt: existingRating.updatedAt
    });

  } catch (error) {
    console.error("Error actualizando reseña:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

  // Eliminar una reseña
  ratingsController.deleteRating = async (req, res) => {
    try {
      const { ratingId } = req.params;
      const customerId = req.user?._id || req.user?.userId; // El middleware inyecta req.user._id

    // Buscar la reseña
    const rating = await Rating.findById(ratingId);
    if (!rating) {
      return res.status(404).json({ message: "Reseña no encontrada" });
    }

    // Verificar que el cliente sea el propietario de la reseña
    if (rating.id_customer.toString() !== customerId) {
      return res.status(403).json({ 
        message: "No tienes permisos para eliminar esta reseña" 
      });
    }

    // Verificar que el cliente haya comprado el producto (para eliminaciones)
    const hasPurchased = await Order.findOne({
      user: customerId,
      "items.product": rating.id_product,
      status: "COMPLETED"
    });

    if (!hasPurchased) {
      return res.status(403).json({ 
        message: "Debes comprar este producto antes de poder dejar una reseña" 
      });
    }

    // Eliminar la reseña
    await Rating.findByIdAndDelete(ratingId);

    res.json({ message: "Reseña eliminada exitosamente" });

  } catch (error) {
    console.error("Error eliminando reseña:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Verificar si un usuario puede dejar reseña para un producto
ratingsController.canUserRate = async (req, res) => {
  console.log('CANUSERRATE EJECUTÁNDOSE para producto:', req.params.productId);
  try {
    const { productId } = req.params;
    const customerId = req.user?._id || req.user?.userId;
    
    // Debug: mostrar qué se está recibiendo
    console.log('canUserRate recibiendo:', {
      productId,
      customerId,
      reqUser: req.user,
      reqUserKeys: req.user ? Object.keys(req.user) : 'undefined'
    });

    if (!productId) {
      return res.status(400).json({ message: "ID de producto requerido" });
    }

    if (!customerId) {
      console.log('No customerId encontrado, req.user:', req.user);
      return res.status(401).json({ 
        canRate: false, 
        message: "Debes iniciar sesión para dejar reseñas" 
      });
    }

    // Verificar que el producto existe
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    // Verificar si ya tiene una reseña
    const existingRating = await Rating.findOne({ 
      id_product: productId, 
      id_customer: customerId 
    });

    if (existingRating) {
      return res.json({ 
        canRate: true, 
        message: "Ya tienes una reseña para este producto",
        existingRating: true
      });
    }

    // Verificar si ha comprado el producto
    const hasPurchased = await Order.findOne({
      user: customerId,
      "items.product": productId,
      status: "COMPLETED"
    });

    if (!hasPurchased) {
      return res.json({ 
        canRate: false, 
        message: "Debes comprar este producto antes de poder dejar una reseña" 
      });
    }

    return res.json({ 
      canRate: true, 
      message: "Puedes dejar una reseña para este producto" 
    });

  } catch (error) {
    console.error("Error verificando si usuario puede reseñar:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Obtener estadísticas de ratings para un producto
ratingsController.getProductRatingStats = async (req, res) => {
  try {
    const { productId } = req.params;
    
    if (!productId) {
      return res.status(400).json({ message: "ID de producto requerido" });
    }

    // Agregación para obtener estadísticas
    const stats = await Rating.aggregate([
      { $match: { id_product: productId } },
      {
        $group: {
          _id: null,
          totalRatings: { $sum: 1 },
          averageRating: { $avg: "$rating" },
          ratingDistribution: {
            $push: "$rating"
          }
        }
      }
    ]);

    if (stats.length === 0) {
      return res.json({
        totalRatings: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      });
    }

    const { totalRatings, averageRating, ratingDistribution } = stats[0];
    
    // Calcular distribución de ratings
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingDistribution.forEach(rating => {
      distribution[rating]++;
    });

    res.json({
      totalRatings,
      averageRating: Math.round(averageRating * 10) / 10,
      ratingDistribution: distribution
    });

  } catch (error) {
    console.error("Error obteniendo estadísticas de ratings:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export default ratingsController;
