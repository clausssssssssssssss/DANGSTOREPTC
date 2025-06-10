// index.js
import app from './app.js';
import { connectDB } from './database.js';
import { config } from './src/config.js';

async function main() {
  await connectDB();                             // primero conecta a la BD
  app.listen(config.server.port, () => {
    console.log(`Server corriendo en puerto ${config.server.port}`);
  });
}

main();
