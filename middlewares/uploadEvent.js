const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadPath = process.env.VERCEL ? "/tmp" : path.join(__dirname, "..", "uploads", "events");

try {
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
} catch (error) {
  console.error("Vercel FS Error:", error.message);
}

const storage = multer.diskStorage({
  destination: uploadPath,
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

module.exports = upload;
