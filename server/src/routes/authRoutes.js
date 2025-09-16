import { Router } from "express";
import {
  createNewToken,
  createToken,
  deleteToken,
  getAuthUser,
  getStatus,
  login,
} from "../controllers/authControllers.js";
//import { verifyJWT } from "../middlewares/verifyJWT.js";
// import { handleExpiredToken } from "../middlewares/handleExpiredToken.js";
const router = Router();

// Logging in to the system
router.post("/log-in", login);

// Creation of access token and refresh token
router.post("/create-token", createToken);

// Creation of access token USING REFRESH TOKEN
router.post("/create-new-token", createNewToken);

// Deletion of tokes / logout
router.get("/delete-token", deleteToken);

// Get the currently authenticated user info
router.get("/get-auth-user", getAuthUser);

// Check if the user is still valid
router.get("/status", getStatus);

export default router;
