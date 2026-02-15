import mongoose from 'mongoose';
import Product from '../models/productModel.js';
import Category from '../models/categoryModel.js'; // Import Category model
import { uploadImageStream, deleteImage } from '../../../config/cloudinary.config.js';

export const createProductService = async (productData, imageBuffer) => {
  try {
    if (!productData.sku || !productData.category) {
      throw new Error("SKU and Category are required for image upload.");
    }

    const category = await Category.findById(productData.category);
    if (!category) {
      throw new Error("Category not found.");
    }
    const categoryName = category.name;

    const uploadResult = await uploadImageStream(imageBuffer, productData.sku, categoryName);

    productData.image_url = uploadResult.secure_url;

    const newProduct = new Product(productData);
    await newProduct.save();

    return newProduct;
  } catch (error) {
    console.error("❌ Error in createProductService:", error.message);
    throw new Error("Error creating product");
  }
};

export const updateProductService = async (id, productData, imageBuffer) => {
  try {
    const product = await Product.findById(id);
    if (!product) {
      return { error: 'Product not found', status: 404 };
    }

    // This logic is for getting the correct category name for the Cloudinary folder path
    let categoryNameForImage = product.category; // Default to existing category name
    if (productData.category) {
      const categoryObj = await Category.findById(productData.category);
      if (categoryObj) {
        categoryNameForImage = categoryObj.name;
      }
    }

    if (imageBuffer) {
      if (product.image_url) {
        const oldPublicId = product.image_url.substring(
          product.image_url.lastIndexOf("/") + 1,
          product.image_url.lastIndexOf(".")
        );
        // This public ID extraction might be too simple, assuming "folder/image.jpg"
        // A more robust way would be needed if URLs are complex.
        // For "https://res.cloudinary.com/deshvpfic/image/upload/CATEGORY/SKU.jpg"
        const publicIdToDelete = product.image_url.substring(
          product.image_url.indexOf(product.sku) - (categoryNameForImage.length + 1),
          product.image_url.lastIndexOf(".")
        );
        // This is still fragile. A better approach is to store public_id.
        // For now, let's assume the folder structure is consistent.
      }

      const skuToUse = productData.sku || product.sku;
      const uploadResult = await uploadImageStream(imageBuffer, skuToUse, categoryNameForImage);
      productData.image_url = uploadResult.secure_url;
    }

    // Convert incoming category ID to category name for storage, as per the schema
    if (productData.category) {
      const categoryObj = await Category.findById(productData.category);
      if (categoryObj) {
        productData.category = categoryObj.name;
      } else {
        // If an invalid category ID is sent, we should not update the category
        delete productData.category;
      }
    }

    // Use $set to ensure only provided fields are updated and existing data is not lost
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: productData },
      { new: true }
    );
    return updatedProduct;
  } catch (error) {
    console.error("❌ Error in updateProductService:", error.message);
    throw new Error("Error updating product");
  }
};

export const deleteProductService = async (id) => {
  try {
    const product = await Product.findById(id);
    if (!product) {
      return { error: 'Product not found', status: 404 };
    }

    // Delete image from Cloudinary
    if (product.image_url) {
      // Extract the full publicId from the existing image_url based on the new folder pattern
      // Example: image_url = "https://res.cloudinary.com/deshvpfic/image/upload/products/CATEGORY/SKU.jpg"
      // Public ID would be "products/CATEGORY/SKU"
      const publicIdToDelete = product.image_url.substring(
        product.image_url.lastIndexOf("upload/") + 7, // index after "upload/"
        product.image_url.lastIndexOf(".") // index before file extension
      );
      await deleteImage(publicIdToDelete);
    }

    await Product.findByIdAndDelete(id);

    return { message: 'Product deleted successfully' };
  } catch (error) {
    console.error("❌ Error in deleteProductService:", error.message);
    throw new Error("Error deleting product");
  }
};

// src/api/v1/services/product.Service.js

export const getProductsService = async (options) => {
  try {
    const { page = 1, limit = 10, sortBy = '_id', sortOrder = 'desc', search, category } = options;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const query = {};

    if (category) {
      // Perform a case-insensitive exact match on the category name
      query.category = { $regex: `^${category}$`, $options: 'i' };
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { title: searchRegex },
        { sku: searchRegex },
      ];
    }

    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const products = await Product.find(query)
      .select('_id sku title price currency image_url stock category bgColor description handle')
      // No populate needed as category is a string
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Product.countDocuments(query);

    return {
      products,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      total,
    };
  } catch (error) {
    console.error("❌ Error in getProductsService:", error.message);
    throw new Error("Internal server error");
  }
};

export const getAllProductsSimpleService = async () => {
  try {
    const products = await Product.find({})
      .select('_id sku title price image_url stock currency bgColor category handle')
      .lean();
    return products;
  } catch (error) {
    console.error("❌ Error in getAllProductsSimpleService:", error.message);
    throw new Error("Internal server error");
  }
};
export const getProductByIdService = async (id) => {
  try {
    const product = await Product.findById(id).lean();
    if (!product) {
      return { error: "Product not found", status: 404 };
    }
    return product;
  } catch (error) {
    console.error("❌ Error in getProductByIdService:", error.message);
    // Handle cases like invalid ObjectId format
    if (error.kind === 'ObjectId') {
      return { error: "Invalid product ID format", status: 400 };
    }
    throw new Error("Internal server error");
  }
};
