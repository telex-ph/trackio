import { Router } from "express";
import { verifyJWT } from "../middlewares/verifyJWT.js";
import {
  addAbsentees,
  getAbsentees,
} from "../controllers/absenceController.js";
const router = Router();

router.get("/get-absentees", verifyJWT, getAbsentees);

router.get("/add-absentees", addAbsentees);

export default router;
