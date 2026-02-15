// src/api/v1/routes/productRoutes.js
import { Router } from 'express';
import { 
    getProducts, 
    getProductById, 
    getAllProductsSimple,
    createProduct,
    updateProduct,
    deleteProduct
} from '../controllers/product.Controller.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

import { uploadSingleImage } from '../middlewares/multer.middleware.js';

const router = Router();

// --- Public or General Routes ---
router.get('/', getProducts);
router.get('/simple', getAllProductsSimple);
router.get('/:id', getProductById);

// --- Admin CRUD Routes ---
router.post(
    '/', 
    [authenticateToken,  uploadSingleImage], 
    createProduct
);

router.put(
    '/:id', 
    [authenticateToken, uploadSingleImage], 
    updateProduct
);

router.delete(
    '/:id', 
    [authenticateToken], 
    deleteProduct
);


export default router;
