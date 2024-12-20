import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinary.js'; 

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'news_gallery', // Cloudinary folder to store images
        allowed_formats: ['jpg', 'png', 'jpeg'], // Allowed file formats
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 4 * 1024 * 1024 } // 1MB size limit per file
});


export default upload;
