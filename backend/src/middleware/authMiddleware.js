import jwt from "jsonwebtoken";
import { config } from '../../config.js';
import customersModel from "../models/Customers.js";
import adminModel from "../models/Admin.js";

/**
 * authMiddleware([allowedRoles])
 *  - Si allowedRoles está vacío: permite cualquier usuario autenticado.
 *  - Si allowedRoles incluye roles (e.g. ['admin']): sólo deja pasar a esos usuarios.
 */
const authMiddleware = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      // 1) Extraer token de header o cookie
      const authHeader = req.headers.authorization;
      let token = authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : req.cookies.authToken;

      if (!token) {
        return res.status(401).json({ success: false, message: "No autenticado" });
      }

      // 2) Verificar token
      const decoded = jwt.verify(token, config.jwt.secret);

      // 3) Cargar datos de usuario según su tipo
      let userData;
      if (decoded.userType === "customer") {
        userData = await customersModel.findById(decoded.userId).select("-password");
      } else if (decoded.userType === "admin") {
        userData = await adminModel.findById(decoded.userId).select("-password");
      } else {
        return res.status(401).json({ success: false, message: "Tipo de usuario inválido" });
      }

      if (!userData) {
        return res.status(404).json({ success: false, message: "Usuario no encontrado" });
      }

      // 4) Verificar roles si se especificaron
      if (
        Array.isArray(allowedRoles) &&
        allowedRoles.length > 0 &&
        !allowedRoles.includes(decoded.userType)
      ) {
        return res.status(403).json({ success: false, message: "Permiso denegado" });
      }

      // 5) Inyectar user y continuar
      req.user     = userData;
      req.userType = decoded.userType;
      next();
    } catch (error) {
      console.error("authMiddleware error:", error);
      return res.status(401).json({ success: false, message: "Token inválido o expirado" });
    }
  };
};

export default authMiddleware;
