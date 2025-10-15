import app from "./app.js";
import "./database.js";
import { config } from "./config.js";

async function main() {
  try {
    // Railway asigna automáticamente el puerto
    const PORT = process.env.PORT || config.server.port;
    
    // Iniciar servidor
    const server = app.listen(PORT, '0.0.0.0', () => {
    });

    // Ajustes de timeouts para evitar 502 por proxies cuando hay latencia
    // Mantener conexiones vivas un poco más y dar tiempo a headers
    server.keepAliveTimeout = 65000; // 65s
    server.headersTimeout = 66000;   // 66s

    // Manejo de cierre graceful
    const gracefulShutdown = (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      
      server.close(() => {
        console.log(' HTTP server closed');
        // Cerrar conexiones de base de datos u otros recursos aquí
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        console.error(' Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    // Manejadores de señales
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

    // Manejo de errores no capturados
    process.on('uncaughtException', (error) => {
      console.error(' Uncaught Exception:', error);
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error(' Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('UNHANDLED_REJECTION');
    });

  } catch (error) {
    console.error(' Failed to start server:', error);
    process.exit(1);
  }
}

// Ejecutar la aplicación
main();