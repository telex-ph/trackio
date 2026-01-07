import { ObjectId } from "mongodb";
import connectDB from "../../config/db.js";
import { DateTime } from "luxon";

class Course {
  static #collection = "courses";

  // 🎯 HELPER FUNCTION: Ensure question IDs are properly formatted
  static #generateQuestionId(q) {
    try {
      // If ID exists and is valid ObjectId string, use it
      if (q._id && ObjectId.isValid(q._id)) {
        return q._id.toString(); // Keep as string
      }
      // If ID is string but not ObjectId, keep as string for frontend compatibility
      if (q._id && typeof q._id === 'string') {
        return q._id;
      }
      // Otherwise generate new string ID (compatible with frontend)
      return `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    } catch (error) {
      console.error("Error generating question ID:", error);
      return `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  }

  // 🎯 COURSE METHODS
  static async add(newCourse) {
    const db = await connectDB();
    const collection = await db.collection(this.#collection);

    const lessons = newCourse.lessons?.map(lesson => {
      // Process quiz questions with consistent ID format
      let quiz = null;
      if (lesson.quiz) {
        const questionsWithIds = lesson.quiz.questions?.map(q => ({
          ...q,
          _id: this.#generateQuestionId(q), // Keep as string for consistency
          correctAnswer: Number(q.correctAnswer) || 0
        })) || [];

        quiz = {
          ...lesson.quiz,
          _id: new ObjectId().toString(),
          questions: questionsWithIds,
          createdAt: DateTime.utc().toJSDate(),
          attempts: []
        };
      }

      return {
        _id: new ObjectId().toString(),
        title: lesson.title,
        description: lesson.description,
        url: lesson.url,
        duration: lesson.duration,
        createdAt: DateTime.utc().toJSDate(),
        quiz: quiz
      };
    }) || [];

    const newRecord = {
      title: newCourse.title,
      description: newCourse.description,
      instructor: newCourse.instructor,
      duration: lessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0),
      progress: 0,
      completed: false,
      lessons: lessons,
      createdBy: new ObjectId(newCourse.createdBy),
      createdAt: DateTime.utc().toJSDate(),
      updatedAt: DateTime.utc().toJSDate(),
      videoProgress: []
    };

    const result = await collection.insertOne(newRecord);
    return { _id: result.insertedId, ...newRecord };
  }

  static async getAll(category) {
    const db = await connectDB();
    const collection = await db.collection(this.#collection);

    const query = {};
    if (category) query.category = category;

    const result = await collection.find(query).toArray();
    return result;
  }

  static async get(id) {
    const db = await connectDB();
    const collection = await db.collection(this.#collection);
    const course = await collection.findOne({ _id: new ObjectId(id) });
    
    return course;
  }

  static async update(id, newCourse) {
    const db = await connectDB();
    const collection = await db.collection(this.#collection);

    newCourse.updatedAt = DateTime.utc().toJSDate();

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: newCourse }
    );

    if (result.matchedCount === 0) return null;
    return await collection.findOne({ _id: new ObjectId(id) });
  }

  static async addLesson(id, newLesson) {
    const db = await connectDB();
    const collection = await db.collection(this.#collection);

    // Process quiz questions with consistent ID format
    let quiz = null;
    if (newLesson.quiz) {
      const questionsWithIds = newLesson.quiz.questions?.map(q => ({
        ...q,
        _id: this.#generateQuestionId(q), // Keep as string
        correctAnswer: Number(q.correctAnswer) || 0
      })) || [];

      quiz = {
        ...newLesson.quiz,
        _id: new ObjectId().toString(),
        questions: questionsWithIds,
        createdAt: DateTime.utc().toJSDate(),
        attempts: []
      };
    }

    const lessonWithId = {
      _id: new ObjectId().toString(),
      title: newLesson.title,
      description: newLesson.description,
      url: newLesson.url,
      duration: newLesson.duration,
      createdAt: DateTime.utc().toJSDate(),
      quiz: quiz
    };

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $push: { lessons: lessonWithId },
        $inc: { duration: newLesson.duration },
        $set: { updatedAt: DateTime.utc().toJSDate() }
      },
      { returnDocument: "after" }
    );

    return result;
  }

