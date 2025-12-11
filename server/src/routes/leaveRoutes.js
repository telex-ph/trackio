import express from "express";
import { verifyJWT as auth } from "../middlewares/verifyJWT.js";
import { addLeave, getLeaveById, getLeaves } from "../controllers/leaveController.js";

const router = express.Router();

router.post("/", auth, addLeave);

router.get("/", auth, getLeaves);
router.get("/:id", auth, getLeaveById);

export default router;