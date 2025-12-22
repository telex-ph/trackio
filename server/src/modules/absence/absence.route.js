import { Router } from "express";
import { verifyJWT } from "../../middlewares/verifyJWT.js";
import {
  addAbsentees,
  getAbsentees,
} from "./absence.controller.js";
const router = Router();

router.get("/get-absentees", verifyJWT, getAbsentees);

router.get("/add-absentees", addAbsentees);

export default router;
