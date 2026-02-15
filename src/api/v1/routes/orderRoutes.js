import { Router } from 'express';
import {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrder,
} from '../controllers/order.Controller.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { authenticateClientToken } from '../middlewares/clientAuthMiddleware.js';

const router = Router();


router.post('/', authenticateClientToken, createOrder);
router.get('/', authenticateToken, getOrders);
router.get('/:id', authenticateToken, getOrderById);
router.put('/:id/status', authenticateToken, updateOrderStatus);
router.delete('/:id', authenticateToken, deleteOrder);

export default router;
