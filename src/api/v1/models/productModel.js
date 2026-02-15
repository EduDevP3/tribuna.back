import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  sku: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  handle: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: "MXN"
  },
  image_url: {
    type: String,
    required: true
  },
  stock: {
    type: Boolean,
    default: true
  },

  category: {
    type: String,
    default: "Componentes"
  },
  bgColor: {
    type: String,
    default: "#FFFFFF"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Índice para búsquedas rápidas por SKU o Título
productSchema.index({ sku: 1, title: 'text' });

const Product = mongoose.model('Product', productSchema);
export default Product;