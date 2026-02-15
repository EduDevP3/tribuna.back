// src/api/v1/controllers/authController.js
import { loginService, registerService, updatePasswordService } from '../services/auth.Service';
import { loginSchema, registerSchema } from '../validations/auth.validation';

// ... (login and register)

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.userTk.id;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Se requieren la contraseña antigua y la nueva" });
    }

    const result = await updatePasswordService(userId, oldPassword, newPassword);

    if (result.error) {
      return res.status(result.status).json({ message: result.error });
    }

    return res.json({ message: result.message });
  } catch (error) {
    console.error("❌ Error en el controlador de changePassword:", error.message);
    return res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
};

// Lógica para el login de usuario
export const login = async (req, res) => {
  try {
    // 1. Validar entrada
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { nombre, contraseña } = req.body;
    const result = await loginService(nombre, contraseña);

    // Verifica si hubo un error en loginService
    if (result.error) {
      return res.status(result.status || 401).json({ message: result.error });
    }

    // Configuramos la cookie de autenticación con opciones de seguridad

    res.cookie("authToken", result.token, {

      httpOnly: true, // No accesible desde JavaScript (protege contra XSS)

      secure: process.env.NODE_ENV === 'production', // Requiere HTTPS en producción

      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // Permite compartir cookies entre diferentes dominios en prod, 'Lax' para dev

      maxAge: 3600000, // Expira en 1 hora (3600000 ms)

    });

    return res.json({ message: "Inicio de sesión exitoso", token: result.token, user: result.user });
  } catch (error) {
    console.error("❌ Error en el controlador de login:", error.message);
    return res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
};


// Lógica para el registro de usuario
export const register = async (req, res) => {
  try {
    // 1. Validar entrada
    const { error } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { nombre, contraseña } = req.body;

    // Llamamos al servicio de registro
    const result = await registerService(nombre, contraseña);

    if (result.error) {
      return res.status(400).json({ message: result.error });
    }

    return res.status(201).json({ message: result.message, token: result.token });
  } catch (error) {
    console.error('Error en el controlador de registro:', error.message);
    return res.status(500).json({ message: 'Error al registrar el usuario', error: error.message });
  }
};
