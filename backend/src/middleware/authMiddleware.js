import jwt from 'jsonwebtoken';

/**
 * Middleware para autenticar solicitudes usando JWT almacenado en cookies.
 */
const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Aqui se puede incluir el email o el id.
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export default authMiddleware;
