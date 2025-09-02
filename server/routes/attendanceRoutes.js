import { Router } from "express";
import { verifyJWT } from "../middlewares/verifyJWT.js";
import { handleExpiredToken } from "../middlewares/handleExpiredToken.js";
import { getAttendance } from "../controllers/attendanceControllers.js";

const router = Router();

router.get("/get-attendance", verifyJWT, handleExpiredToken, getAttendance);

export default router;
