import { Router } from "express";
import { verifyJWT } from "../middlewares/verifyJWT.js";
import { uploadMedia } from "../controllers/mediaController.js";
import upload from "../middlewares/multer.js";
const router = Router();

router.post("/upload-media", verifyJWT, upload.array("files", 5), uploadMedia);

export default router;
