import app from "./app.js";
import "./database.js";
import { config } from "./config.js";

async function main() {
  try {
    // Iniciar servidor
    const server = app.listen(config.server.port, () => {
      console.log(` Server running on port ${config.server.port}`);
      console.log(` Environment: ${config.server.env}`);
      console.log(` API URL: http://localhost:${config.server.port}`);
    });

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