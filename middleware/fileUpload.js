const multer = require("multer");
const path = require("path");

// Define Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      // Images will be stored in the 'uploads/images' folder
      cb(null, "uploads/images");
    } else {
      // Excel files will be stored in the 'uploads' folder
      cb(null, "uploads/");
    }
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to filename
  },
});

// Define file filter to allow only certain file types
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // Excel MIME type
    "application/vnd.ms-excel", // Older Excel MIME type
    "image/jpeg", // JPEG images
    "image/png", // PNG images
    "image/jpg", // JPG images
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only Excel files and images are allowed."), false);
  }
};

// Create Multer upload instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB file size limit
  },
});

module.exports = upload;
