import jwt from "jsonwebtoken";  // Biblioteca para generar/verificar JWT
import { config } from "../../config.js";  // Configuración de entorno (credenciales, secretos)

export const loginAdmin = async (req, res) => {
  // DEBUG: Mostrar credenciales de admin cargadas
  console.log(">>> DEBUG config.admin =", config.admin);

  // DEBUG: Mostrar el contenido del body de la petición
  console.log(">>> DEBUG req.body =", req.body);

  try {
    // Desestructurar email y password del body
    const { email, password } = req.body;

    // Validar campos obligatorios
    if (!email || !password) {
      // Responder con error 400 si faltan datos
      return res.status(400).json({ message: "Email y contraseña son requeridos" });
    }


    console.log(">>> DEBUG Credenciales recibidasPPPPPPPPP:", { email, password });

    // Comparar con credenciales almacenadas
    if (email !== config.admin.email || password !== config.admin.password) {
      // Responder con error 401 si son inválidas
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // Construir payload para el JWT
    const payload = { userType: "admin", email };

    // Firmar token con secreto y expiración configurados
    const token = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,  // Tiempo de vida del token
    });

    // Responder con token y datos mínimos del usuario
    return res.status(200).json({
      message: "Inicio de sesión exitoso",
      token,
      user: { email, userType: "admin" },
    });
  } catch (err) {
    // Capturar errores inesperados y registrar
    console.error("Error en loginAdmin:", err);
    // Responder con error 500 e información del mensaje
    return res
      .status(500)
      .json({ message: "Error interno en servidor", error: err.message });
  }
};