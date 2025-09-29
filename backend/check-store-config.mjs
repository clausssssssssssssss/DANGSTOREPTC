import mongoose from 'mongoose';
import dotenv from 'dotenv';
import StoreConfig from './src/models/StoreConfig.js';

dotenv.config();

// Conectar a MongoDB
await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dangstore', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function checkAndUpdateConfig() {
  try {
    console.log('🔍 Verificando configuración actual...');
    
    let config = await StoreConfig.findOne();
    
    if (!config) {
      console.log('❌ No hay configuración encontrada');
      return;
    }
    
    console.log('📊 Configuración actual:');
    console.log('- Límite semanal de pedidos:', config.orderLimits.weeklyMaxOrders);
    console.log('- Pedidos actuales esta semana:', config.orderLimits.currentWeekOrders);
    console.log('- Límite de catálogo:', config.stockLimits.catalog.defaultMaxStock);
    console.log('- Ventas actuales del catálogo:', config.stockLimits.catalog.currentWeekSales);
    
    // Actualizar límite de pedidos a 10 para el catálogo
    if (config.orderLimits.weeklyMaxOrders !== 10) {
      console.log('🔄 Actualizando límite de pedidos a 10...');
      config.orderLimits.weeklyMaxOrders = 10;
      await config.save();
      console.log('✅ Límite actualizado a 10');
    }
    
    // Asegurar que el límite del catálogo esté en 10
    if (config.stockLimits.catalog.defaultMaxStock !== 10) {
      console.log('🔄 Actualizando límite del catálogo a 10...');
      config.stockLimits.catalog.defaultMaxStock = 10;
      await config.save();
      console.log('✅ Límite del catálogo actualizado a 10');
    }
    
    console.log('🎉 Configuración actualizada correctamente');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

await checkAndUpdateConfig();
