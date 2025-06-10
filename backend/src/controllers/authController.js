import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import jwt    from 'jsonwebtoken';
import { config } from '../config.js';   

//REGISTER
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Validar campos
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    // 2. Comprobar si el email ya existe
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Correo ya registrado' });
    }

    // 3. Encriptar contraseña
    const salt   = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    // 4. Crear usuario
    const user = await User.create({ name, email, password: hashed });

    // 5. Generar JWT
    const token = jwt.sign(
      { id: user._id },
      config.jwt.secret,
      { expiresIn: config.jwt.expire }
    );

    // 6. Enviar cookie al cliente
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,    // en producción: true
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    });

    // 7. Responder con usuario (sin password)
    res.status(201).json({
      message: 'Usuario registrado',
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

//LOGIN
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validar campos
    if (!email || !password) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    // 2. Verificar existencia de usuario
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Correo no registrado' });
    }

    // 3. Comparar contraseñas
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: 'Contraseña incorrecta' });
    }

    // 4. Generar nuevo JWT
    const token = jwt.sign(
      { id: user._id },
      config.jwt.secret,
      { expiresIn: config.jwt.expire }
    );

    // 5. Enviar cookie al cliente
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    });

    // 6. Responder con datos del usuario
    res.status(200).json({
      message: 'Login exitoso',
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};
