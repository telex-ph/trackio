import express from "express";
import multer from "multer";
import cloudUpload from "../config/cloudinary.js";

const router = express.Router();

// Use memory storage for multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/evidence", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Upload buffer to Cloudinary
    const result = await cloudUpload(req.file.buffer, {
      folder: "trackio/offense/evidence",
      resource_type: "auto",
    });

    res.json({
      url: result.secure_url,
      public_id: result.public_id,
      fileName: req.file.originalname,
      size: req.file.size,
      type: req.file.mimetype,
    });
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    res.status(500).json({ message: "Cloudinary upload failed", error: err.message });
  }
});

router.post("/nte", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Upload buffer to Cloudinary
    const result = await cloudUpload(req.file.buffer, {
      folder: "trackio/offense/NTE",
      resource_type: "auto",
    });

    res.json({
      url: result.secure_url,
      public_id: result.public_id,
      fileName: req.file.originalname,
      size: req.file.size,
      type: req.file.mimetype,
    });
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    res.status(500).json({ message: "Cloudinary upload failed", error: err.message });
  }
});

router.post("/mom", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Upload buffer to Cloudinary
    const result = await cloudUpload(req.file.buffer, {
      folder: "trackio/offense/MOM",
      resource_type: "auto",
    });

    res.json({
      url: result.secure_url,
      public_id: result.public_id,
      fileName: req.file.originalname,
      size: req.file.size,
      type: req.file.mimetype,
    });
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    res.status(500).json({ message: "Cloudinary upload failed", error: err.message });
  }
});

router.post("/nda", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Upload buffer to Cloudinary
    const result = await cloudUpload(req.file.buffer, {
      folder: "trackio/offense/NDA",
      resource_type: "auto",
    });

    res.json({
      url: result.secure_url,
      public_id: result.public_id,
      fileName: req.file.originalname,
      size: req.file.size,
      type: req.file.mimetype,
    });
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    res.status(500).json({ message: "Cloudinary upload failed", error: err.message });
  }
});

export default router;
