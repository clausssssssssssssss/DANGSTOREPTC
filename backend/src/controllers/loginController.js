// src/controllers/loginController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Customer from "../models/Customers.js";
import { config } from '../../config.js';

/**
 * Controlador para el login de un cliente.
 * Normaliza email, incluye contraseña con select('+password'), compara hash
 * y firma un JWT con userType para distinguir customer/admin.
 */


//Declarar dos constatnes Una que guarde el maximo de intentos posibleas y otra que guarde el tiempo de bloqueo

const maxAttempts = 3;
const locktime = 16 * 60 * 1000;

export const loginClient = async (req, res) => {
  try {
    // 1) Normalizar entrada
    const email    = req.body.email.trim().toLowerCase();
    const password = req.body.password;
    console.log('→ Login attempt:', email);

    // 2) Buscar cliente por email e INCLUIR el campo password
    const customer = await Customer
      .findOne({ email })
      .select('+password');

    console.log('→ Found user, hashed password:', customer?.password);

    // 3) Si no existe el cliente
    if (!customer) {
      return res.status(401).json({ message: "Email no registrado" });
    }


      if(customer.locktime > Date.now()) {
          const minutosRestantes = Math.ceil
            ((customer.locktime - Date.now())   / 60000
           );
            return res.status(403).json({
          message: "Cuenta bloqueada, intenta de nuevo en " + minutosRestantes  + " minutos",
        });
         }
         
        
      const isMatch = await bcrypt.compare(password, customer.password);
      if (!isMatch) {
        //Si la contraseña es incorrecta
        //incrementar el numero de intentos fallidos
        customer.loginAttempts = customer.loginAttempts + 1;

        if (customer.loginAttempts > maxAttempts) {
          customer.locktime = Date.now() + locktime;
          await customer.save();
          return res.status(403).json({ message: "Usuario bloqueado" });
        }

        await customer.save();

        return res.json({ message: "Invalid password" });
       

      customer.loginAttempts = 0;
      customer.locktime = null;
      await customer.save();
    }

    // 4) Comparar contraseña en texto plano con el hash almacenado
    const valid = await bcrypt.compare(password, customer.password);
    console.log('→ bcrypt.compare:', valid);

    if (!valid) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    // 5) Crear y firmar el JWT
    const payload = {
      userId:   customer._id,
      userType: "customer"
    };
    const token = jwt.sign(payload, config.jwt.secret, { expiresIn: '1h' });

    // 6) Responder con token y datos (sin password)
    return res.status(200).json({
      message: "Login exitoso",
      token,
      user: {
        id:        customer._wid,
        name:      customer.name,
        email:     customer.email,
        telephone: customer.telephone
      }
    });

  } catch (error) {
    console.error("Error en loginClient:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};
