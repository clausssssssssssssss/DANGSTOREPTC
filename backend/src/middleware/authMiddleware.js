import jwt from "jsonwebtoken";
import { config } from '../../config.js';
import customersModel from "../models/Customers.js";

/**
 * authMiddleware([allowedRoles])
 *  - Si allowedRoles está vacío: permite cualquier usuario autenticado.
 *  - Si allowedRoles incluye roles (e.g. ['admin']): solo deja pasar a esos userTypes.
 */
const authMiddleware = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      // 1) Extraer token de header o cookie
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : req.cookies.authToken;

      if (!token) {
        return res.status(401).json({ success: false, message: "No autenticado" });
      }

      // 2) Verificar token y loggear payload
      const decoded = jwt.verify(token, config.jwt.secret);
      console.log("→ authMiddleware: decoded:", decoded, "allowedRoles:", allowedRoles);

      // 3) Cargar datos de usuario según userType
      let userData;
      if (decoded.userType === "customer") {
        userData = await customersModel.findById(decoded.userId).select("-password");
        console.log("→ authMiddleware: userData (customer):", userData);
      } else if (decoded.userType === "admin") {
        // No tenemos tabla de admins; confiamos en el payload del token
        userData = { userId: decoded.userId, userType: "admin", email: decoded.email };
        console.log("→ authMiddleware: userData (admin):", userData);
      } else {
        return res.status(401).json({ success: false, message: "Tipo de usuario inválido" });
      }

      if (!userData) {
        return res.status(404).json({ success: false, message: "Usuario no encontrado" });
      }

      // 4) Verificar roles permitidos
      if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.userType)) {
        return res.status(403).json({ success: false, message: "Permiso denegado" });
      }

      // 5) Inyectar datos y continuar
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
