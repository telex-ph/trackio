import express from "express";
import {
  // Course controllers
  addCourse,
  getCourse,
  getCourses,
  updateCourse,
  addCourseLesson,
  updateLesson,
  
  // Video progress controllers
  updateVideoProgress,
  getVideoProgress,
  checkLessonCompletion,
  getLessonStatus,
  
  // Quiz controllers (lesson-based)
  addQuizToLesson,
  updateLessonQuiz,
  deleteLessonQuiz,
  submitQuizAttempt,
  getUserQuizAttempts,
  getLessonQuizStats,
  getCourseQuizStats,
  checkQuizExists,
  
  // Admin analytics
  getAdminQuizAnalytics,
  
  // Certificate controllers
  getCertificate,
  generateCertificate,
  downloadCertificate,
  getCourseCompletionStatus
} from "./course.controller.js";

const router = express.Router();

// 🎯 COURSE ROUTES
router.post("/", addCourse);
router.get("/", getCourses);
router.get("/:id", getCourse);
router.patch("/:id", updateCourse);
router.post("/:id", addCourseLesson);
router.patch("/:courseId/lessons/:lessonId", updateLesson);

// 🎯 VIDEO PROGRESS ROUTES
router.post("/:courseId/progress", updateVideoProgress);
router.get("/:courseId/progress", getVideoProgress);
router.get("/:courseId/lessons/:lessonId/completion", checkLessonCompletion);
router.get("/:courseId/lessons/:lessonId/status", getLessonStatus);

// 🎯 QUIZ ROUTES (Lesson-based)
router.get("/:courseId/lessons/:lessonId/quiz/exists", checkQuizExists);
router.post("/:courseId/lessons/:lessonId/quiz", addQuizToLesson);
router.patch("/:courseId/lessons/:lessonId/quiz", updateLessonQuiz);
router.delete("/:courseId/lessons/:lessonId/quiz", deleteLessonQuiz);
router.post("/:courseId/lessons/:lessonId/quiz/submit", submitQuizAttempt);
router.get("/:courseId/quiz-attempts", getUserQuizAttempts);
router.get("/:courseId/lessons/:lessonId/quiz/stats", getLessonQuizStats);
router.get("/:courseId/quiz-stats", getCourseQuizStats);

// 🎯 ADMIN ANALYTICS ROUTES
router.get("/:courseId/admin/analytics", getAdminQuizAnalytics);

// 🎯 CERTIFICATE ROUTES
router.get("/:courseId/certificate", getCertificate);
router.post("/:courseId/certificate/generate", generateCertificate);
router.get("/:courseId/certificate/download", downloadCertificate);
router.get("/:courseId/completion-status", getCourseCompletionStatus);

export default router;