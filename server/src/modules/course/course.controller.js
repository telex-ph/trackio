import Course from "./course.model.js";

// 🎯 COURSE CONTROLLERS
export const addCourse = async (req, res) => {
  const newCourse = req.body;

  if (!newCourse)
    return res.status(400).json({ message: "New course is required" });

  try {
    const result = await Course.add(newCourse);
    res.status(200).json(result);
  } catch (error) {
    console.error("Add course error:", error.message);
    res.status(400).json({ error: error.message });
  }
};

export const getCourses = async (req, res) => {
  const category = req.query.category;
  const userId = req.query.userId;

  try {
    const courses = await Course.getAll(category);
    
    // Add completion status for each course for the specific user
    if (userId) {
      const coursesWithProgress = await Promise.all(
        courses.map(async (course) => {
          if (course._id) {
            const progress = await Course.getVideoProgress(course._id.toString(), userId);
            
            // Calculate REAL completed lessons (must pass quiz if lesson has quiz)
            let realCompletedLessons = 0;
            
            // First, get all lesson statuses
            const lessonStatuses = await Promise.all(
              course.lessons?.map(async (lesson) => {
                const lessonProgress = progress.find(p => p.lessonId === (lesson._id?.toString() || lesson.id));
                let completed = lessonProgress?.completed || false;
                
                // If lesson has quiz, check if user passed it
                if (lesson.quiz && lesson.quiz.attempts && lessonProgress?.completed) {
                  const userAttempts = lesson.quiz.attempts.filter(attempt => 
                    attempt.userId?.toString() === userId
                  );
                  const passedQuiz = userAttempts.some(attempt => attempt.passed);
                  completed = passedQuiz; // Only completed if passed quiz
                }
                
                if (completed) realCompletedLessons++;
                
                return {
                  ...lesson,
                  completed: completed,
                  progress: lessonProgress?.progress || 0,
                  quiz: lesson.quiz || null
                };
              }) || []
            );
            
            const totalLessons = course.lessons?.length || 0;
            const courseWithProgress = {
              ...course,
              progress: totalLessons > 0 ? Math.round((realCompletedLessons / totalLessons) * 100) : 0,
              completedLessons: realCompletedLessons,
              totalLessons,
              lessons: lessonStatuses
            };
            
            return courseWithProgress;
          }
          return course;
        })
      );
      res.status(200).json(coursesWithProgress);
    } else {
      res.status(200).json(courses);
    }
  } catch (error) {
    console.error("Fetching courses error:", error.message);
    res.status(400).json({ error: error.message });
  }
};

export const getCourse = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.query;

  if (!id) return res.status(400).json({ message: "Course ID is required" });

  try {
    const course = await Course.get(id);
    
    // Add user-specific progress if userId provided
    if (userId && course) {
      const progress = await Course.getVideoProgress(id, userId);
      
      // Calculate REAL completed lessons
      let realCompletedLessons = 0;
      
      course.lessons = await Promise.all(
        course.lessons?.map(async (lesson) => {
          const lessonProgress = progress.find(p => p.lessonId === (lesson._id?.toString() || lesson.id));
          let completed = lessonProgress?.completed || false;
          
          // If lesson has quiz, check if user passed it
          if (lesson.quiz && lesson.quiz.attempts && lessonProgress?.completed) {
            const userAttempts = lesson.quiz.attempts.filter(attempt => 
              attempt.userId?.toString() === userId
            );
            const passedQuiz = userAttempts.some(attempt => attempt.passed);
            completed = passedQuiz; // Only completed if passed quiz
          }
          
          if (completed) realCompletedLessons++;
          
          return {
            ...lesson,
            completed: completed,
            progress: lessonProgress?.progress || 0
          };
        }) || []
      );
      
      // Calculate overall course progress based on REAL completion
      course.progress = course.lessons.length > 0 ? 
        Math.round((realCompletedLessons / course.lessons.length) * 100) : 0;
    }
    
    res.status(200).json(course);
  } catch (error) {
    console.error("Fetching course error:", error.message);
    res.status(400).json({ error: error.message });
  }
};

export const updateCourse = async (req, res) => {
  const { id } = req.params;
  const newCourse = req.body;

  if (!newCourse)
    return res.status(400).json({ message: "New course is required" });

  try {
    const result = await Course.update(id, newCourse);
    res.status(200).json(result);
  } catch (error) {
    console.error("Updating course error:", error.message);
    res.status(400).json({ error: error.message });
  }
};

