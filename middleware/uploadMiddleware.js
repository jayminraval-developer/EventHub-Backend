import dotenv from "dotenv";
dotenv.config();
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const storage = multer.memoryStorage(); // keep file in memory, send to Cloudinary

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

export default upload;
