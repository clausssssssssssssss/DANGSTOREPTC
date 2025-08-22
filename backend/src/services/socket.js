import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

let io = null;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Middleware de autenticación para Socket.io
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Token de autenticación requerido'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('Usuario no encontrado'));
      }

      socket.userId = user._id.toString();
      next();
    } catch (error) {
      next(new Error('Token inválido'));
    }
  });

  io.on('connection', (socket) => {
    console.log('Usuario conectado al socket:', socket.userId);

    // Unir al usuario a su sala personal
    socket.join(`user-${socket.userId}`);

    socket.on('disconnect', () => {
      console.log('Usuario desconectado del socket:', socket.userId);
    });

    socket.on('join-notifications', () => {
      console.log(`Usuario ${socket.userId} se unió a notificaciones`);
    });

    socket.on('error', (error) => {
      console.error('Error de socket:', error);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io no inicializado');
  }
  return io;
};