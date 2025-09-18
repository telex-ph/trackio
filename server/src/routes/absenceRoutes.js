import { Router } from "express";
import { verifyJWT } from "../middlewares/verifyJWT.js";
import { getAbsentees } from "../controllers/absenceController.js";
const router = Router();

router.get("/get-absentees", verifyJWT, getAbsentees);

export default router;
