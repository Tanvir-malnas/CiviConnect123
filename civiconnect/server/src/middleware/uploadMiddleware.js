import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the local uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * ====================================================================
 * STORAGE STRATEGY: LOCAL DISK STORAGE
 * ====================================================================
 * Storing uploaded files locally in the `uploads/` folder.
 * 
 * TO SWAP FOR CLOUDINARY OR AWS S3 IN PRODUCTION:
 * 1. Install `multer-storage-cloudinary` or `@aws-sdk/client-s3` + `multer-s3`.
 * 2. Replace diskStorage with CloudinaryStorage:
 *    const storage = new CloudinaryStorage({
 *      cloudinary: cloudinary,
 *      params: { folder: 'civiconnect_complaints', allowed_formats: ['jpg', 'png', 'webp'] }
 *    });
 * 3. Use `req.file.path` (which becomes the remote Cloudinary HTTPS URL) in controllers.
 * ====================================================================
 */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate safe filename: complaint-<timestamp>-<random>.<ext>
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `civi-${uniqueSuffix}${ext}`);
  },
});

// File filter to allow only image files
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png|webp|gif/;
  const extname = allowedFileTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, JPG, PNG, WEBP) are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max file size
  fileFilter: fileFilter,
});

export default upload;
