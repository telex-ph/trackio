import { Router } from "express";
import { test } from "../controllers/testCotroller.js";
import { verifyJWT } from "../middlewares/verifyJWT.js";
import { handleExpiredToken } from "../middlewares/handleExpiredToken.js";
const router = Router();

router.get("/test", verifyJWT, handleExpiredToken, test);

export default router;