export const addCourseLesson = async (req, res) => {
  const newLesson = req.body;
  const id = req.params.id;

  if (!id || !newLesson)
    return res.status(400).json({ message: "New lesson is required" });

  try {
    console.log("Adding lesson with quiz:", newLesson.quiz ? "Yes" : "No");
    
    // Ensure quiz has question IDs and correctAnswer is number
    if (newLesson.quiz && newLesson.quiz.questions) {
      newLesson.quiz.questions = newLesson.quiz.questions.map(q => ({
        ...q,
        _id: q._id || require('mongodb').ObjectId().toString(),
        correctAnswer: Number(q.correctAnswer) || 0
      }));
    }

    const result = await Course.addLesson(id, newLesson);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error adding lesson:", error.message);
    res.status(400).json({ error: error.message });
  }
};

export const updateLesson = async (req, res) => {
  const { courseId, lessonId } = req.params;
  const updatedLesson = req.body;

  if (!courseId || !lessonId || !updatedLesson) {
    return res.status(400).json({ message: "All parameters are required" });
  }

  try {
    const result = await Course.updateLesson(courseId, lessonId, updatedLesson);
    res.status(200).json(result);
  } catch (error) {
    console.error("Update lesson error:", error.message);
    res.status(400).json({ error: error.message });
  }
};

// 🎯 VIDEO PROGRESS CONTROLLERS
export const updateVideoProgress = async (req, res) => {
  const { courseId } = req.params;
  const { userId, lessonId, progress, completed } = req.body;

  if (!courseId || !userId || !lessonId) {
    return res.status(400).json({ message: "Required fields missing" });
  }

  try {
    console.log("Updating video progress:", { courseId, userId, lessonId, progress, completed });
    
    const result = await Course.updateVideoProgress(
      courseId, 
      userId, 
      lessonId, 
      progress, 
      completed
    );
    res.status(200).json(result);
  } catch (error) {
    console.error("Update progress error:", error.message);
    res.status(400).json({ error: error.message });
  }
};

export const getVideoProgress = async (req, res) => {
  const { courseId } = req.params;
  const { userId } = req.query;

  if (!courseId || !userId) {
    return res.status(400).json({ message: "Course ID and User ID are required" });
  }

  try {
    const progress = await Course.getVideoProgress(courseId, userId);
    res.status(200).json(progress);
  } catch (error) {
    console.error("Get progress error:", error.message);
    res.status(400).json({ error: error.message });
  }
};

export const checkLessonCompletion = async (req, res) => {
  const { courseId, lessonId } = req.params;
  const { userId } = req.query;

  if (!courseId || !lessonId || !userId) {
    return res.status(400).json({ message: "All parameters are required" });
  }

  try {
    const completed = await Course.checkLessonCompletion(courseId, userId, lessonId);
    res.status(200).json({ completed });
  } catch (error) {
    console.error("Check completion error:", error.message);
    res.status(400).json({ error: error.message });
  }
};

// 🎯 NEW: Get lesson status with quiz check
export const getLessonStatus = async (req, res) => {
  const { courseId, lessonId } = req.params;
  const { userId } = req.query;

  if (!courseId || !lessonId || !userId) {
    return res.status(400).json({ message: "All parameters are required" });
  }

  try {
    const status = await Course.getLessonStatus(courseId, userId, lessonId);
    res.status(200).json(status);
  } catch (error) {
    console.error("Get lesson status error:", error.message);
    res.status(400).json({ error: error.message });
  }
};

// 🎯 QUIZ CONTROLLERS (Lesson-based)
export const addQuizToLesson = async (req, res) => {
  const { courseId, lessonId } = req.params;
  const quiz = req.body;

  if (!courseId || !lessonId || !quiz) {
    return res.status(400).json({ message: "Course ID, Lesson ID and quiz data are required" });
  }

  try {
    console.log("Adding quiz to lesson:", { courseId, lessonId, quiz });
    
    // Check if quiz already exists
    const quizExists = await Course.checkQuizExists(courseId, lessonId);
    if (quizExists) {
      return res.status(400).json({ message: "Quiz already exists for this lesson" });
    }

    const result = await Course.addQuizToLesson(courseId, lessonId, quiz);
    res.status(200).json(result);
  } catch (error) {
    console.error("Add quiz error:", error.message);
    res.status(400).json({ error: error.message });
  }
};

export const updateLessonQuiz = async (req, res) => {
  const { courseId, lessonId } = req.params;
  const quizData = req.body;

  if (!courseId || !lessonId || !quizData) {
    return res.status(400).json({ message: "All parameters are required" });
  }

  try {
    const result = await Course.updateLessonQuiz(courseId, lessonId, quizData);
    res.status(200).json(result);
  } catch (error) {
    console.error("Update quiz error:", error.message);
    res.status(400).json({ error: error.message });
  }
};

