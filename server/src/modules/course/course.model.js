import { ObjectId } from "mongodb";
import connectDB from "../../config/db.js";
import { DateTime } from "luxon";
import PDFDocument from 'pdfkit';

class Course {
  static #collection = "courses";
  static #certificateCollection = "certificates";

  static #generateQuestionId(q) {
    try {
      if (q._id && ObjectId.isValid(q._id)) return q._id.toString();
      if (q._id && typeof q._id === 'string') return q._id;
      return `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    } catch {
      return `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  }

  static async add(newCourse) {
    const db = await connectDB();
    const collection = db.collection(this.#collection);

    const lessons = (newCourse.lessons || []).map(lesson => {
      let quiz = null;
      if (lesson.quiz) {
        const questions = (lesson.quiz.questions || []).map(q => ({
          ...q,
          _id: this.#generateQuestionId(q),
          correctAnswer: Number(q.correctAnswer) || 0
        }));

        quiz = {
          ...lesson.quiz,
          _id: new ObjectId().toString(),
          questions,
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
        quiz
      };
    });

    const record = {
      title: newCourse.title,
      description: newCourse.description,
      instructor: newCourse.instructor,
      duration: lessons.reduce((sum, l) => sum + (l.duration || 0), 0),
      progress: 0,
      completed: false,
      lessons,
      createdBy: new ObjectId(newCourse.createdBy),
      createdAt: DateTime.utc().toJSDate(),
      updatedAt: DateTime.utc().toJSDate(),
      videoProgress: []
    };

    const { insertedId } = await collection.insertOne(record);
    return { _id: insertedId, ...record };
  }

  static async getAll(category) {
    const db = await connectDB();
    const query = category ? { category } : {};
    return await db.collection(this.#collection).find(query).toArray();
  }

  static async get(id) {
    const db = await connectDB();
    return await db.collection(this.#collection).findOne({ _id: new ObjectId(id) });
  }

  static async update(id, updates) {
    const db = await connectDB();
    const collection = db.collection(this.#collection);
    updates.updatedAt = DateTime.utc().toJSDate();

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );

    return result.matchedCount ? await this.get(id) : null;
  }

  static async addLesson(courseId, newLesson) {
    const db = await connectDB();
    const collection = db.collection(this.#collection);

    let quiz = null;
    if (newLesson.quiz) {
      const questions = (newLesson.quiz.questions || []).map(q => ({
        ...q,
        _id: this.#generateQuestionId(q),
        correctAnswer: Number(q.correctAnswer) || 0
      }));

      quiz = {
        ...newLesson.quiz,
        _id: new ObjectId().toString(),
        questions,
        createdAt: DateTime.utc().toJSDate(),
        attempts: []
      };
    }

    const lesson = {
      _id: new ObjectId().toString(),
      title: newLesson.title,
      description: newLesson.description,
      url: newLesson.url,
      duration: newLesson.duration,
      createdAt: DateTime.utc().toJSDate(),
      quiz
    };

    return await collection.findOneAndUpdate(
      { _id: new ObjectId(courseId) },
      {
        $push: { lessons: lesson },
        $inc: { duration: newLesson.duration },
        $set: { updatedAt: DateTime.utc().toJSDate() }
      },
      { returnDocument: "after" }
    );
  }

  static async updateLesson(courseId, lessonId, updates) {
    const db = await connectDB();
    const collection = db.collection(this.#collection);

    let quiz = null;
    if (updates.quiz) {
      const questions = (updates.quiz.questions || []).map(q => ({
        ...q,
        _id: this.#generateQuestionId(q),
        correctAnswer: Number(q.correctAnswer) || 0
      }));

      quiz = { ...updates.quiz, questions, updatedAt: DateTime.utc().toJSDate() };
    }

    return await collection.findOneAndUpdate(
      { _id: new ObjectId(courseId), "lessons._id": lessonId },
      {
        $set: {
          "lessons.$.title": updates.title,
          "lessons.$.description": updates.description,
          "lessons.$.duration": updates.duration,
          "lessons.$.url": updates.url,
          "lessons.$.quiz": quiz,
          "lessons.$.updatedAt": DateTime.utc().toJSDate(),
          updatedAt: DateTime.utc().toJSDate()
        }
      },
      { returnDocument: "after" }
    );
  }

  static async updateVideoProgress(courseId, userId, lessonId, progress, completed = false) {
    const db = await connectDB();
    const collection = db.collection(this.#collection);
    const course = await this.get(courseId);
    if (!course) throw new Error("Course not found");

    const lesson = course.lessons.find(l => l._id === lessonId);
    const hasQuiz = !!lesson?.quiz;

    let canComplete = true;
    if (hasQuiz) {
      const passed = lesson.quiz.attempts?.some(a => a.userId.toString() === userId && a.passed);
      canComplete = passed ?? true;
    }

    const idx = course.videoProgress?.findIndex(p => p.userId.toString() === userId && p.lessonId === lessonId) ?? -1;

    if (idx >= 0) {
      return await collection.findOneAndUpdate(
        { _id: new ObjectId(courseId) },
        {
          $set: {
            [`videoProgress.${idx}.progress`]: progress,
            [`videoProgress.${idx}.completed`]: canComplete && completed,
            [`videoProgress.${idx}.lastWatched`]: DateTime.utc().toJSDate(),
            updatedAt: DateTime.utc().toJSDate()
          }
        },
        { returnDocument: "after" }
      );
    }

    return await collection.findOneAndUpdate(
      { _id: new ObjectId(courseId) },
      {
        $push: {
          videoProgress: {
            userId: new ObjectId(userId),
            lessonId,
            progress,
            completed: canComplete && completed,
            lastWatched: DateTime.utc().toJSDate()
          }
        },
        $set: { updatedAt: DateTime.utc().toJSDate() }
      },
      { returnDocument: "after" }
    );
  }

  static async getVideoProgress(courseId, userId) {
    const course = await this.get(courseId);
    return course?.videoProgress?.filter(p => p.userId.toString() === userId) || [];
  }

  static async checkLessonCompletion(courseId, userId, lessonId) {
    const progress = (await this.getVideoProgress(courseId, userId)).find(p => p.lessonId === lessonId);
    return progress?.completed || false;
  }

  static async getLessonStatus(courseId, userId, lessonId) {
    const course = await this.get(courseId);
    if (!course) return { completed: false, passedQuiz: false };

    const lesson = course.lessons.find(l => l._id === lessonId);
    const progress = course.videoProgress?.find(p => p.userId.toString() === userId && p.lessonId === lessonId);

    let passedQuiz = false;
    let hasQuiz = false;
    if (lesson?.quiz?.attempts) {
      hasQuiz = true;
      passedQuiz = lesson.quiz.attempts.some(a => a.userId.toString() === userId && a.passed);
    }

    return {
      completed: progress?.completed || false,
      passedQuiz,
      hasQuiz,
      progress: progress?.progress || 0,
      videoWatched: (progress?.progress || 0) >= 90
    };
  }

  static async addQuizToLesson(courseId, lessonId, quiz) {
    const db = await connectDB();
    const collection = db.collection(this.#collection);

    const questions = (quiz.questions || []).map(q => ({
      ...q,
      _id: q._id || `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      correctAnswer: Number(q.correctAnswer) || 0
    }));

    const quizObj = {
      ...quiz,
      _id: new ObjectId().toString(),
      questions,
      createdAt: DateTime.utc().toJSDate(),
      updatedAt: DateTime.utc().toJSDate(),
      attempts: []
    };

    return await collection.findOneAndUpdate(
      { _id: new ObjectId(courseId), "lessons._id": lessonId },
      {
        $set: {
          "lessons.$.quiz": quizObj,
          "lessons.$.updatedAt": DateTime.utc().toJSDate(),
          updatedAt: DateTime.utc().toJSDate()
        }
      },
      { returnDocument: "after" }
    );
  }

  static async updateLessonQuiz(courseId, lessonId, quizData) {
    const db = await connectDB();
    const collection = db.collection(this.#collection);

    const questions = (quizData.questions || []).map(q => ({
      ...q,
      _id: q._id || `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      correctAnswer: Number(q.correctAnswer) || 0
    }));

    return await collection.findOneAndUpdate(
      { _id: new ObjectId(courseId), "lessons._id": lessonId },
      {
        $set: {
          "lessons.$.quiz.title": quizData.title,
          "lessons.$.quiz.description": quizData.description,
          "lessons.$.quiz.questions": questions,
          "lessons.$.quiz.passingScore": quizData.passingScore,
          "lessons.$.quiz.timeLimit": quizData.timeLimit,
          "lessons.$.quiz.updatedAt": DateTime.utc().toJSDate(),
          updatedAt: DateTime.utc().toJSDate()
        }
      },
      { returnDocument: "after" }
    );
  }

  static async deleteLessonQuiz(courseId, lessonId) {
    const db = await connectDB();
    return await db.collection(this.#collection).findOneAndUpdate(
      { _id: new ObjectId(courseId), "lessons._id": lessonId },
      {
        $set: {
          "lessons.$.quiz": null,
          "lessons.$.updatedAt": DateTime.utc().toJSDate(),
          updatedAt: DateTime.utc().toJSDate()
        }
      },
      { returnDocument: "after" }
    );
  }

  static async submitQuizAttempt(courseId, lessonId, userId, attemptData) {
    const db = await connectDB();
    const collection = db.collection(this.#collection);
    const course = await this.get(courseId);
    if (!course) throw new Error("Course not found");

    const lesson = course.lessons.find(l => l._id === lessonId);
    if (!lesson?.quiz) throw new Error("Quiz not found");

    const attempts = lesson.quiz.attempts?.filter(a => a.userId.toString() === userId) || [];
    if (attempts.length >= 3) {
      const last = attempts[attempts.length - 1];
      const hoursSince = (Date.now() - new Date(last.submittedAt).getTime()) / (3600000);
      if (hoursSince < 24) throw new Error("Maximum attempts reached. Wait 24 hours.");
    }

    let score = 0, totalPoints = 0;
    const results = [];

    lesson.quiz.questions.forEach(q => totalPoints += Number(q.points) || 1);

    attemptData.answers?.forEach(ans => {
      const q = lesson.quiz.questions.find(q => String(q._id) === String(ans.questionId));
      if (!q) return;

      const correct = Number(q.correctAnswer) === Number(ans.selectedAnswer);
      if (correct) score += Number(q.points) || 1;

      results.push({
        questionId: ans.questionId,
        selectedAnswer: ans.selectedAnswer,
        isCorrect: correct,
        correctAnswer: q.correctAnswer,
        points: q.points || 1
      });
    });

    const percentage = totalPoints ? (score / totalPoints) * 100 : 0;
    const passed = percentage >= (Number(lesson.quiz.passingScore) || 70);

    const attempt = {
      _id: new ObjectId(),
      userId: new ObjectId(userId),
      score,
      totalPoints,
      totalQuestions: lesson.quiz.questions.length,
      percentage,
      passed,
      results,
      submittedAt: DateTime.utc().toJSDate(),
      timeSpent: attemptData.timeSpent || 0
    };

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(courseId), "lessons._id": lessonId },
      {
        $push: { "lessons.$.quiz.attempts": attempt },
        $set: { updatedAt: DateTime.utc().toJSDate() }
      },
      { returnDocument: "after" }
    );

    if (passed) await this.updateVideoProgress(courseId, userId, lessonId, 100, true);

    return { attempt, quiz: lesson.quiz };
  }

  static async getUserQuizAttempts(courseId, userId) {
    const course = await this.get(courseId);
    if (!course) return [];

    const attempts = [];
    course.lessons.forEach(lesson => {
      lesson.quiz?.attempts
        ?.filter(a => a.userId.toString() === userId)
        .forEach(a => attempts.push({
          ...a,
          lessonTitle: lesson.title,
          lessonId: lesson._id,
          quizTitle: lesson.quiz.title
        }));
    });

    return attempts.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  }

  static async getLessonQuizStats(courseId, lessonId) {
    const course = await this.get(courseId);
    const quiz = course?.lessons.find(l => l._id === lessonId)?.quiz;
    if (!quiz) return null;

    const stats = { totalAttempts: quiz.attempts?.length || 0, avgScore: 0, passRate: 0, topScore: 0, questionStats: [] };
    if (!stats.totalAttempts) return stats;

    const totalPerc = quiz.attempts.reduce((s, a) => s + (a.percentage || 0), 0);
    const passed = quiz.attempts.filter(a => a.passed).length;

    stats.avgScore = totalPerc / stats.totalAttempts;
    stats.passRate = (passed / stats.totalAttempts) * 100;
    stats.topScore = Math.max(...quiz.attempts.map(a => a.percentage || 0));

    quiz.questions.forEach(q => {
      const correct = quiz.attempts.reduce((c, a) => c + (a.results?.find(r => String(r.questionId) === String(q._id))?.isCorrect ? 1 : 0), 0);
      stats.questionStats.push({
        questionId: q._id,
        questionText: q.text,
        correctPercentage: (correct / stats.totalAttempts) * 100
      });
    });

    return stats;
  }

  static async getCourseQuizStats(courseId) {
    const course = await this.get(courseId);
    if (!course) return null;

    const stats = { totalQuizzes: 0, totalAttempts: 0, avgScore: 0, passRate: 0, lessonStats: [] };
    let totalPerc = 0, totalPassed = 0;

    course.lessons.forEach(lesson => {
      if (!lesson.quiz) return;
      stats.totalQuizzes++;
      const attempts = lesson.quiz.attempts?.length || 0;
      stats.totalAttempts += attempts;

      let lessonPerc = 0, lessonPassed = 0;
      lesson.quiz.attempts?.forEach(a => {
        lessonPerc += a.percentage || 0;
        totalPerc += a.percentage || 0;
        if (a.passed) { lessonPassed++; totalPassed++; }
      });

      stats.lessonStats.push({
        lessonId: lesson._id,
        lessonTitle: lesson.title,
        quizTitle: lesson.quiz.title,
        attempts,
        avgScore: attempts ? lessonPerc / attempts : 0,
        passRate: attempts ? (lessonPassed / attempts) * 100 : 0
      });
    });

    if (stats.totalAttempts) {
      stats.avgScore = totalPerc / stats.totalAttempts;
      stats.passRate = (totalPassed / stats.totalAttempts) * 100;
    }

    return stats;
  }

  static async checkQuizExists(courseId, lessonId) {
    const db = await connectDB();
    return !!(await db.collection(this.#collection).findOne({
      _id: new ObjectId(courseId),
      "lessons._id": lessonId,
      "lessons.quiz": { $exists: true, $ne: null }
    }));
  }

  static async getUserLessonAttempts(courseId, lessonId, userId) {
    const course = await this.get(courseId);
    const attempts = course?.lessons.find(l => l._id === lessonId)?.quiz?.attempts
      ?.filter(a => a.userId.toString() === userId) || [];

    return attempts.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  }

  static async getCourseCompletionStatus(courseId, userId) {
    const course = await this.get(courseId);
    if (!course) throw new Error("Course not found");

    const lessonStatuses = await Promise.all(
      course.lessons.map(async lesson => {
        const status = await this.getLessonStatus(courseId, userId, lesson._id);
        return {
          lessonId: lesson._id,
          title: lesson.title,
          hasQuiz: !!lesson.quiz,
          completed: status.completed,
          passedQuiz: status.passedQuiz,
          videoWatched: status.videoWatched
        };
      })
    );

    const fullyCompleted = lessonStatuses.filter(l =>
      l.videoWatched && (!l.hasQuiz || l.passedQuiz)
    );

    const needing = lessonStatuses
      .filter(l => !fullyCompleted.some(f => f.lessonId === l.lessonId))
      .map(l => l.videoWatched ? `Pass quiz for "${l.title}"` : `Watch "${l.title}" video`);

    return {
      fullyCompleted: fullyCompleted.length === lessonStatuses.length,
      completionPercentage: Math.round((fullyCompleted.length / lessonStatuses.length) * 100),
      totalLessons: lessonStatuses.length,
      completedLessons: lessonStatuses.filter(l => l.completed).length,
      totalQuizzes: lessonStatuses.filter(l => l.hasQuiz).length,
      passedQuizzes: lessonStatuses.filter(l => l.passedQuiz).length,
      fullyCompletedLessons: fullyCompleted.length,
      lessonsNeedingCompletion: needing,
      lessons: lessonStatuses
    };
  }

  static async getUserCertificate(courseId, userId) {
    const db = await connectDB();
    return await db.collection(this.#certificateCollection).findOne({
      courseId: new ObjectId(courseId),
      userId: new ObjectId(userId)
    });
  }

  static async generateCertificate(courseId, userId, userName = null) {
    const db = await connectDB();
    const certColl = db.collection(this.#certificateCollection);
    const courseColl = db.collection(this.#collection);
    const userColl = db.collection("users");

    const course = await courseColl.findOne({ _id: new ObjectId(courseId) });
    if (!course) throw new Error("Course not found");

    const user = await userColl.findOne(
      { _id: new ObjectId(userId) },
      { projection: { firstName: 1, lastName: 1, name: 1, email: 1 } }
    );
    if (!user) throw new Error("User not found");

    let name = userName?.trim();
    if (!name) {
      name = user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`.trim()
        : user.name?.trim()
        || user.email?.split('@')[0]
            .replace(/[._-]/g, ' ')
            .split(' ')
            .map(w => w[0].toUpperCase() + w.slice(1).toLowerCase())
            .join(' ')
        || "Student";
    }

    const certNum = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const now = DateTime.utc();

    const cert = {
      _id: new ObjectId(),
      certificateNumber: certNum,
      courseId: new ObjectId(courseId),
      userId: new ObjectId(userId),
      courseTitle: course.title,
      courseDescription: course.description,
      courseDuration: course.duration,
      userName: name,
      userEmail: user.email,
      instructor: course.instructor || "Learning Platform",
      issuedAt: now.toJSDate(),
      expiryDate: now.plus({ years: 2 }).toJSDate(),
      completionDate: now.toJSDate(),
      createdAt: now.toJSDate(),
      updatedAt: now.toJSDate(),
      status: "active",
      verificationUrl: `https://example.com/verify/${certNum}`,
      metadata: { totalLessons: course.lessons?.length || 0, platform: "Learning Management System" }
    };

    await certColl.insertOne(cert);
    return cert;
  }

  static async generateCertificatePDF(certificate) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ 
          layout: 'landscape', 
          size: 'A4', 
          margin: 0,
          bufferPages: true 
        });
        const buffers = [];

        doc.on('data', chunk => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        const width = doc.page.width;
        const height = doc.page.height;
        const maroon = '#6b0000'; 

        // 1. DECORATIVE CORNERS
        doc.fillColor(maroon);
        const barSize = 90;
        const thick = 10;
        // Top Left
        doc.rect(0, 0, barSize, thick).fill();
        doc.rect(0, 0, thick, barSize).fill();
        // Top Right
        doc.rect(width - barSize, 0, barSize, thick).fill();
        doc.rect(width - thick, 0, thick, barSize).fill();
        // Bottom Left
        doc.rect(0, height - thick, barSize, thick).fill();
        doc.rect(0, height - barSize, thick, barSize).fill();
        // Bottom Right
        doc.rect(width - barSize, height - thick, barSize, thick).fill();
        doc.rect(width - thick, height - barSize, thick, barSize).fill();

        // 2. DOUBLE BORDER
        doc.strokeColor(maroon).lineWidth(1.5).rect(20, 20, width - 40, height - 40).stroke();
        doc.lineWidth(3).rect(32, 32, width - 64, height - 64).stroke();

        // 3. TOP SHIELD ICON
        const iconY = 75;
        doc.save();
        doc.fillColor(maroon);
        doc.path(`M ${width/2 - 18} ${iconY} L ${width/2 + 18} ${iconY} L ${width/2 + 18} ${iconY + 25} Q ${width/2} ${iconY + 40} ${width/2 - 18} ${iconY + 25} Z`).fill();
        doc.fillColor('white').fontSize(14).font('Helvetica-Bold').text('✓', width/2 - 18, iconY + 8, { width: 36, align: 'center' });
        doc.restore();

        // 4. CERTIFICATE OF COMPLETION
        doc.font('Helvetica-Bold').fontSize(40).fillColor('black');
        const text1 = "CERTIFICATE ";
        const text2 = " COMPLETION";
        const w1 = doc.widthOfString(text1);
        const w2 = doc.widthOfString(text2);
        doc.font('Helvetica-Oblique').fontSize(22);
        const wOf = doc.widthOfString(" of ");
        const totalW = w1 + wOf + w2;
        const startX = (width - totalW) / 2;

        doc.font('Helvetica-Bold').fontSize(40).fillColor('black').text("CERTIFICATE", startX, 140);
        doc.font('Helvetica-Oblique').fontSize(22).fillColor(maroon).text("of", startX + w1, 153);
        doc.font('Helvetica-Bold').fontSize(40).fillColor('black').text("COMPLETION", startX + w1 + wOf, 140);

        doc.fillColor('#888888').font('Helvetica-Bold').fontSize(11)
           .text('PROFESSIONAL ACCREDITATION AUTHORITY', 0, 200, { align: 'center', width, characterSpacing: 1.2 });

        // 5. RECIPIENT
        doc.fillColor('#666666').font('Helvetica-Oblique').fontSize(14)
           .text('This is to officially certify that', 0, 255, { align: 'center', width });

        doc.fillColor('black').font('Helvetica-Bold').fontSize(34)
           .text(certificate.userName.toUpperCase(), 0, 285, { align: 'center', width });

        doc.fillColor('#999999').font('Helvetica').fontSize(11)
           .text(`(${certificate.userEmail})`, 0, 330, { align: 'center', width });

        // 6. BODY
        doc.fillColor('#666666').font('Helvetica').fontSize(12)
           .text('has successfully completed all required modules, practical applications, and', 0, 370, { align: 'center', width });
        doc.text('rigorous assessments for', 0, 388, { align: 'center', width });

        // 7. COURSE TITLE
        doc.fillColor(maroon).font('Helvetica-Bold').fontSize(26)
           .text(certificate.courseTitle.toUpperCase(), 0, 420, { align: 'center', width });

        // 8. DATES
        const issued = new Date(certificate.issuedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();
        const valid = new Date(certificate.expiryDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();
        doc.fillColor('#888888').font('Helvetica-Bold').fontSize(10)
           .text(`ISSUED ON: ${issued}    •    VALID UNTIL: ${valid}`, 0, 475, { align: 'center', width });

        // 9. SIGNATURES & SEAL
        const sigY = 535;
        const sigWidth = 180;
        doc.strokeColor('black').lineWidth(1).moveTo(120, sigY).lineTo(120 + sigWidth, sigY).stroke();
        doc.fillColor('black').font('Helvetica-Bold').fontSize(10)
           .text('COMPLIANCE HEAD', 120, sigY + 10, { width: sigWidth, align: 'center' });
        doc.strokeColor('black').lineWidth(1).moveTo(width - 120 - sigWidth, sigY).lineTo(width - 120, sigY).stroke();
        doc.fillColor('black').font('Helvetica-Bold').fontSize(10)
           .text('PRESIDENT & CEO', width - 120 - sigWidth, sigY + 10, { width: sigWidth, align: 'center' });

        doc.fillColor(maroon).circle(width/2, sigY - 15, 38).fill();
        doc.fillColor('white').fontSize(25).text('Ω', width/2 - 40, sigY - 30, { width: 80, align: 'center' });
        doc.fillColor(maroon).roundedRect(width/2 - 65, sigY + 18, 130, 22, 11).fill();
        doc.fillColor('white').font('Helvetica-Bold').fontSize(9)
           .text('VERIFIED & ACTIVE', width/2 - 65, sigY + 25, { width: 130, align: 'center' });

        // 10. FIXED FOOTER ID
        doc.fillColor('#888888').font('Helvetica-Bold').fontSize(10)
           .text(`CERTIFICATE ID: `, 0, height - 70, { align: 'center', width, continued: true })
           .fillColor(maroon).text(certificate.certificateNumber);

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}

export default Course;