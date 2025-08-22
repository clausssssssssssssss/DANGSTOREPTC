// backend/server.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { server } from './app.js';

// Configurar variables de entorno
dotenv.config();

const PORT = process.env.PORT || 4000;

// Conectar a MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Conectado a MongoDB');
    
    // Iniciar servidor
    server.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
      console.log(`📱 WebSocket activo para notificaciones en tiempo real`);
      console.log(`🔗 Health check disponible en: http://localhost:${PORT}/api/health`);
    });
  })
  .catch((error) => {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  });

// Manejar cierre graceful
process.on('SIGINT', async () => {
  console.log('\n🛑 Apagando servidor...');
  await mongoose.connection.close();
  process.exit(0);
});