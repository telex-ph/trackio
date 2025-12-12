// File: routes/announcementUpload.js
import express from "express";
import multer from "multer";
import cloudinary from "cloudinary";
import crypto from "crypto";
import path from "path";

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only images and documents
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'text/plain'
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed. Only images and documents are permitted.`), false);
    }
  }
});

// Upload single file to Cloudinary
const uploadToCloudinary = async (buffer, originalName) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.v2.uploader.upload_stream(
      {
        folder: "trackio/announcements",
        resource_type: "auto",
        public_id: `${path.basename(originalName, path.extname(originalName))}-${crypto.randomBytes(4).toString('hex')}`,
        overwrite: false,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    
    stream.end(buffer);
  });
};

// ✅ ROUTE 1: Upload single file
router.post("/single", upload.single("file"), async (req, res) => {
  try {
    console.log("📤 Upload request received");
    
    if (!req.file) {
      console.log("❌ No file in request");
      return res.status(400).json({
        success: false,
        message: "No file uploaded. Please select a file."
      });
    }

    console.log(`📄 File info: ${req.file.originalname} (${req.file.size} bytes, ${req.file.mimetype})`);

    // Validate file size
    if (req.file.size > 10 * 1024 * 1024) {
      console.log("❌ File too large");
      return res.status(400).json({
        success: false,
        message: "File size exceeds 10MB limit. Please upload a smaller file."
      });
    }

    // Upload to Cloudinary
    console.log("☁️ Uploading to Cloudinary...");
    const result = await uploadToCloudinary(req.file.buffer, req.file.originalname);
    
    console.log("✅ Cloudinary upload successful:", result.secure_url);

    const responseData = {
      success: true,
      message: "File uploaded successfully to Cloudinary",
      data: {
        url: result.secure_url,
        public_id: result.public_id,
        fileName: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype,
        format: result.format,
        width: result.width || null,
        height: result.height || null
      }
    };

    console.log("📨 Sending response");
    res.json(responseData);

  } catch (error) {
    console.error("🔥 Upload error:", error);
    
    let errorMessage = "Failed to upload file";
    let statusCode = 500;

    if (error.message.includes("File type")) {
      errorMessage = error.message;
      statusCode = 400;
    } else if (error.message.includes("limit")) {
      errorMessage = "File upload limit exceeded";
      statusCode = 400;
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ✅ ROUTE 2: Upload multiple files
router.post("/multiple", upload.array("files", 5), async (req, res) => {
  try {
    console.log("📤 Multiple upload request received");
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded"
      });
    }

    console.log(`📄 ${req.files.length} files received`);

    const uploadPromises = req.files.map(async (file, index) => {
      try {
        console.log(`🔄 Uploading file ${index + 1}/${req.files.length}: ${file.originalname}`);
        const result = await uploadToCloudinary(file.buffer, file.originalname);
        
        return {
          success: true,
          url: result.secure_url,
          public_id: result.public_id,
          fileName: file.originalname,
          size: file.size,
          type: file.mimetype
        };
      } catch (error) {
        console.error(`❌ Failed to upload ${file.originalname}:`, error);
        return {
          success: false,
          fileName: file.originalname,
          error: error.message
        };
      }
    });

    const results = await Promise.all(uploadPromises);
    
    const successfulUploads = results.filter(r => r.success);
    const failedUploads = results.filter(r => !r.success);

    res.json({
      success: true,
      message: `Uploaded ${successfulUploads.length} of ${req.files.length} files`,
      data: {
        files: successfulUploads,
        failed: failedUploads,
        total: req.files.length,
        successful: successfulUploads.length,
        failedCount: failedUploads.length
      }
    });

  } catch (error) {
    console.error("🔥 Multiple upload error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload files",
      error: error.message
    });
  }
});

// ✅ ROUTE 3: Health check
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Announcement upload service is running",
    timestamp: new Date().toISOString()
  });
});

// ✅ ROUTE 4: Get Cloudinary config (for frontend)
router.get("/config", (req, res) => {
  res.json({
    success: true,
    data: {
      maxFileSize: "10MB",
      allowedTypes: [
        "Images: JPEG, JPG, PNG, GIF, WEBP, SVG",
        "Documents: PDF, DOC, DOCX, XLS, XLSX, TXT"
      ],
      uploadEndpoint: "/api/announcement-upload/single",
      multipleEndpoint: "/api/announcement-upload/multiple"
    }
  });
});

export default router;