  static async updateLesson(id, lessonId, updatedLesson) {
    const db = await connectDB();
    const collection = await db.collection(this.#collection);

    // Process quiz questions with consistent ID format
    let quiz = null;
    if (updatedLesson.quiz) {
      const questionsWithIds = updatedLesson.quiz.questions?.map(q => ({
        ...q,
        _id: this.#generateQuestionId(q), // Keep as string
        correctAnswer: Number(q.correctAnswer) || 0
      })) || [];

      quiz = {
        ...updatedLesson.quiz,
        questions: questionsWithIds,
        updatedAt: DateTime.utc().toJSDate()
      };
    }

    const result = await collection.findOneAndUpdate(
      { 
        _id: new ObjectId(id),
        "lessons._id": lessonId // String ID
      },
      {
        $set: {
          "lessons.$.title": updatedLesson.title,
          "lessons.$.description": updatedLesson.description,
          "lessons.$.duration": updatedLesson.duration,
          "lessons.$.url": updatedLesson.url,
          "lessons.$.quiz": quiz,
          "lessons.$.updatedAt": DateTime.utc().toJSDate()
        }
      },
      { returnDocument: "after" }
    );

    return result;
  }

  // 🎯 VIDEO PROGRESS TRACKING
  static async updateVideoProgress(courseId, userId, lessonId, progress, completed = false) {
    const db = await connectDB();
    const collection = await db.collection(this.#collection);

    try {
      const course = await collection.findOne({ _id: new ObjectId(courseId) });
      
      if (!course) {
        throw new Error("Course not found");
      }

      // Check if lesson has quiz
      const lesson = course.lessons?.find(l => l._id === lessonId);
      const hasQuiz = lesson?.quiz ? true : false;
      
      // If lesson has quiz, check if user passed it
      let canComplete = true;
      if (hasQuiz && lesson.quiz.attempts) {
        const userAttempts = lesson.quiz.attempts.filter(attempt => 
          attempt.userId.toString() === userId
        );
        
        // User must pass quiz to complete lesson
        const passedQuiz = userAttempts.some(attempt => attempt.passed);
        canComplete = passedQuiz;
        
        console.log("Quiz check - User passed quiz:", passedQuiz, "Total attempts:", userAttempts.length);
      }

      const existingProgressIndex = course.videoProgress?.findIndex(
        p => p.userId.toString() === userId && p.lessonId === lessonId
      ) || -1;

      if (existingProgressIndex >= 0) {
        const updateQuery = {
          $set: {
            [`videoProgress.${existingProgressIndex}.progress`]: progress,
            [`videoProgress.${existingProgressIndex}.completed`]: canComplete && completed,
            [`videoProgress.${existingProgressIndex}.lastWatched`]: DateTime.utc().toJSDate(),
            "updatedAt": DateTime.utc().toJSDate()
          }
        };

        const result = await collection.findOneAndUpdate(
          { _id: new ObjectId(courseId) },
          updateQuery,
          { returnDocument: "after" }
        );
        return result;
      } else {
        const newProgress = {
          userId: new ObjectId(userId),
          lessonId: lessonId,
          progress: progress,
          completed: canComplete && completed,
          lastWatched: DateTime.utc().toJSDate()
        };

        const result = await collection.findOneAndUpdate(
          { _id: new ObjectId(courseId) },
          {
            $push: { videoProgress: newProgress },
            $set: { updatedAt: DateTime.utc().toJSDate() }
          },
          { returnDocument: "after" }
        );
        return result;
      }
    } catch (error) {
      console.error("Error updating video progress:", error);
      throw error;
    }
  }

  static async getVideoProgress(courseId, userId) {
    const db = await connectDB();
    const collection = await db.collection(this.#collection);

    const course = await collection.findOne({ _id: new ObjectId(courseId) });
    return course?.videoProgress?.filter(prog => 
      prog.userId.toString() === userId
    ) || [];
  }

  static async checkLessonCompletion(courseId, userId, lessonId) {
    const db = await connectDB();
    const collection = await db.collection(this.#collection);

    const course = await collection.findOne({ _id: new ObjectId(courseId) });
    const progress = course?.videoProgress?.find(prog => 
      prog.userId.toString() === userId && prog.lessonId === lessonId
    );

    return progress?.completed || false;
  }

  // 🎯 GET LESSON COMPLETION STATUS WITH QUIZ CHECK
  static async getLessonStatus(courseId, userId, lessonId) {
    const db = await connectDB();
    const collection = await db.collection(this.#collection);

    try {
      const course = await collection.findOne({ _id: new ObjectId(courseId) });
      if (!course) return { completed: false, passedQuiz: false };

      const lesson = course.lessons?.find(l => l._id === lessonId);
      if (!lesson) return { completed: false, passedQuiz: false };

      const progress = course?.videoProgress?.find(prog => 
        prog.userId.toString() === userId && prog.lessonId === lessonId
      );

      let passedQuiz = false;
      let hasQuiz = false;
      
      if (lesson.quiz && lesson.quiz.attempts) {
        hasQuiz = true;
        const userAttempts = lesson.quiz.attempts.filter(attempt => 
          attempt.userId.toString() === userId
        );
        passedQuiz = userAttempts.some(attempt => attempt.passed);
      }

      return {
        completed: progress?.completed || false,
        passedQuiz,
        hasQuiz,
        progress: progress?.progress || 0,
        videoWatched: progress?.progress >= 90 // 90% video watched
      };
    } catch (error) {
      console.error("Error getting lesson status:", error);
      return { completed: false, passedQuiz: false };
    }
  }

  // 🎯 QUIZ METHODS - FIXED ID COMPARISON
  static async addQuizToLesson(courseId, lessonId, quiz) {
    const db = await connectDB();
    const collection = await db.collection(this.#collection);

    try {
      // Generate question IDs as strings for consistency
      const questionsWithIds = quiz.questions?.map(q => ({
        ...q,
        _id: q._id || `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        correctAnswer: Number(q.correctAnswer) || 0
      })) || [];

      const quizWithId = {
        ...quiz,
        _id: new ObjectId().toString(),
        questions: questionsWithIds,
        createdAt: DateTime.utc().toJSDate(),
        updatedAt: DateTime.utc().toJSDate(),
        attempts: []
      };

      const result = await collection.findOneAndUpdate(
        { 
          _id: new ObjectId(courseId),
          "lessons._id": lessonId
        },
        {
          $set: {
            "lessons.$.quiz": quizWithId,
            "lessons.$.updatedAt": DateTime.utc().toJSDate(),
            "updatedAt": DateTime.utc().toJSDate()
          }
        },
        { returnDocument: "after" }
      );

      return result;
    } catch (error) {
      console.error("Error adding quiz to lesson:", error);
      throw error;
    }
  }

  static async updateLessonQuiz(courseId, lessonId, quizData) {
    const db = await connectDB();
    const collection = await db.collection(this.#collection);

    try {
      // Ensure question IDs are strings
      const questionsWithIds = quizData.questions?.map(q => ({
        ...q,
        _id: q._id || `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        correctAnswer: Number(q.correctAnswer) || 0
      })) || [];

      const result = await collection.findOneAndUpdate(
        { 
          _id: new ObjectId(courseId),
          "lessons._id": lessonId
        },
        {
          $set: {
            "lessons.$.quiz.title": quizData.title,
            "lessons.$.quiz.description": quizData.description,
            "lessons.$.quiz.questions": questionsWithIds,
            "lessons.$.quiz.passingScore": quizData.passingScore,
            "lessons.$.quiz.timeLimit": quizData.timeLimit,
            "lessons.$.quiz.updatedAt": DateTime.utc().toJSDate(),
            "updatedAt": DateTime.utc().toJSDate()
          }
        },
        { returnDocument: "after" }
      );

      return result;
    } catch (error) {
      console.error("Error updating quiz:", error);
      throw error;
    }
  }

  static async deleteLessonQuiz(courseId, lessonId) {
    const db = await connectDB();
    const collection = await db.collection(this.#collection);

    try {
      const result = await collection.findOneAndUpdate(
        { 
          _id: new ObjectId(courseId),
          "lessons._id": lessonId
        },
        {
          $set: {
            "lessons.$.quiz": null,
            "lessons.$.updatedAt": DateTime.utc().toJSDate(),
            "updatedAt": DateTime.utc().toJSDate()
          }
        },
        { returnDocument: "after" }
      );

      return result;
    } catch (error) {
      console.error("Error deleting quiz:", error);
      throw error;
    }
  }

  static async submitQuizAttempt(courseId, lessonId, userId, attemptData) {
    const db = await connectDB();
    const collection = await db.collection(this.#collection);

    try {
      // Get course and lesson
      const course = await collection.findOne({ _id: new ObjectId(courseId) });
      if (!course) {
        throw new Error("Course not found");
      }

      const lesson = course.lessons?.find(l => l._id === lessonId);
      if (!lesson) {
        throw new Error("Lesson not found");
      }

      if (!lesson.quiz) {
        throw new Error("Quiz not found for this lesson");
      }

      const quiz = lesson.quiz;
      
      // Check if user has reached maximum attempts (3 attempts)
      const userAttempts = quiz.attempts?.filter(attempt => 
        attempt.userId.toString() === userId
      ) || [];
      
      if (userAttempts.length >= 3) {
        // Check if 24 hours have passed since last attempt
        const lastAttempt = userAttempts[userAttempts.length - 1];
        const lastAttemptTime = new Date(lastAttempt.submittedAt).getTime();
        const now = DateTime.utc().toJSDate().getTime();
        const hoursSinceLastAttempt = (now - lastAttemptTime) / (1000 * 60 * 60);
        
        if (hoursSinceLastAttempt < 24) {
          throw new Error("Maximum attempts (3) reached. Please wait 24 hours before retaking.");
        }
      }

      // Calculate score
      let score = 0;
      let totalPoints = 0;
      const results = [];
      
      // First calculate total possible points
      quiz.questions?.forEach(q => {
        totalPoints += Number(q.points) || 1;
      });

      // Process each answer
      attemptData.answers?.forEach(answer => {
        // Find question by ID - compare as strings
        const question = quiz.questions?.find(q => {
          const questionId = String(q._id);
          const answerId = String(answer.questionId);
          return questionId === answerId;
        });

        if (!question) {
          console.error("Question not found for ID:", answer.questionId);
          return;
        }
        
        const isCorrect = Number(question.correctAnswer) === Number(answer.selectedAnswer);
        
        if (isCorrect) {
          score += Number(question.points) || 1;
        }
        
        results.push({
          questionId: answer.questionId,
          selectedAnswer: answer.selectedAnswer,
          isCorrect,
          correctAnswer: question.correctAnswer,
          points: question.points || 1
        });
      });

      const percentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0;
      const passed = percentage >= (Number(quiz.passingScore) || 70);

      const attempt = {
        _id: new ObjectId(),
        userId: new ObjectId(userId),
        score,
        totalPoints,
        totalQuestions: quiz.questions?.length || 0,
        percentage,
        passed,
        results,
        submittedAt: DateTime.utc().toJSDate(),
        timeSpent: attemptData.timeSpent || 0
      };

      // Add attempt to quiz
      const result = await collection.findOneAndUpdate(
        { 
          _id: new ObjectId(courseId),
          "lessons._id": lessonId
        },
        {
          $push: {
            "lessons.$.quiz.attempts": attempt
          },
          $set: {
            "updatedAt": DateTime.utc().toJSDate()
          }
        },
        { returnDocument: "after" }
      );

      // If passed quiz, update video progress to mark lesson as completed
      if (passed) {
        await this.updateVideoProgress(courseId, userId, lessonId, 100, true);
      }

      return { attempt, quiz };
    } catch (error) {
      console.error("Error submitting quiz attempt:", error);
      throw error;
    }
  }

  static async getUserQuizAttempts(courseId, userId) {
    const db = await connectDB();
    const collection = await db.collection(this.#collection);

    try {
      const course = await collection.findOne({ _id: new ObjectId(courseId) });
      
      if (!course) return [];

      const allAttempts = [];
      course.lessons?.forEach(lesson => {
        if (lesson.quiz?.attempts) {
          const userAttempts = lesson.quiz.attempts.filter(attempt => 
            attempt.userId?.toString() === userId
          );
          userAttempts.forEach(attempt => {
            allAttempts.push({
              ...attempt,
              lessonTitle: lesson.title,
              lessonId: lesson._id,
              quizTitle: lesson.quiz.title,
              lessonCompleted: lesson.completed || false
            });
          });
        }
      });

      // Sort attempts by submission time (newest first)
      return allAttempts.sort((a, b) => 
        new Date(b.submittedAt) - new Date(a.submittedAt)
      );
    } catch (error) {
      console.error("Error getting user attempts:", error);
      throw error;
    }
  }

  static async getLessonQuizStats(courseId, lessonId) {
    const db = await connectDB();
    const collection = await db.collection(this.#collection);

    try {
      const course = await collection.findOne({ _id: new ObjectId(courseId) });
      const lesson = course?.lessons?.find(l => l._id === lessonId);
      
      if (!lesson || !lesson.quiz) return null;

      const quiz = lesson.quiz;
      const stats = {
        totalAttempts: quiz.attempts?.length || 0,
        avgScore: 0,
        passRate: 0,
        topScore: 0,
        questionStats: []
      };

      if (quiz.attempts?.length > 0) {
        const totalPercentage = quiz.attempts.reduce((sum, attempt) => sum + (attempt.percentage || 0), 0);
        const passedCount = quiz.attempts.filter(attempt => attempt.passed).length;
        
        stats.avgScore = totalPercentage / quiz.attempts.length;
        stats.passRate = (passedCount / quiz.attempts.length) * 100;
        stats.topScore = Math.max(...quiz.attempts.map(a => a.percentage || 0));

        // Calculate question statistics
        if (quiz.questions?.length > 0) {
          quiz.questions.forEach((question) => {
            const correctCount = quiz.attempts.reduce((count, attempt) => {
              const result = attempt.results?.find(r => 
                String(r.questionId) === String(question._id)
              );
              return count + (result?.isCorrect ? 1 : 0);
            }, 0);
            
            stats.questionStats.push({
              questionId: question._id,
              questionText: question.text,
              correctPercentage: (correctCount / quiz.attempts.length) * 100
            });
          });
        }
      }

      return stats;
    } catch (error) {
      console.error("Error getting lesson stats:", error);
      throw error;
    }
  }

  static async getCourseQuizStats(courseId) {
    const db = await connectDB();
    const collection = await db.collection(this.#collection);

    try {
      const course = await collection.findOne({ _id: new ObjectId(courseId) });
      
      if (!course) return null;

      const stats = {
        totalQuizzes: 0,
        totalAttempts: 0,
        avgScore: 0,
        passRate: 0,
        lessonStats: []
      };

      let totalPercentage = 0;
      let totalPassed = 0;

      course.lessons?.forEach(lesson => {
        if (lesson.quiz) {
          stats.totalQuizzes++;
          const lessonAttempts = lesson.quiz.attempts?.length || 0;
          stats.totalAttempts += lessonAttempts;
          
          let lessonPercentage = 0;
          let lessonPassed = 0;
          
          lesson.quiz.attempts?.forEach(attempt => {
            lessonPercentage += attempt.percentage || 0;
            totalPercentage += attempt.percentage || 0;
            if (attempt.passed) {
              lessonPassed++;
              totalPassed++;
            }
          });

          stats.lessonStats.push({
            lessonId: lesson._id,
            lessonTitle: lesson.title,
            quizTitle: lesson.quiz.title,
            attempts: lessonAttempts,
            avgScore: lessonAttempts > 0 ? lessonPercentage / lessonAttempts : 0,
            passRate: lessonAttempts > 0 ? (lessonPassed / lessonAttempts) * 100 : 0
          });
        }
      });

      if (stats.totalAttempts > 0) {
        stats.avgScore = totalPercentage / stats.totalAttempts;
        stats.passRate = (totalPassed / stats.totalAttempts) * 100;
      }

      return stats;
    } catch (error) {
      console.error("Error getting course stats:", error);
      throw error;
    }
  }

  // 🎯 CHECK IF QUIZ EXISTS
  static async checkQuizExists(courseId, lessonId) {
    const db = await connectDB();
    const collection = await db.collection(this.#collection);

    const course = await collection.findOne(
      { 
        _id: new ObjectId(courseId),
        "lessons._id": lessonId,
        "lessons.quiz": { $exists: true, $ne: null }
      }
    );

    return !!course;
  }
  
  // 🎯 GET USER'S QUIZ ATTEMPTS FOR A SPECIFIC LESSON
  static async getUserLessonAttempts(courseId, lessonId, userId) {
    const db = await connectDB();
    const collection = await db.collection(this.#collection);

    try {
      const course = await collection.findOne({ _id: new ObjectId(courseId) });
      
      if (!course) return [];

      const lesson = course.lessons?.find(l => l._id === lessonId);
      
      if (!lesson || !lesson.quiz) return [];

      const userAttempts = lesson.quiz.attempts?.filter(attempt => 
        attempt.userId?.toString() === userId
      ) || [];

      return userAttempts.sort((a, b) => 
        new Date(b.submittedAt) - new Date(a.submittedAt)
      );
    } catch (error) {
      console.error("Error getting user lesson attempts:", error);
      throw error;
    }
  }
}

export default Course;