export const deleteLessonQuiz = async (req, res) => {
  const { courseId, lessonId } = req.params;

  if (!courseId || !lessonId) {
    return res.status(400).json({ message: "Course ID and Lesson ID are required" });
  }

  try {
    const result = await Course.deleteLessonQuiz(courseId, lessonId);
    res.status(200).json(result);
  } catch (error) {
    console.error("Delete quiz error:", error.message);
    res.status(400).json({ error: error.message });
  }
};

export const submitQuizAttempt = async (req, res) => {
  const { courseId, lessonId } = req.params;
  const attemptData = req.body;

  if (!courseId || !lessonId || !attemptData) {
    return res.status(400).json({ message: "All parameters are required" });
  }

  try {
    console.log("Submitting quiz attempt:", { courseId, lessonId, attemptData });
    
    const result = await Course.submitQuizAttempt(
      courseId, 
      lessonId, 
      attemptData.userId, 
      attemptData
    );
    res.status(200).json(result);
  } catch (error) {
    console.error("Submit quiz error:", error.message);
    res.status(400).json({ error: error.message });
  }
};

export const getUserQuizAttempts = async (req, res) => {
  const { courseId } = req.params;
  const { userId } = req.query;

  if (!courseId || !userId) {
    return res.status(400).json({ message: "Course ID and User ID are required" });
  }

  try {
    const attempts = await Course.getUserQuizAttempts(courseId, userId);
    res.status(200).json(attempts);
  } catch (error) {
    console.error("Get attempts error:", error.message);
    res.status(400).json({ error: error.message });
  }
};

export const getLessonQuizStats = async (req, res) => {
  const { courseId, lessonId } = req.params;

  if (!courseId || !lessonId) {
    return res.status(400).json({ message: "Course ID and Lesson ID are required" });
  }

  try {
    const stats = await Course.getLessonQuizStats(courseId, lessonId);
    res.status(200).json(stats);
  } catch (error) {
    console.error("Get lesson stats error:", error.message);
    res.status(400).json({ error: error.message });
  }
};

export const getCourseQuizStats = async (req, res) => {
  const { courseId } = req.params;

  if (!courseId) {
    return res.status(400).json({ message: "Course ID is required" });
  }

  try {
    const stats = await Course.getCourseQuizStats(courseId);
    res.status(200).json(stats);
  } catch (error) {
    console.error("Get course stats error:", error.message);
    res.status(400).json({ error: error.message });
  }
};

// 🎯 CHECK IF QUIZ EXISTS
export const checkQuizExists = async (req, res) => {
  const { courseId, lessonId } = req.params;

  if (!courseId || !lessonId) {
    return res.status(400).json({ message: "Course ID and Lesson ID are required" });
  }

  try {
    const exists = await Course.checkQuizExists(courseId, lessonId);
    res.status(200).json({ exists });
  } catch (error) {
    console.error("Check quiz exists error:", error.message);
    res.status(400).json({ error: error.message });
  }
};

