import bcrypt from "bcryptjs";
import Customer from "../models/Customers.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import AdminProfile from "../models/AdminProfile.js";
// import { v2 as cloudinary } from 'cloudinary';
import { config } from '../../config.js';

// Inicializar cloudinary si hay variables
// cloudinary.config({
//   cloud_name: config.cloudinary.cloudinary_name,
//   api_key: config.cloudinary.cloudinary_api_key,
//   api_secret: config.cloudinary.cloudinary_api_secret,
// });

/**
 * Controlador para gestionar las acciones del perfil de usuario.
 */
const profileController = {

  /**
   * GET /api/profile
   * Obtiene los datos del usuario autenticado.
   */
  getProfile: async (req, res) => {
    console.log('Usuario en req.user:', req.user);
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Usuario no autenticado" });
      }

      if (req.userType === 'admin') {
        const emailKey = (req.user.email || '').toLowerCase();
        const profile = await AdminProfile.findOne({ email: emailKey });
        if (profile) {
          return res.json({
            name: profile.name || '',
            email: profile.email || emailKey,
            contactEmail: profile.contactEmail || profile.email || emailKey,
            profileImage: profile.profileImage || '',
          });
        }
        return res.json({ name: '', email: emailKey, contactEmail: emailKey, profileImage: '' });
      }

      // Customer por defecto
      const userData = {
        name: req.user.name || "",
        email: req.user.email || "",
        telephone: req.user.telephone || "",
        address: req.user.address || ""
      };
      res.json(userData);
    } catch (error) {
      console.error("getProfile error:", error);
      res.status(500).json({ message: "Error al obtener perfil" });
    }
  },

  /**
   * PUT /api/profile
   * Actualiza datos personales: nombre, teléfono y email.
   */
  updateProfile: async (req, res) => {
    try {
      const userType = req.userType;
      // Si es admin, actualiza AdminProfile, sino mantiene el comportamiento previo (customer)
      if (userType === 'admin') {
        const { name, email, profileImage, contactEmail } = req.body;
        const emailKey = (req.user?.email || email || '').toLowerCase();
        if (!emailKey) {
          return res.status(400).json({ message: 'Email del admin requerido' });
        }
        const update = {
          ...(name ? { name } : {}),
          ...(email ? { email: email.toLowerCase() } : {}),
          ...(contactEmail ? { contactEmail: contactEmail.toLowerCase() } : {}),
        };

        // Si viene imagen como data URI/base64, súbela a Cloudinary
        if (profileImage && typeof profileImage === 'string' && profileImage.startsWith('data:image')) {
          try {
            const uploadResult = await cloudinary.uploader.upload(profileImage, {
              folder: 'dangstore/admin_profiles',
              overwrite: true,
              invalidate: true,
            });
            update.profileImage = uploadResult.secure_url;
          } catch (e) {
            console.error('Error subiendo imagen de admin a Cloudinary:', e);
          }
        }
        const doc = await AdminProfile.findOneAndUpdate(
          { email: emailKey },
          { $set: update, $setOnInsert: { email: emailKey } },
          { new: true, upsert: true }
        );
        return res.json({ message: 'Perfil admin actualizado', profile: doc });
      }

      // Customer existente
      const { name, telephone, email, address } = req.body;
      if (email) {
        const exists = await Customer.findOne({ email: email.toLowerCase() });
        if (exists && exists._id.toString() !== req.user._id.toString()) {
          return res.status(400).json({ message: "Email ya en uso" });
        }
        req.user.email = email.toLowerCase();
      }
      req.user.name      = name      || req.user.name;
      req.user.telephone = telephone || req.user.telephone;
      req.user.address   = address   || req.user.address;
      await req.user.save();
      res.json({ message: "Perfil actualizado", user: req.user });
    } catch (err) {
      console.error("updateProfile error:", err);
      res.status(500).json({ message: "Error al actualizar perfil" });
    }
  },

  /**
   * PUT /api/profile/password
   * Cambia la contraseña: requiere la actual y la nueva.
   */
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword, confirmPassword } = req.body;

      // Verificar coincidencia de nuevas contraseñas
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: "Las nuevas contraseñas no coinciden" });
      }

      // Recargar usuario para incluir campo password
      const user = await Customer.findById(req.user._id).select('+password');
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      // Verificar contraseña actual
      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) {
        return res.status(400).json({ message: "Contraseña actual incorrecta" });
      }

      // Hashear y guardar nueva contraseña
      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();

      res.json({ message: "Contraseña actualizada" });

    } catch (err) {
      console.error("changePassword error:", err);
      res.status(500).json({ message: "Error al cambiar contraseña" });
    }
  },

  /**
   * GET /api/profile/orders
   * Devuelve el historial de pedidos del usuario.
   */
  getOrders: async (req, res) => {
    try {
// Después
const orders = await Order.find({ user: req.user._id })
  .populate('items.product', 'name price')
  .sort({ createdAt: -1 });

      res.json(orders);
    } catch (err) {
      console.error("getOrders error:", err);
      res.status(500).json({ message: "Error al obtener pedidos" });
    }
  },

  /**
   * GET /api/profile/favorites
   * Devuelve los productos favoritos con detalles (nombre e imagen).
   */
  getFavorites: async (req, res) => {
    try {
      const favorites = req.user.favorites || [];
      const products = await Product.find({ _id: { $in: favorites } })
        .select("name images");
      res.json(products);
    } catch (err) {
      console.error("getFavorites error:", err);
      res.status(500).json({ message: "Error al obtener favoritos" });
    }
  },

  /**
   * POST /api/profile/favorites/:productId
   * Alterna (agrega o quita) un producto a favoritos.
   */
  toggleFavorite: async (req, res) => {
    try {
      const productId = req.params.productId;
      const index = req.user.favorites.findIndex(
        fav => fav.toString() === productId
      );

      if (index > -1) {
        // Quitar de favoritos
        req.user.favorites.splice(index, 1);
        await req.user.save();
        return res.json({ message: "Producto eliminado de favoritos", favorites: req.user.favorites });
      }

      // Agregar a favoritos
      req.user.favorites.push(productId);
      await req.user.save();
      res.json({ message: "Producto agregado a favoritos", favorites: req.user.favorites });

    } catch (err) {
      console.error("toggleFavorite error:", err);
      res.status(500).json({ message: "Error al actualizar favoritos" });
    }
  }

};

export default profileController;
