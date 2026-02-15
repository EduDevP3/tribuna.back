import { 
    getProductsService, 
    getProductByIdService, 
    getAllProductsSimpleService,
    createProductService,
    updateProductService,
    deleteProductService
} from '../services/product.Service.js';

export const createProduct = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Product image is required.' });
        }

        // Cuando se usa form-data, los números llegan como strings.
        const productData = {
            ...req.body,
            price: req.body.price ? parseFloat(req.body.price) : undefined,
            stock: req.body.stock === 'true'
        };

        const newProduct = await createProductService(productData, req.file.buffer);
        res.status(201).json(newProduct);
    } catch (error) {
        console.error("❌ Error in createProduct controller:", error.message);
        res.status(500).json({ message: "Error creating product", error: error.message });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const imageBuffer = req.file ? req.file.buffer : null;
        
        const productData = {
            ...req.body,
            price: req.body.price ? parseFloat(req.body.price) : undefined,
            stock: req.body.stock === 'true', // Asegurar que stock sea booleano
            category: req.body.category && req.body.category !== '' ? req.body.category : undefined // Validar category
        };

        const updatedProduct = await updateProductService(id, productData, imageBuffer);
        
        if (updatedProduct.error) {
            return res.status(updatedProduct.status).json({ message: updatedProduct.error });
        }

        res.json(updatedProduct);
    } catch (error) {
        console.error("❌ Error in updateProduct controller:", error.message);
        res.status(500).json({ message: "Error updating product", error: error.message });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await deleteProductService(id);

        if (result.error) {
            return res.status(result.status).json({ message: result.error });
        }

        res.json(result);
    } catch (error) {
        console.error("❌ Error in deleteProduct controller:", error.message);
        res.status(500).json({ message: "Error deleting product", error: error.message });
    }
};

// src/api/v1/controllers/product.Controller.js

export const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy, sortOrder, search, category } = req.query;
    const result = await getProductsService({ page, limit, sortBy, sortOrder, search, category });

    if (result.error) {
      return res.status(result.status || 500).json({ message: result.error });
    }

    return res.json(result);
  } catch (error) {
    console.error("❌ Error in getProducts controller:", error.message);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const getAllProductsSimple = async (req, res) => {
  try {
    const products = await getAllProductsSimpleService();
    return res.json(products);
  } catch (error) {
    console.error("❌ Error in getAllProductsSimple controller:", error.message);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getProductByIdService(id);

    if (result.error) {
      return res.status(result.status || 404).json({ message: result.error });
    }

    return res.json(result);
  } catch (error) {
    console.error("❌ Error in getProductById controller:", error.message);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
