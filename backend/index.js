// importo el archivo app.js
import app from "./app.js";
import "./database.js";
import { config } from "./src/config.js";

// Creo una función
// que se encarga de ejecutar el servidor
async function main() {
  app.listen(config.server.port);
  console.log("Server on port " + config.server.port);
}
//Ejecutamos todo
main();