// 🎯 ADMIN ANALYTICS (Admin only)
export const getAdminQuizAnalytics = async (req, res) => {
  const { courseId } = req.params;

  if (!courseId) {
    return res.status(400).json({ message: "Course ID is required" });
  }

  try {
    const course = await Course.get(courseId);
    
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const analytics = {
      courseId: course._id,
      courseTitle: course.title,
      totalLessons: course.lessons?.length || 0,
      lessonsWithQuizzes: 0,
      totalQuizAttempts: 0,
      averageScore: 0,
      passRate: 0,
      lessonAnalytics: [],
      userPerformance: {}
    };

    let totalPercentage = 0;
    let totalPassed = 0;
    const userMap = new Map();

    course.lessons?.forEach(lesson => {
      if (lesson.quiz) {
        analytics.lessonsWithQuizzes++;
        analytics.totalQuizAttempts += lesson.quiz.attempts?.length || 0;

        const lessonStats = {
          lessonId: lesson._id,
          lessonTitle: lesson.title,
          quizTitle: lesson.quiz.title,
          totalAttempts: lesson.quiz.attempts?.length || 0,
          averageScore: 0,
          passRate: 0
        };

        if (lesson.quiz.attempts?.length > 0) {
          const lessonTotalPercentage = lesson.quiz.attempts.reduce((sum, attempt) => {
            // Track user performance
            const userId = attempt.userId.toString();
            if (!userMap.has(userId)) {
              userMap.set(userId, { attempts: 0, totalScore: 0, passed: 0 });
            }
            const userData = userMap.get(userId);
            userData.attempts++;
            userData.totalScore += attempt.percentage;
            if (attempt.passed) userData.passed++;

            totalPercentage += attempt.percentage;
            if (attempt.passed) totalPassed++;
            return sum + attempt.percentage;
          }, 0);

          lessonStats.averageScore = lessonTotalPercentage / lesson.quiz.attempts.length;
          const passedCount = lesson.quiz.attempts.filter(a => a.passed).length;
          lessonStats.passRate = (passedCount / lesson.quiz.attempts.length) * 100;
        }

        analytics.lessonAnalytics.push(lessonStats);
      }
    });

    // Calculate overall analytics
    if (analytics.totalQuizAttempts > 0) {
      analytics.averageScore = totalPercentage / analytics.totalQuizAttempts;
      analytics.passRate = (totalPassed / analytics.totalQuizAttempts) * 100;
    }

    // Prepare user performance data
    userMap.forEach((data, userId) => {
      analytics.userPerformance[userId] = {
        totalAttempts: data.attempts,
        averageScore: data.totalScore / data.attempts,
        passRate: (data.passed / data.attempts) * 100
      };
    });

    res.status(200).json(analytics);
  } catch (error) {
    console.error("Get admin analytics error:", error.message);
    res.status(400).json({ error: error.message });
  }
};

// 🎯 CERTIFICATE CONTROLLERS
export const getCourseCompletionStatus = async (req, res) => {
  const { courseId } = req.params;
  const { userId } = req.query;

  if (!courseId || !userId) {
    return res.status(400).json({ message: "Course ID and User ID are required" });
  }

  try {
    const completionStatus = await Course.getCourseCompletionStatus(courseId, userId);
    res.status(200).json(completionStatus);
  } catch (error) {
    console.error("Error getting completion status:", error);
    res.status(400).json({ error: error.message });
  }
};

export const getCertificate = async (req, res) => {
  const { courseId } = req.params;
  const { userId } = req.query;

  if (!courseId || !userId) {
    return res.status(400).json({ message: "Course ID and User ID are required" });
  }

  try {
    // Check if user has completed the course
    const completionStatus = await Course.getCourseCompletionStatus(courseId, userId);
    
    if (!completionStatus.fullyCompleted) {
      return res.status(403).json({ 
        error: "Course not fully completed. Complete all lessons and quizzes first." 
      });
    }

    // Check if certificate already exists
    const certificate = await Course.getUserCertificate(courseId, userId);
    
    if (certificate) {
      return res.status(200).json(certificate);
    }

    return res.status(404).json({ message: "Certificate not found. Generate one first." });
  } catch (error) {
    console.error("Error getting certificate:", error);
    res.status(400).json({ error: error.message });
  }
};

export const generateCertificate = async (req, res) => {
  const { courseId } = req.params;
  const { userId } = req.body;

  if (!courseId || !userId) {
    return res.status(400).json({ message: "Course ID and User ID are required" });
  }

  try {
    // Check if user has completed the course
    const completionStatus = await Course.getCourseCompletionStatus(courseId, userId);
    
    if (!completionStatus.fullyCompleted) {
      return res.status(403).json({ 
        error: "Cannot generate certificate. Course not fully completed." 
      });
    }

    // Check if certificate already exists
    const existingCertificate = await Course.getUserCertificate(courseId, userId);
    
    if (existingCertificate) {
      return res.status(200).json(existingCertificate);
    }

    // Generate new certificate
    const certificate = await Course.generateCertificate(courseId, userId);
    res.status(201).json(certificate);
  } catch (error) {
    console.error("Error generating certificate:", error);
    res.status(400).json({ error: error.message });
  }
};

export const downloadCertificate = async (req, res) => {
  const { courseId } = req.params;
  const { userId } = req.query;

  if (!courseId || !userId) {
    return res.status(400).json({ message: "Course ID and User ID are required" });
  }

  try {
    // Check if certificate exists
    const certificate = await Course.getUserCertificate(courseId, userId);
    
    if (!certificate) {
      return res.status(404).json({ error: "Certificate not found. Generate one first." });
    }

    // Generate PDF certificate
    const pdfBuffer = await Course.generateCertificatePDF(certificate);
    
    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${certificate.certificateNumber}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error downloading certificate:", error);
    res.status(400).json({ error: error.message });
  }
};