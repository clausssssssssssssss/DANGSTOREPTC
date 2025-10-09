// src/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import { config } from "../../config.js";
import customersModel from "../models/Customers.js";

const authMiddleware = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      const token =
        authHeader && authHeader.startsWith("Bearer ")
          ? authHeader.split(" ")[1]
          : req.cookies.authToken;

      if (!token) {
        return res
          .status(401)
          .json({ success: false, message: "No autenticado" });
      }

      const decoded = jwt.verify(token, config.jwt.secret);
      
      //  COMENTAR ESTOS
      // console.log('Token decodificado:', {
      //   userId: decoded.userId,
      //   userType: decoded.userType,
      //   decodedKeys: Object.keys(decoded)
      // });

      const userType = decoded.userType.toLowerCase();

      let userData;
      if (userType === "customer") {
        userData = await customersModel
          .findById(decoded.userId)
          .select("-password");
        
        //  COMENTAR ESTOS
        // console.log('Customer encontrado en DB:', !!userData);
        // if (userData) {
        //   console.log('Customer data keys:', Object.keys(userData));
        // }
      } else if (userType === "admin") {
        userData = {
          userId: decoded.userId || decoded.email, 
          userType: "admin",
          email: decoded.email,
        };
      } else {
        return res
          .status(401)
          .json({ success: false, message: "Tipo de usuario inválido" });
      }

      if (!userData) {
        return res
          .status(404)
          .json({ success: false, message: "Usuario no encontrado" });
      }

      if (
        allowedRoles.length > 0 &&
        !allowedRoles.map(r => r.toLowerCase()).includes(userType)
      ) {
        return res
          .status(403)
          .json({ success: false, message: "Permiso denegado" });
      }

      req.user = userData;
      req.userType = userType;
      
      // COMENTAR ESTE
      // console.log('Middleware inyectando usuario:', {
      //   userId: userData.userId || userData.id,
      //   userType: userType,
      //   userDataKeys: Object.keys(userData)
      // });
      
      next();
    } catch (error) {
      console.error("authMiddleware error:", error); // ✅ ESTE SÍ DÉJALO (para errores)
      return res
        .status(401)
        .json({ success: false, message: "Token inválido o expirado" });
    }
  };
};

// Middleware para verificar que el usuario esté autenticado
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : req.cookies.authToken;

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No autenticado" });
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    const userType = decoded.userType.toLowerCase();

    let userData;
    if (userType === "customer") {
      userData = await customersModel
        .findById(decoded.userId)
        .select("-password");
    } else if (userType === "admin") {
      userData = {
        userId: decoded.userId || decoded.email,
        userType: "admin",
        email: decoded.email,
      };
    } else {
      return res
        .status(401)
        .json({ success: false, message: "Tipo de usuario inválido" });
    }

    if (!userData) {
      return res
        .status(404)
        .json({ success: false, message: "Usuario no encontrado" });
    }

    req.user = userData;
    req.userType = userType;
    next();
  } catch (error) {
    console.error("verifyToken error:", error);
    return res
      .status(401)
      .json({ success: false, message: "Token inválido o expirado" });
  }
};

// Middleware para verificar que el usuario sea admin
export const verifyAdmin = (req, res, next) => {
  if (!req.user) {
    return res
      .status(401)
      .json({ success: false, message: "No autenticado" });
  }

  if (req.userType !== "admin") {
    return res
      .status(403)
      .json({ success: false, message: "Acceso denegado. Se requiere rol de administrador" });
  }

  next();
};

export default authMiddleware;