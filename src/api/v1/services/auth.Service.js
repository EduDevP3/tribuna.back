// src/api/v1/services/authService.js
import jwt from 'jsonwebtoken';
import { User } from '../models/userModel'; // Modelo de usuario
import config from '../../../config/config'; // Configuración para JWT

// Función para generar un token JWT
const generateToken = (userData) => {
  const payload = {
    id: userData._id,
    nombre: userData.nombre,
    role: userData.role,
  };
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn: '3h' }); // Token vlido por 3 hora
};

export const loginService = async (nombre, contraseña) => {
  try {
    const user = await User.findOne({ nombre }).select("+contraseña");

    if (!user) {
      console.log("❌ Usuario no encontrado");
      return { error: "Usuario no encontrado", status: 401 };
    }

    const isMatch = await user.comparePassword(contraseña);
    if (!isMatch) {
      console.log("❌ Contraseña incorrecta");
      return { error: "Contraseña incorrecta", status: 401 };
    }

    const token = generateToken(user);
    return { token, user: { id: user._id, nombre: user.nombre, role: user.role }, status: 200 };
  } catch (error) {
    console.error("❌ Error en loginService:", error.message);
    throw new Error("Error interno del servidor");
  }
};


export const registerService = async (nombre, contraseña) => {
  try {
    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ nombre });
    if (existingUser) {
      return { error: "Este nombre de usuario ya está registrado." };
    }

    // Si el usuario no existe, proceder con el registro normal
    const newUser = new User({
      nombre,
      contraseña,
    });
    await newUser.save();

    const token = generateToken(newUser);

    return {
      message: "Usuario registrado exitosamente.",
      token
    };
  } catch (error) {
    console.error("❌ Error en registerService:", error.message);
    throw new Error("Error interno del servidor");
  }
};

export const updatePasswordService = async (userId, oldPassword, newPassword) => {
  try {
    const user = await User.findById(userId).select("+contraseña");
    if (!user) {
      return { error: "Usuario no encontrado", status: 404 };
    }

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return { error: "La contraseña antigua es incorrecta", status: 400 };
    }

    user.contraseña = newPassword;
    await user.save();

    return { message: "Contraseña actualizada exitosamente", status: 200 };
  } catch (error) {
    console.error("❌ Error en updatePasswordService:", error.message);
    throw new Error("Error interno del servidor");
  }
};
