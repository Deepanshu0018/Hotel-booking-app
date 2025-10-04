// cloudconfig.js
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Configure multer storage to upload directly to Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "wanderlust", // folder in Cloudinary
    allowed_formats: ["jpeg", "jpg", "png"],
    transformation: [{ width: 1000, height: 1000, crop: "limit" }], // optional
  },
});

module.exports = { cloudinary, storage };
