import { Router } from "express";
import { verifyJWT } from "../middlewares/verifyJWT.js";
import {
  addAttendance,
  getAttendances,
  getAttendance,
  updateAttendance,
  updateField,
} from "../controllers/attendanceControllers.js";

const router = Router();

router.post("/add-attendance/:id", verifyJWT, addAttendance);

router.get("/get-attendances", verifyJWT, getAttendances);

router.get("/get-attendance/:id", verifyJWT, getAttendance);

// TODO: refactor kasi super messy code HAHAHHAHAAH
router.patch("/update-attendance", verifyJWT, updateAttendance);

router.patch("/update-attendance-field", verifyJWT, updateField);

export default router;
