import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const uploadImageStream = (buffer, sku, categoryName) => {
  return new Promise((resolve, reject) => {
    // Sanitize category for folder name (replace spaces with underscores)
    const folderName = categoryName ? categoryName.trim().replace(/\s/g, '_') : 'UNCATEGORIZED';
    const publicId = sku.toUpperCase(); // Use uppercased SKU as public_id

    const stream = cloudinary.uploader.upload_stream(
      { 
        folder: folderName,
        public_id: publicId,
        use_filename: false, // Do not use original filename, use public_id
        unique_filename: false, 
        overwrite: true         
      },
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );
    stream.end(buffer);
  });
};

export const uploadImage = async (filePath) => {
  return await cloudinary.uploader.upload(filePath, {
    folder: 'products',
  });
};

export const deleteImage = async (publicId) => {
  return await cloudinary.uploader.destroy(publicId);
};

export default cloudinary;
