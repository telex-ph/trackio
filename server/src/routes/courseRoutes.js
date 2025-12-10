import express from "express";
import {
  addCourse,
  getCourse,
  getCourses,
  updateCourse,
} from "../controllers/courseController.js";
const router = express.Router();

router.post("/", addCourse);

router.get("/", getCourses);

router.get("/:id", getCourse);

router.patch("/:id", updateCourse);

export default router;
