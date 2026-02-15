import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required.'],
    unique: true,
    trim: true,
    minlength: [2, 'Category name must be at least 2 characters long.'],
    maxlength: [50, 'Category name cannot exceed 50 characters.'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters.'],
  },
  handle: {
    type: String,
    required: true,
    unique: true,
  }
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps
});

// Pre-save middleware to generate handle from name
categorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.handle = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

const Category = mongoose.model('Category', categorySchema);

export default Category;
