import { Router } from 'express';
import { body } from 'express-validator';
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
} from '../controllers/category.Controller.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

// Validation chain for creating/updating a category
const categoryValidationRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Category name is required.')
    .isLength({ min: 2, max: 50 }).withMessage('Category name must be between 2 and 50 characters.'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters.')
];

// Public route to get all categories
router.get('/', getAllCategories);

// Public route to get a single category by ID
router.get('/:id', getCategoryById);

// Protected routes (all authenticated users are considered admins)
router.post('/', authenticateToken, categoryValidationRules, createCategory);
router.put('/:id', authenticateToken, categoryValidationRules, updateCategory);
router.delete('/:id', authenticateToken, deleteCategory);

export default router;
