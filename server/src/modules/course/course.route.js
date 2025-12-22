import express from "express";
import {
  addCourse,
  getCourse,
  getCourses,
  updateCourse,
  addCourseLesson,
} from "../controllers/courseController.js";
const router = express.Router();

router.post("/", addCourse);

router.get("/", getCourses);

router.get("/:id", getCourse);

router.patch("/:id", updateCourse);

router.post("/:id", addCourseLesson);

export default router;
