import express from "express";
const router = express.Router();

import {
  getFolders,
  createFolder,
  deleteFolder,
  getDocuments,
  getArchivedDocuments,
  getDocumentVersions,
  getCategories,
  uploadDocument,
  updateDocument,
  updateStatus,
  restoreVersion,
  deleteDocument,
  downloadDocument,
} from "./repository.controller.js";

// ========== FOLDER ROUTES ==========
router.get("/folders", getFolders);
router.post("/folders", createFolder);
router.delete("/folders/:id", deleteFolder);

// ========== DOCUMENT ROUTES ==========
router.get("/documents", getDocuments);
router.get("/archived", getArchivedDocuments);
router.get("/documents/:id/versions", getDocumentVersions);
router.get("/categories", getCategories);
router.post("/upload", uploadDocument);
router.put("/documents/:id", updateDocument);
router.patch("/documents/:id/status", updateStatus);
router.post("/documents/:id/restore", restoreVersion);
router.delete("/documents/:id", deleteDocument);
router.get("/download/:filename", downloadDocument);

export default router;