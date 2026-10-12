import jwt from 'jsonwebtoken';
import config from '../../../config/config';

const SECRET_KEY = config.JWT_SECRET;

/**
 * Middleware para verificar el token JWT de Administradores.
 * Soporta autenticación híbrida: Cookie HttpOnly 'authToken' o Header 'Authorization: Bearer <token>'.
 */
export const authenticateToken = (req, res, next) => {
  let token = req.cookies && req.cookies.authToken;

  // Fallback seguro: Intentar obtener desde el header Authorization
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'No autorizado, token administrativo no encontrado' });
  }

  // Verificar el token usando la clave secreta
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token administrativo inválido o expirado' });
    }

    req.userTk = user;
    next();
  });
};
