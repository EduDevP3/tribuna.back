import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new Schema({
  nombre: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  contraseña: {
    type: String,
    required: true,
    select: false,
  },
 
}, {
  timestamps: true,
  versionKey: false,
});

// Hook para encriptar la contraseña antes de guardarla
userSchema.pre('save', async function (next) {
  if (!this.isModified('contraseña')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.contraseña = await bcrypt.hash(this.contraseña, salt);
  next();
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.contraseña);
};

export const User = model('User', userSchema);