import { Router } from "express";
import { verifyJWT } from "../middlewares/verifyJWT.js";
import { handleExpiredToken } from "../middlewares/handleExpiredToken.js";
import {
  getAttendances,
  getAttendance,
  updateAttendance,
} from "../controllers/attendanceControllers.js";

const router = Router();

router.get("/get-attendances", verifyJWT, handleExpiredToken, getAttendances);

router.get("/get-attendance/:id", verifyJWT, handleExpiredToken, getAttendance);

router.patch(
  "/update-attendance",
  verifyJWT,
  handleExpiredToken,
  updateAttendance
);

export default router;
