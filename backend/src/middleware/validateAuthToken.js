import jwt from "jsonwebtoken";
import { config } from '../../config.js';

export default function validateAuthToken(allowedUserTypes = []) {
  return (req, res, next) => {
    try {
      const authHeader = req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }

      const decoded = jwt.verify(token, config.jwt.secret);
      // Aquí reasigno userId → id para unificar con req.user.id
      req.user = {
        id:        decoded.userId,
        userType:  decoded.userType,
      };

      if (
        allowedUserTypes.length > 0 &&
        !allowedUserTypes.includes(req.user.userType)
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
