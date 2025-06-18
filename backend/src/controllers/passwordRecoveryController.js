import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import clientsModel from "../models/client.js";
import { sendEmail, HTMLRecoveryEmail } from "../utils/passwordRecoveryMail.js";
import { config } from "../config.js";

const passwordRecoveryController = {};

// 1) Solicitar código de verificación
passwordRecoveryController.requestCode = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    // Solo buscamos en la colección de clientes
    const client = await clientsModel.findOne({ email });
    if (!client) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generar un código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Crear token JWT con email, código y verified=false
    const token = jwt.sign(
      { email, code, verified: false },
      config.jwt.secret,
      { expiresIn: "15m" }
    );

    // Guardar el token en una cookie httpOnly
    res.cookie("tokenRecoveryCode", token, {
      httpOnly: true,
      secure: false,
      maxAge: 15 * 60 * 1000,
    });

    // Enviar correo con el código
    await sendEmail(
      email,
      "Password Recovery Code",
      `Your verification code is: ${code}`,
      HTMLRecoveryEmail(code)
    );

    return res.status(200).json({ message: "Verification code sent to email" });
  } catch (error) {
    console.error("Error sending recovery code:", error);
    return res.status(500).json({
      message: "Error sending verification code",
      error: error.message,
    });
  }
};

// 2) Verificar el código enviado por email
passwordRecoveryController.verifyCode = (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ message: "Code is required" });
  }

  try {
    const token = req.cookies.tokenRecoveryCode;
    if (!token) {
      return res.status(401).json({ message: "Token is missing, unauthorized" });
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    if (decoded.code !== code) {
      return res.status(403).json({ message: "Invalid code" });
    }

    // Reemitir token con verified=true
    const newToken = jwt.sign(
      { email: decoded.email, code: decoded.code, verified: true },
      config.jwt.secret,
      { expiresIn: "15m" }
    );

    res.cookie("tokenRecoveryCode", newToken, {
      httpOnly: true,
      secure: false,
      maxAge: 15 * 60 * 1000,
    });

    return res.status(200).json({ message: "Code verified successfully" });
  } catch (error) {
    console.error("Error verifying code:", error);
    if (error.name === "TokenExpiredError") {
      return res.status(403).json({ message: "Token expired, please request a new code" });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(403).json({ message: "Invalid token" });
    }
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// 3) Reestablecer contraseña
passwordRecoveryController.resetPassword = async (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword) {
    return res.status(400).json({ message: "New password is required" });
  }

  try {
    const token = req.cookies.tokenRecoveryCode;
    if (!token) {
      return res.status(401).json({ message: "Token is missing, unauthorized" });
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    if (!decoded.verified) {
      return res.status(400).json({ message: "Code not verified, cannot reset password" });
    }

    // Encontrar el cliente por email en el payload
    const client = await clientsModel.findOne({ email: decoded.email });
    if (!client) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    client.password = hashedPassword;
    await client.save();

    // Limpiar la cookie de recuperación
    res.clearCookie("tokenRecoveryCode");

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    if (error.name === "TokenExpiredError") {
      return res.status(403).json({ message: "Token expired, please request a new code" });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(403).json({ message: "Invalid token" });
    }
    return res.status(500).json({ message: "Error resetting password", error: error.message });
  }
};

export default passwordRecoveryController;
