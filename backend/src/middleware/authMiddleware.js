import jwt from "jsonwebtoken";
import { config } from '../../config.js';
import customersModel from "../models/Customers.js";
import adminModel from "../models/Admin.js";

const authMiddleware = async (req, res, next) => {
  try {
    // 1) intenta extraer el token de Authorization o de la cookie
    const authHeader = req.headers.authorization;
    let token = authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : req.cookies.authToken;

    if (!token) {
      return res.status(401).json({ success: false, message: "No autenticado" });
    }

    // 2) verifica el token
    const decoded = jwt.verify(token, config.jwt.secret);

    // 3) carga el usuario según decoded.userType
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

    req.user     = userData;
    req.userType = decoded.userType;
    next();
  } catch (error) {
    console.error("authMiddleware error:", error);
    return res.status(401).json({ success: false, message: "Token inválido o expirado" });
  }
};

export default authMiddleware;
