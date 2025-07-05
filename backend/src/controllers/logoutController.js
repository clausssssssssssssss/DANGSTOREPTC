const logoutController = {};
import clientsModel from "../models/Client.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// CREATE: Crea un nuevo modelo
logoutController.logout = async (req, res) => {
   // Borrar la cookie 'authToken' con las mismas opciones usadas para crearla
   res.clearCookie('authToken', { 
     httpOnly: true,
     path: '/',
     sameSite: 'lax',
     secure: process.env.NODE_ENV === 'production'
   });
 
 
   // Enviar una respuesta indicando que el logout fue exitoso
   return res.status(200).json({ message: 'Logged out successfully' });
 };
 

export default logoutController;
