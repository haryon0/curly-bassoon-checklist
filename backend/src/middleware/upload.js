const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const MAX_PHOTO_SIZE = parseInt(process.env.MAX_PHOTO_SIZE_MB || '5') * 1024 * 1024;
const MAX_PHOTOS = parseInt(process.env.MAX_PHOTOS || '20');

// Ensure upload directories exist
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Storage for checklist photos
const photoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.env.UPLOAD_DIR || 'uploads', 'photos');
    ensureDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `photo_${uuidv4()}${ext}`);
  },
});

// Storage for template PDFs
const templateStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.env.UPLOAD_DIR || 'uploads', 'templates');
    ensureDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `template_${uuidv4()}${ext}`);
  },
});

const photoFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
  }
};

const pdfFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const uploadPhotos = multer({
  storage: photoStorage,
  fileFilter: photoFilter,
  limits: {
    fileSize: MAX_PHOTO_SIZE,
    files: MAX_PHOTOS,
  },
});

const uploadTemplate = multer({
  storage: templateStorage,
  fileFilter: pdfFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max for templates
});

module.exports = { uploadPhotos, uploadTemplate };
