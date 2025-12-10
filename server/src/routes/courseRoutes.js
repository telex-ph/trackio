import express from "express";
import {
  addCourse,
  getCourse,
  getCourses,
} from "../controllers/courseController.js";
const router = express.Router();

router.post("/", addCourse);

router.get("/", getCourses);

router.get("/:id", getCourse);

export default router;
