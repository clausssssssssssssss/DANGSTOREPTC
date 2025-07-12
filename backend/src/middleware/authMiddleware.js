// src/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import { config } from "../../config.js";
import customersModel from "../models/Customers.js";

/**
 * authMiddleware([allowedRoles])
 *  - Si allowedRoles está vacío: permite cualquier usuario autenticado.
 *  - Si allowedRoles incluye roles (e.g. ['admin']): solo deja pasar a esos userTypes.
 */
const authMiddleware = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      // 1️⃣ Extraer token
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : req.cookies.authToken;

      if (!token) {
        console.log("🚫 No token provided");
        return res.status(401).json({ success: false, message: "No autenticado" });
      }

      // 2️⃣ Verificar token
      const decoded = jwt.verify(token, config.jwt.secret);
      console.log("✅ Token decoded:", decoded, "| allowedRoles:", allowedRoles);

      // Convertir userType a minúsculas para evitar problemas de case sensitivity
      const userType = decoded.userType.toLowerCase();

      // 3️⃣ Cargar usuario desde DB si es customer
      let userData;
      if (userType === "customer") {
        userData = await customersModel.findById(decoded.userId).select("-password");
        console.log("📄 Customer loaded from DB:", userData);

      } else if (userType === "admin") {
        // Si es admin, no hay modelo: lo tomamos del payload
        userData = { userId: decoded.userId, userType: "admin", email: decoded.email };
        console.log("👑 Admin from token:", userData);

      } else {
        console.log("🚫 Invalid userType:", decoded.userType);
        return res.status(401).json({ success: false, message: "Tipo de usuario inválido" });
      }

      if (!userData) {
        console.log("🚫 Usuario no encontrado en DB");
        return res.status(404).json({ success: false, message: "Usuario no encontrado" });
      }

      // 4️⃣ Verificar roles permitidos (usar también userType en minúsculas)
      if (allowedRoles.length > 0 && !allowedRoles.includes(userType)) {
        console.log("🚫 Rol no permitido:", userType);
        return res.status(403).json({ success: false, message: "Permiso denegado" });
      }

      // 5️⃣ Inyectar datos y continuar
      req.user = userData;
      req.userType = userType;
      console.log("✅ Usuario autenticado:", req.user);
      next();

    } catch (error) {
      console.error("🔥 authMiddleware error:", error);
      return res.status(401).json({ success: false, message: "Token inválido o expirado" });
    }
  };
};

export default authMiddleware;
