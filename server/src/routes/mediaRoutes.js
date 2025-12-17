import { Router } from "express";
import { verifyJWT } from "../middlewares/verifyJWT.js";
import { uploadMedia } from "../controllers/mediaController.js";
import upload from "../middlewares/multer.js";
const router = Router();

router.post("/upload-media", upload.array("files", 5), verifyJWT, uploadMedia);

export default router;
