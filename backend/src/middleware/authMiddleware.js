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
      const token =
        authHeader && authHeader.startsWith("Bearer ")
          ? authHeader.split(" ")[1]
          : req.cookies.authToken;

      if (!token) {
        console.log("🚫 No token provided");
        return res
          .status(401)
          .json({ success: false, message: "No autenticado" });
      }

      // 2️⃣ Verificar token
      const decoded = jwt.verify(token, config.jwt.secret);
      
      // Debug: mostrar qué se decodificó del token
      console.log('🔍 Token decodificado:', {
        userId: decoded.userId,
        userType: decoded.userType,
        decodedKeys: Object.keys(decoded)
      });

      // Convertir userType a minúsculas para evitar problemas de case sensitivity
      const userType = decoded.userType.toLowerCase();

      // 3️⃣ Cargar usuario desde DB si es customer
      let userData;
      if (userType === "customer") {
        console.log('🔍 Buscando customer en DB con ID:', decoded.userId);
        userData = await customersModel
          .findById(decoded.userId)
          .select("-password");
        console.log('🔍 Customer encontrado en DB:', !!userData);
        if (userData) {
          console.log('🔍 Customer data keys:', Object.keys(userData));
        }
      } else if (userType === "admin") {
        userData = {
          userId: decoded.userId,
          userType: "admin",
          email: decoded.email,
        };
      } else {
        console.log("🚫 Invalid userType:", decoded.userType);
        return res
          .status(401)
          .json({ success: false, message: "Tipo de usuario inválido" });
      }

      if (!userData) {
        console.log("🚫 Usuario no encontrado en DB");
        return res
          .status(404)
          .json({ success: false, message: "Usuario no encontrado" });
      }

      // 4️⃣ Verificar roles permitidos (sin importar mayúsculas/minúsculas)
      if (
        allowedRoles.length > 0 &&
        !allowedRoles.map(r => r.toLowerCase()).includes(userType)
      ) {
        console.log("🚫 Rol no permitido:", userType);
        return res
          .status(403)
          .json({ success: false, message: "Permiso denegado" });
      }

      // 5️⃣ Inyectar datos y continuar
      req.user = userData;
      req.userType = userType;
      
      // Debug: mostrar qué se está inyectando
      console.log('🔍 Middleware inyectando usuario:', {
        userId: userData.userId || userData.id,
        userType: userType,
        userDataKeys: Object.keys(userData)
      });
      
      next();
    } catch (error) {
      console.error("🔥 authMiddleware error:", error);
      return res
        .status(401)
        .json({ success: false, message: "Token inválido o expirado" });
    }
  };
};

export default authMiddleware;
