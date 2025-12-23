import express from "express";
import { verifyJWT as auth } from "../../middlewares/verifyJWT.js";
import {
  addLeave,
  deleteLeave,
  getLeaveById,
  getLeaves,
  updateLeave,
} from "./leave.controller.js";

const router = express.Router();

router.post("/", auth, addLeave);

router.get("/", auth, getLeaves);
router.get("/:id", auth, getLeaveById);

router.put("/:id", auth, updateLeave);

router.delete("/:id", auth, deleteLeave);

export default router;
