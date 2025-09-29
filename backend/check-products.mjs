import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './src/models/Product.js';

dotenv.config();

// Conectar a MongoDB
await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dangstore', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function checkProducts() {
  try {
    console.log('🔍 Verificando productos en la base de datos...');
    
    const products = await Product.find({}, 'nombre disponibles stock').limit(10);
    
    console.log('📦 Productos encontrados:');
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.nombre} - Disponibles: ${product.disponibles || product.stock || 0}`);
    });
    
    // Buscar específicamente "Cosito"
    const cosito = await Product.findOne({ nombre: /cosito/i });
    if (cosito) {
      console.log('\n🎯 Producto "Cosito" encontrado:');
      console.log('- ID:', cosito._id);
      console.log('- Nombre:', cosito.nombre);
      console.log('- Disponibles:', cosito.disponibles || cosito.stock || 0);
      console.log('- Tiene stock disponible:', cosito.hasStockAvailable ? cosito.hasStockAvailable(1) : 'Método no disponible');
    } else {
      console.log('\n❌ Producto "Cosito" no encontrado');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

await checkProducts();
