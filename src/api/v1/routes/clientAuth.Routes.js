// src/api/v1/routes/clientAuth.Routes.js
import { Router } from 'express';
import { loginClient, registerClient } from '../controllers/clientAuth.Controller';

const router = Router();

// Rutas de autenticación de clientes
router.post('/register', registerClient);
router.post('/login', loginClient);

export default router;
