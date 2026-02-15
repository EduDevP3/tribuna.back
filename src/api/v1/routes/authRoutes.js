import { Router } from 'express';
import { login, register, changePassword } from '../controllers/auth.Controller'; // Importamos las funciones del controlador
import { authenticateToken } from '../middlewares/authMiddleware';
import { loginLimiter } from '../middlewares/rateLimitMiddleware'; // Importar el limiter
const router = Router();

// Definimos las rutas para login y registro
router.post('/login', loginLimiter, login);  // Aplicar limiter a la ruta de login
router.post('/register', register);  // Ruta para registro

// Ruta protegida, requiere autenticación
router.post('/change-password', authenticateToken, changePassword);

router.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: `Acceso permitido, bienvenido ${req.userTk.nombre}` });
});
export default router;  // Usamos `export default` para exportar las rutas

// Ruta para cerrar sesión
router.post('/logout', (req, res) => {
  // Limpiar la cookie de autenticación con las mismas opciones de seguridad que al crearla
  res.clearCookie('authToken', {
    httpOnly: true,
    secure: true,
    sameSite: 'None'
  });

  res.status(200).json({ message: 'Sesión cerrada correctamente' });
});