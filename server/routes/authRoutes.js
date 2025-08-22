import { Router } from "express";
import { createToken } from "../controllers/authController.js";
import { verifyJWT } from "../middlewares/verifyJWT.js";
const router = Router();

router.post("/create-token", createToken);

export default router;
