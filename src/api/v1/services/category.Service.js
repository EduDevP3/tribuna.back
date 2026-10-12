import Category from '../models/categoryModel.js';
import { isValidMongoId } from '../utils/security.utils.js';

/**
 * Creates a new category.
 * @param {object} categoryData - The data for the new category.
 * @returns {Promise<object>} The newly created category document.
 */
export const createCategoryService = async (categoryData) => {
  try {
    // Generate handle from name before creating the category instance
    const name = categoryData.name;
    const handle = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const newCategory = new Category({ ...categoryData, handle });
    await newCategory.save();
    return newCategory;
  } catch (error) {
    if (error.code === 11000) {
      throw new Error('A category with this name already exists.');
    }
    throw error;
  }
};

/**
 * Retrieves all categories from the database.
 * @returns {Promise<Array<object>>} A list of all categories.
 */
export const getAllCategoriesService = async (page = 1, limit) => {
  try {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    let categoriesQuery = Category.find({}).sort({ name: 1 });

    if (limit) {
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
      const skip = (pageNum - 1) * limitNum;
      categoriesQuery = categoriesQuery.skip(skip).limit(limitNum);
    }

    const categories = await categoriesQuery.lean();
    const total = await Category.countDocuments({});
    return { categories, total };
  } catch (error) {
    throw error;
  }
};

/**
 * Retrieves a single category by its ID.
 * @param {string} id - The ID of the category to retrieve.
 * @returns {Promise<object|null>} The category document or null if not found.
 */
export const getCategoryByIdService = async (id) => {
  try {
    if (!isValidMongoId(id)) return null;
    const category = await Category.findById(id).lean();
    return category;
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return null;
    }
    throw error;
  }
};

/**
 * Updates an existing category.
 * @param {string} id - The ID of the category to update.
 * @param {object} updateData - The data to update the category with.
 * @returns {Promise<object|null>} The updated category document or null if not found.
 */
export const updateCategoryService = async (id, updateData) => {
  try {
    if (!isValidMongoId(id)) return null;

    const category = await Category.findById(id);
    if (!category) {
      return null;
    }

    if (updateData.name) {
      category.name = updateData.name;
      category.handle = updateData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    if (updateData.description !== undefined) {
      category.description = updateData.description;
    }
    
    const updatedCategory = await category.save();
    return updatedCategory;
  } catch (error) {
    if (error.code === 11000) {
      throw new Error('Another category with this name already exists.');
    }
    throw error;
  }
};

/**
 * Deletes a category by its ID.
 * @param {string} id - The ID of the category to delete.
 * @returns {Promise<object|null>} The deleted category document or null if not found.
 */
export const deleteCategoryService = async (id) => {
  try {
    if (!isValidMongoId(id)) return null;
    const deletedCategory = await Category.findByIdAndDelete(id);
    return deletedCategory;
  } catch (error) {
    throw error;
  }
};
