import Category from '../models/categoryModel.js';

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
    // Handle potential duplicate key error for name
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
export const getAllCategoriesService = async (page, limit) => {
  try {
    const skip = (page - 1) * limit;
    const categories = await Category.find({})
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .lean();
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
    const category = await Category.findById(id).lean();
    return category;
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return null; // Or throw a custom "not found" error
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
    const category = await Category.findById(id);
    if (!category) {
      return null;
    }

    // If name is being updated, also update the handle
    if (updateData.name) {
      category.name = updateData.name;
      category.handle = updateData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    if (updateData.description) {
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
    // Optional: Check if any products are using this category before deleting.
    // const products = await Product.find({ category: id });
    // if (products.length > 0) {
    //   throw new Error('Cannot delete category as it is currently in use by products.');
    // }
    const deletedCategory = await Category.findByIdAndDelete(id);
    return deletedCategory;
  } catch (error) {
    throw error;
  }
};
