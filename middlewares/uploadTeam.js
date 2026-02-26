const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Absolute path to uploads/team
const uploadDir = process.env.VERCEL ? "/tmp" : path.join(__dirname, "../uploads/team");

// Ensure directory exists
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (error) {
  console.error("Vercel FS Error:", error.message);
}

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

// Allow only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files allowed"), false);
  }
};

const uploadTeam = multer({
  storage,
  fileFilter,
});

module.exports = uploadTeam;
