import { Router } from "express";
import { test } from "../controllers/testCotroller.js";
import { verifyJWT } from "../middlewares/verifyJWT.js";
const router = Router();

router.get("/test", verifyJWT, test);

export default router;
