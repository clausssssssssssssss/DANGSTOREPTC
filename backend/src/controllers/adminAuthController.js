import jwt from "jsonwebtoken";
import { config } from "../config.js";

export const loginAdmin = async (req, res) => {
  // 1) Imprime en consola qué está leyendo config.admin
  console.log(">>> DEBUG config.admin =", config.admin);

  // 2) Imprime en consola qué llegó en el body de la petición
  console.log(">>> DEBUG req.body =", req.body);

  try {
    const { email, password } = req.body;

    // 3) Validar que los campos no estén vacíos
    if (!email || !password) {
      return res.status(400).json({ message: "Email y contraseña son requeridos" });
    }

    // 4) Comparar con las credenciales del .env
    if (email !== config.admin.email || password !== config.admin.password) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // 5) Si coinciden, arma el payload para el JWT
    const payload = { userType: "admin", email };
    const token = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    // 6) Devuelve el token y los datos mínimos del usuario
    return res.status(200).json({
      message: "Inicio de sesión exitoso",
      token,
      user: { email, userType: "admin" },
    });
  } catch (err) {
    console.error("Error en loginAdmin:", err);
    return res
      .status(500)
      .json({ message: "Error interno en servidor", error: err.message });
  }
};
