// src/middleware/validateAuthToken.js
import jwt from "jsonwebtoken";
import { config } from "../config.js";

/**
 * Middleware para validar el JWT de autenticación.
 *
 * Si se pasa un array de `allowedUserTypes`, restringe el acceso
 * a usuarios con esos roles.
 *
 * @param {Array<string>} [allowedUserTypes=[]] - Tipos de usuario permitidos
 * @returns {import('express').RequestHandler}
 */
function validateAuthToken(allowedUserTypes = []) {
  return (req, res, next) => {
    try {
      const authHeader = req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }

      const decoded = jwt.verify(token, config.jwt.secret);
      req.user = decoded;

      // Verificar roles permitidos si los hay
      if (
        allowedUserTypes.length > 0 &&
        !allowedUserTypes.includes(decoded.userType)
      ) {
        return res
          .status(403)
          .json({ message: "Access denied: insufficient permissions" });
      }

      next();
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res
          .status(403)
          .json({ message: "Token expired, please log in again" });
      }
      if (err.name === "JsonWebTokenError") {
        return res.status(403).json({ message: "Invalid token" });
      }

      return res
        .status(500)
        .json({ message: "Internal server error", error: err.message });
    }
  };
}

// Exportación por defecto para facilidad de import
export default validateAuthToken;
