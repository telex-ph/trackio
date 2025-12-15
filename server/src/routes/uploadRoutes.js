import express from "express";
import multer from "multer";
import cloudUpload from "../config/cloudinary.js";
import crypto from "crypto";
import path from "path";

const router = express.Router();

// Multer memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Supported folder types
const folderMap = {
  evidence: "trackio/offense/evidence",
  nte: "trackio/offense/NTE",
  mom: "trackio/offense/MOM",
  nda: "trackio/offense/NDA",
  leave: "trackio/leave",
  announcement: "trackio/announcement",
  recognition: "trackio/recognition",
};

// Reusable upload handler
async function handleUpload(req, res, folder) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const originalName = req.file.originalname;
    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext);

    // Ensures uniqueness (prevents overwrite)
    const uniqueSuffix = crypto.randomBytes(4).toString("hex");

    const publicId = `${baseName}-${uniqueSuffix}`;

    // Upload buffer to Cloudinary
    const result = await cloudUpload(req.file.buffer, {
      folder,
      resource_type: "auto",
      public_id: publicId,
      format: ext.replace(".", ""),
    });

    res.json({
      url: result.secure_url,
      public_id: result.public_id,
      fileName: originalName,
      size: req.file.size,
      type: req.file.mimetype,
    });
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    res.status(500).json({
      message: "Cloudinary upload failed",
      error: err.message,
    });
  }
}

// Dynamic route — one function handles all your endpoints
router.post("/:type", upload.single("file"), async (req, res) => {
  const { type } = req.params;
  const folder = folderMap[type];

  if (!folder) {
    return res.status(400).json({ message: "Invalid upload type" });
  }

  handleUpload(req, res, folder);
});


export default router;
