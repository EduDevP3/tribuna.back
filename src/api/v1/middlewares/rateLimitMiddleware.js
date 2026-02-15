import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Limita cada IP a 5 solicitudes de login
  message: "Demasiados intentos de login, intenta de nuevo en 15 minutos"
});
