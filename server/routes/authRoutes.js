import { Router } from "express";
import {
  createNewToken,
  createToken,
  getAuthUser,
} from "../controllers/authControllers.js";
import { verifyJWT } from "../middlewares/verifyJWT.js";
import { handleExpiredToken } from "../middlewares/handleExpiredToken.js";
const router = Router();

// Creation of access token and refresh token
router.post("/create-token", createToken);

// Creation of access token USING REFRESH TOKEN
router.post("/create-new-token", createNewToken);

// Get the currently authenticated user info
router.get("/get-auth-user", verifyJWT, handleExpiredToken, getAuthUser);

export default router;
