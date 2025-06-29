import jwt from "jsonwebtoken";
import { config } from "../config.js";
import customersModel from "../models/Customers.js";
import adminModel from "../models/Admin.js"; // 👈 este es el nuevo modelo

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.authToken;

    if (!token) {
      return res.status(401).json({ success: false, message: "No autenticado" });
    }

    const decoded = jwt.verify(token, config.jwt.secret);

    let userData;
    let userType;

    if (decoded.userType === "customer") {
      userData = await customersModel.findById(decoded.userId).select("-password");
      userType = "customer";
    } else if (decoded.userType === "admin") {
      userData = await adminModel.findById(decoded.userId).select("-password");
      userType = "admin";
    } else {
      return res.status(401).json({ success: false, message: "Tipo de usuario inválido" });
    }

    if (!userData) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    req.user = userData;
    req.userType = userType;
    next();
  } catch (error) {
    console.error("authMiddleware error:", error);
    return res.status(401).json({ success: false, message: "Token inválido o expirado" });
  }
};

export default authMiddleware;
