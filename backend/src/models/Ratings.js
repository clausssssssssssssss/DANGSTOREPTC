import { Schema, model } from "mongoose";

/**
 * Esquema de datos para el modelo Rating.
 * Define la estructura de los documentos de reseñas en MongoDB.
 */
const ratingSchema = new Schema({
  /** ID del producto reseñado */
  id_product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
    index: true
  },

  /** ID del cliente que hizo la reseña */
  id_customer: {
    type: Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
    index: true
  },

  /** Puntuación de 1 a 5 estrellas */
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    validate: {
      validator: Number.isInteger,
      message: 'La puntuación debe ser un número entero'
    }
  },

  /** Comentario de la reseña */
  comment: {
    type: String,
    required: true,
    trim: true,
    minlength: [1, 'El comentario no puede estar vacío'],
    maxlength: [500, 'El comentario no puede exceder los 500 caracteres']
  }
}, {
  // Agrega campos createdAt y updatedAt automáticamente
  timestamps: true,
  
  // Índices compuestos para optimizar consultas
  indexes: [
    // Índice compuesto para evitar reseñas duplicadas del mismo cliente al mismo producto
    { 
      unique: true, 
      fields: { id_product: 1, id_customer: 1 } 
    },
    // Índice para consultas por producto
    { id_product: 1 },
    // Índice para consultas por cliente
    { id_customer: 1 },
    // Índice para ordenar por fecha de creación
    { createdAt: -1 }
  ]
});

/**
 * Middleware pre-save para validar que no haya reseñas duplicadas
 */
ratingSchema.pre('save', async function(next) {
  // Solo validar en nuevas reseñas
  if (this.isNew) {
    const existingRating = await this.constructor.findOne({
      id_product: this.id_product,
      id_customer: this.id_customer
    });
    
    if (existingRating) {
      const error = new Error('Ya existe una reseña de este cliente para este producto');
      return next(error);
    }
  }
  
  next();
});

/**
 * Método estático para obtener estadísticas de un producto
 */
ratingSchema.statics.getProductStats = async function(productId) {
  const stats = await this.aggregate([
    { $match: { id_product: productId } },
    {
      $group: {
        _id: null,
        totalRatings: { $sum: 1 },
        averageRating: { $avg: "$rating" },
        ratingDistribution: { $push: "$rating" }
      }
    }
  ]);

  if (stats.length === 0) {
    return {
      totalRatings: 0,
      averageRating: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }

  const { totalRatings, averageRating, ratingDistribution } = stats[0];
  
  // Calcular distribución de ratings
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratingDistribution.forEach(rating => {
    distribution[rating]++;
  });

  return {
    totalRatings,
    averageRating: Math.round(averageRating * 10) / 10,
    ratingDistribution: distribution
  };
};

/**
 * Método de instancia para formatear la reseña para respuesta
 */
ratingSchema.methods.toResponseFormat = function() {
  return {
    _id: this._id,
    rating: this.rating,
    comment: this.comment,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

/**
 * Modelo de Mongoose para colecciones de reseñas.
 */
export default model("Rating", ratingSchema);
