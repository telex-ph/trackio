import { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Award,
  BarChart,
  Users,
  CheckCircle,
  AlertCircle,
  Trophy,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  User,
  Info,
  Lock,

} from "lucide-react";
import api from "../../utils/axios";
import { toast } from "react-hot-toast";
import { useStore } from "../../store/useStore";

const Modal = ({ children, onClose, maxWidth = "max-w-5xl" }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
    onClick={onClose}
  >
    <div
      className={`w-full ${maxWidth} mx-auto`}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  </div>
);

const InputStyle = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none transition";

const QuizCreator = ({ lesson, onSave, onClose, isEditing = false }) => {
  const [quizForm, setQuizForm] = useState({
    title: "",
    description: "",
    passingScore: 70,
    timeLimit: 0,
    questions: []
  });

  const [currentQuestion, setCurrentQuestion] = useState({
    text: "",
    questionType: "multiple-choice",
    options: ["", "", "", ""],
    correctAnswer: 0,
    points: 1,
    explanation: ""
  });

  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isEditing && lesson?.quiz) {
      // Ensure questions have IDs and correctAnswer is number
      const questionsWithIds = lesson.quiz.questions?.map(q => ({
        ...q,
        _id: q._id || `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        correctAnswer: Number(q.correctAnswer) || 0
      })) || [];
      
      setQuizForm({
        title: lesson.quiz.title || "",
        description: lesson.quiz.description || "",
        passingScore: lesson.quiz.passingScore || 70,
        timeLimit: lesson.quiz.timeLimit || 0,
        questions: questionsWithIds
      });
    } else if (!isEditing) {
      setQuizForm({
        title: `${lesson?.title || ""} Quiz`,
        description: `Test your knowledge from "${lesson?.title || ""}"`,
        passingScore: 70,
        timeLimit: 0,
        questions: []
      });
    }
  }, [lesson, isEditing]);

  const handleAddOrUpdateQuestion = () => {
    if (!currentQuestion.text.trim()) {
      toast.error("Question text is required");
      return;
    }

    if (currentQuestion.questionType === "multiple-choice") {
      const hasEmptyOptions = currentQuestion.options.some(opt => !opt.trim());
      if (hasEmptyOptions) {
        toast.error("All options must be filled");
        return;
      }
    }

    const questionId = editingQuestionIndex !== null 
      ? quizForm.questions[editingQuestionIndex]?._id 
      : `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newQuestion = {
      _id: questionId,
      text: currentQuestion.text.trim(),
      questionType: currentQuestion.questionType,
      options: currentQuestion.questionType === "true-false" 
        ? ["True", "False"] 
        : currentQuestion.options.map(opt => opt.trim()),
      correctAnswer: Number(currentQuestion.correctAnswer),
      points: Number(currentQuestion.points) || 1,
      explanation: currentQuestion.explanation.trim()
    };

    if (editingQuestionIndex !== null) {
      const updatedQuestions = [...quizForm.questions];
      updatedQuestions[editingQuestionIndex] = newQuestion;
      setQuizForm(prev => ({ ...prev, questions: updatedQuestions }));
      setEditingQuestionIndex(null);
    } else {
      setQuizForm(prev => ({
        ...prev,
        questions: [...prev.questions, newQuestion]
      }));
    }

    setCurrentQuestion({
      text: "",
      questionType: "multiple-choice",
      options: ["", "", "", ""],
      correctAnswer: 0,
      points: 1,
      explanation: ""
    });

    toast.success(editingQuestionIndex !== null ? "Question updated!" : "Question added!");
  };

  const handleEditQuestion = (index) => {
    const question = quizForm.questions[index];
    if (!question) return;
    
    setCurrentQuestion({
      text: question.text || "",
      questionType: question.questionType || "multiple-choice",
      options: question.questionType === "true-false" 
        ? ["True", "False"] 
        : [...(question.options || ["", "", "", ""])],
      correctAnswer: Number(question.correctAnswer) || 0,
      points: Number(question.points) || 1,
      explanation: question.explanation || ""
    });
    setEditingQuestionIndex(index);
  };

  const handleRemoveQuestion = (index) => {
    const updatedQuestions = quizForm.questions.filter((_, i) => i !== index);
    setQuizForm(prev => ({ ...prev, questions: updatedQuestions }));
    toast.success("Question removed!");
  };

  const handleQuestionTypeChange = (type) => {
    if (type === "true-false") {
      setCurrentQuestion(prev => ({
        ...prev,
        questionType: type,
        options: ["True", "False"],
        correctAnswer: 0
      }));
    } else {
      setCurrentQuestion(prev => ({
        ...prev,
        questionType: type,
        options: ["", "", "", ""],
        correctAnswer: 0
      }));
    }
  };

  const handleSaveQuiz = async () => {
    if (!quizForm.title.trim()) {
      toast.error("Quiz title is required");
      return;
    }

    if (quizForm.questions.length === 0) {
      toast.error("Please add at least one question");
      return;
    }

    // Validate all correct answers are within range
    const invalidQuestions = quizForm.questions.filter((q, idx) => {
      if (q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
        return true;
      }
      return false;
    });

    if (invalidQuestions.length > 0) {
      toast.error(`Questions ${invalidQuestions.map(q => quizForm.questions.indexOf(q) + 1).join(', ')} have invalid correct answers`);
      return;
    }

    setIsSaving(true);

    try {
      // Ensure all questions have string IDs and correctAnswer is number
      const questionsWithIds = quizForm.questions.map(q => ({
        ...q,
        _id: q._id || `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        correctAnswer: Number(q.correctAnswer)
      }));

      const quizData = {
        ...quizForm,
        questions: questionsWithIds
      };

      await onSave(quizData);
    } catch (error) {
      console.error("Error saving quiz:", error);
      toast.error("Failed to save quiz");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            {isEditing ? "✏️ Edit Quiz" : "📝 Create Quiz for Lesson"}
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Lesson: <span className="font-semibold text-red-600">{lesson?.title}</span>
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quiz Title *
              </label>
              <input
                type="text"
                value={quizForm.title}
                onChange={(e) => setQuizForm(prev => ({ ...prev, title: e.target.value }))}
                className={InputStyle}
                placeholder="e.g., Chapter 1 Quiz"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Passing Score (%) *
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={quizForm.passingScore}
                onChange={(e) => setQuizForm(prev => ({ ...prev, passingScore: parseInt(e.target.value) || 70 }))}
                className={InputStyle}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Limit (minutes)
              </label>
              <input
                type="number"
                min="0"
                value={quizForm.timeLimit}
                onChange={(e) => setQuizForm(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 0 }))}
                className={InputStyle}
                placeholder="0 for no time limit"
              />
              {quizForm.timeLimit > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Quiz will auto-submit after {quizForm.timeLimit} minutes
                </p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={quizForm.description}
                onChange={(e) => setQuizForm(prev => ({ ...prev, description: e.target.value }))}
                className={InputStyle}
                rows="2"
                placeholder="What will this quiz test? What should students focus on?"
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h4 className="font-bold text-gray-700 mb-4">
            {editingQuestionIndex !== null ? "✏️ Edit Question" : "❓ Add New Question"}
          </h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Question Text *
              </label>
              <textarea
                value={currentQuestion.text}
                onChange={(e) => setCurrentQuestion(prev => ({ ...prev, text: e.target.value }))}
                className={InputStyle}
                rows="3"
                placeholder="Enter your question here..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Type
              </label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => handleQuestionTypeChange("multiple-choice")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    currentQuestion.questionType === "multiple-choice"
                      ? "bg-red-100 text-red-700 border border-red-300"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Multiple Choice
                </button>
                <button
                  type="button"
                  onClick={() => handleQuestionTypeChange("true-false")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    currentQuestion.questionType === "true-false"
                      ? "bg-red-100 text-red-700 border border-red-300"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  True/False
                </button>
              </div>
            </div>

            {currentQuestion.questionType === "multiple-choice" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Answer Options *
                </label>
                <div className="space-y-2">
                  {currentQuestion.options.map((option, idx) => (
                    <div key={`option-${idx}`} className="flex items-center space-x-3 bg-white p-3 rounded-lg border">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="correctAnswer"
                          checked={currentQuestion.correctAnswer === idx}
                          onChange={() => setCurrentQuestion(prev => ({ ...prev, correctAnswer: idx }))}
                          className="text-red-600 focus:ring-red-500"
                        />
                        <span className="ml-3 text-sm font-medium text-gray-700 w-6">
                          {String.fromCharCode(65 + idx)}.
                        </span>
                      </div>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...currentQuestion.options];
                          newOptions[idx] = e.target.value;
                          setCurrentQuestion(prev => ({ ...prev, options: newOptions }));
                        }}
                        className={`${InputStyle} flex-1 border-0 focus:ring-0`}
                        placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentQuestion.questionType === "true-false" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Correct Answer
                </label>
                <div className="flex space-x-4">
                  {["True", "False"].map((option, idx) => (
                    <button
                      key={`true-false-${idx}`}
                      type="button"
                      onClick={() => setCurrentQuestion(prev => ({ ...prev, correctAnswer: idx }))}
                      className={`px-6 py-3 rounded-lg font-medium transition ${
                        currentQuestion.correctAnswer === idx
                          ? "bg-red-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {option}
                      {currentQuestion.correctAnswer === idx && " ✓"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Points
                </label>
                <input
                  type="number"
                  min="1"
                  value={currentQuestion.points}
                  onChange={(e) => setCurrentQuestion(prev => ({ ...prev, points: parseInt(e.target.value) || 1 }))}
                  className={InputStyle}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Explanation (optional)
                </label>
                <input
                  type="text"
                  value={currentQuestion.explanation}
                  onChange={(e) => setCurrentQuestion(prev => ({ ...prev, explanation: e.target.value }))}
                  className={InputStyle}
                  placeholder="Why is this answer correct?"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddOrUpdateQuestion}
              className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              {editingQuestionIndex !== null ? "Update Question" : "Add Question to Quiz"}
            </button>
          </div>
        </div>

        {quizForm.questions.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-gray-700">
                📚 Quiz Questions ({quizForm.questions.length})
              </h4>
              <span className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded-full">
                Total Points: {quizForm.questions.reduce((sum, q) => sum + (q.points || 1), 0)}
              </span>
            </div>
            
            <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
              {quizForm.questions.map((q, idx) => (
                <div key={q._id || idx} className="bg-white p-4 rounded-lg border border-gray-200 hover:border-red-300 transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-sm font-bold text-red-600 bg-red-50 px-2 py-1 rounded">
                          Q{idx + 1}
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {q.questionType === "true-false" ? "True/False" : "Multiple Choice"}
                        </span>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          {q.points || 1} point{(q.points || 1) !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <p className="font-medium text-gray-800 mb-3">{q.text || "No question text"}</p>
                      
                      <div className="space-y-1 ml-2">
                        {(q.options || []).map((opt, optIdx) => (
                          <div key={`option-${idx}-${optIdx}`} className="flex items-center space-x-2">
                            <span className={`text-sm ${optIdx === q.correctAnswer ? 'text-green-600 font-bold' : 'text-gray-500'}`}>
                              {String.fromCharCode(65 + optIdx)}. {opt}
                              {optIdx === q.correctAnswer && " ✅"}
                            </span>
                          </div>
                        ))}
                      </div>
                      
                      {q.explanation && (
                        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                          <p className="text-xs text-yellow-800">
                            💡 <span className="font-medium">Explanation:</span> {q.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        type="button"
                        onClick={() => handleEditQuestion(idx)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Edit Question"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(idx)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Remove Question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-medium"
          >
            Cancel
          </button>
          
          <div className="flex space-x-3">
            {quizForm.questions.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setQuizForm({
                    title: "",
                    description: "",
                    passingScore: 70,
                    timeLimit: 0,
                    questions: []
                  });
                  toast.success("Quiz cleared!");
                }}
                className="px-5 py-2.5 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition font-medium"
              >
                Clear All
              </button>
            )}
            
            <button
              type="button"
              onClick={handleSaveQuiz}
              disabled={quizForm.questions.length === 0 || isSaving}
              className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isEditing ? "Updating..." : "Saving..."}
                </>
              ) : (
                <>
                  {isEditing ? "Update Quiz" : "Save Quiz"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TakeQuiz = ({ quiz, lesson, course, onClose, onComplete, userAttempts = [], returnToLessons }) => {
  const user = useStore((store) => store.user);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(quiz?.timeLimit ? quiz.timeLimit * 60 : 0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [startTime] = useState(Date.now());
  const [attemptCount, setAttemptCount] = useState(0);
  const [canRetake, setCanRetake] = useState(true);
  const [retryMessage, setRetryMessage] = useState("");

  useEffect(() => {
    if (quiz?.timeLimit > 0) {
      setTimeLeft(quiz.timeLimit * 60);
    }
    
    // Get user's attempts for this lesson
    if (lesson?._id && course?._id && user?._id) {
      const lessonAttempts = userAttempts.filter(attempt => 
        attempt.lessonId === lesson._id
      );
      setAttemptCount(lessonAttempts.length);
      
      // STRICT: No 4th attempt allowed
      if (lessonAttempts.length >= 3) {
        setCanRetake(false);
        setRetryMessage("Maximum attempts (3) reached. You cannot retake this quiz.");
      }
    }
  }, [quiz, lesson, course, user, userAttempts]);

  useEffect(() => {
    if (quiz?.timeLimit > 0 && timeLeft > 0 && !result) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (quiz?.timeLimit > 0 && timeLeft <= 0 && !result) {
      handleSubmit();
    }
  }, [timeLeft, result, quiz]);

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const handleSubmit = async () => {
    if (submitting) return;
    
    // STRICT: Check if max attempts reached
    if (attemptCount >= 3) {
      toast.error("Maximum attempts (3) reached. You cannot retake this quiz.");
      return;
    }

    // Check if can retake
    if (!canRetake && retryMessage) {
      toast.error(retryMessage);
      return;
    }

    // Safely get quiz questions
    const quizQuestions = quiz?.questions || [];
    
    // Prepare answers array with question IDs
    const answerArray = quizQuestions.map((question, index) => {
      return {
        questionId: question._id,
        selectedAnswer: answers[index] !== undefined ? Number(answers[index]) : -1
      };
    });

    // Check if any question hasn't been answered
    const unansweredCount = answerArray.filter(a => a.selectedAnswer === -1).length;
    if (unansweredCount > 0) {
      if (!window.confirm(`You haven't answered ${unansweredCount} question(s). Submit anyway?`)) {
        return;
      }
    }

    try {
      setSubmitting(true);
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      
      const { data } = await api.post(
        `/courses/${course._id}/lessons/${lesson._id}/quiz/submit`,
        {
          userId: user._id,
          answers: answerArray,
          timeSpent: timeSpent
        }
      );

      console.log("Quiz submission response:", data);
      setResult(data);
      onComplete?.();
      toast.success("Quiz submitted successfully!");
    } catch (error) {
      console.error("Error submitting quiz:", error);
      console.error("Error details:", error.response?.data);
      
      if (error.response?.data?.message?.includes("Maximum attempts")) {
        setRetryMessage(error.response.data.message);
        setCanRetake(false);
        setAttemptCount(3); // Set to max attempts
        toast.error(error.response.data.message);
      } else {
        toast.error(error.response?.data?.error || "Failed to submit quiz. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!quiz) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-3" />
        <p className="text-gray-600 font-medium">No quiz data available</p>
      </div>
    );
  }

  const maxAttemptsReached = attemptCount >= 3;
  
  if (result || maxAttemptsReached) {
    return (
      <div className="bg-white p-8 rounded-lg">
        <div className="text-center max-w-md mx-auto">
          <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center ${
            maxAttemptsReached 
              ? 'bg-gradient-to-r from-red-100 to-red-200'
              : result.attempt?.passed 
                ? 'bg-gradient-to-r from-green-100 to-emerald-100' 
                : 'bg-gradient-to-r from-red-100 to-pink-100'
          }`}>
            {maxAttemptsReached ? (
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
                <span className="text-xs font-bold text-red-700 mt-1">MAX ATTEMPTS</span>
              </div>
            ) : result.attempt?.passed ? (
              <div className="text-center">
                <Trophy className="w-12 h-12 text-yellow-600 mx-auto" />
                <span className="text-xs font-bold text-yellow-700 mt-1">PASSED!</span>
              </div>
            ) : (
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
                <span className="text-xs font-bold text-red-700 mt-1">FAILED</span>
              </div>
            )}
          </div>
          
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            {maxAttemptsReached 
              ? "⚠️ Maximum Attempts Reached" 
              : result.attempt?.passed 
                ? "🎉 Congratulations!" 
                : "📚 Keep Learning!"}
          </h3>
          
          <p className="text-gray-600 mb-6">
            {maxAttemptsReached 
              ? "You have used all 3 attempts for this quiz." 
              : result.attempt?.passed 
                ? "You've successfully passed the quiz!" 
                : `You need ${result.quiz?.passingScore || 70}% to pass. Try watching the lesson again!`}
          </p>
          
          {!maxAttemptsReached && (
            <>
              <div className="relative w-48 h-48 mx-auto mb-6">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="none" 
                    stroke={result.attempt?.passed ? "#10b981" : "#ef4444"} 
                    strokeWidth="8" 
                    strokeLinecap="round"
                    strokeDasharray={`${(result.attempt?.percentage || 0) * 282.6 / 100} 282.6`}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-4xl font-bold ${result.attempt?.passed ? "text-green-600" : "text-red-600"}`}>
                    {result.attempt?.percentage?.toFixed(1) || 0}%
                  </span>
                  <span className="text-sm text-gray-500">
                    {result.attempt?.score || 0}/{result.attempt?.totalPoints || 0} points
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Status</p>
                  <p className={`font-bold ${result.attempt?.passed ? "text-green-600" : "text-red-600"}`}>
                    {result.attempt?.passed ? "PASSED" : "FAILED"}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Required</p>
                  <p className="font-bold text-gray-800">{result.quiz?.passingScore || 70}%</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Attempt</p>
                  <p className="font-bold text-gray-800">{attemptCount + 1} of 3</p>
                </div>
                {quiz.timeLimit > 0 && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Time Spent</p>
                    <p className="font-bold text-gray-800">
                      {Math.floor((result.attempt?.timeSpent || 0) / 60)}m {(result.attempt?.timeSpent || 0) % 60}s
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
          
          {maxAttemptsReached && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-red-700 font-medium">
                You have used all 3 attempts for this quiz.
              </p>
              <p className="text-sm text-red-600 mt-1">
                You can retake the quiz after 24 hours.
              </p>
            </div>
          )}
          
          <div className="flex space-x-3">
            {!maxAttemptsReached && attemptCount < 3 && !result?.attempt?.passed && (
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setCurrentQuestionIndex(0);
                  setAnswers({});
                  setTimeLeft(quiz.timeLimit ? quiz.timeLimit * 60 : 0);
                }}
                className="flex-1 py-2.5 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition font-medium"
              >
                Retake Quiz
              </button>
            )}
            
            <button
              type="button"
              onClick={() => {
                if (returnToLessons) {
                  returnToLessons();
                } else {
                  onClose();
                }
              }}
              className={`flex-1 py-2.5 ${
                maxAttemptsReached 
                  ? "bg-red-600 text-white hover:bg-red-700" 
                  : result?.attempt?.passed 
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-red-600 text-white hover:bg-red-700"
              } rounded-lg transition font-medium`}
            >
              {maxAttemptsReached 
                ? "Close Quiz" 
                : result?.attempt?.passed 
                  ? "Back to Lessons" 
                  : "Back to Lesson"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions?.[currentQuestionIndex];

  if (!currentQuestion) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-3" />
        <p className="text-gray-600 font-medium">No question data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-gray-800">{quiz.title || "Quiz"}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <p className="text-sm text-gray-600">
                {lesson?.title || "Lesson"} • Question {currentQuestionIndex + 1} of {quiz.questions?.length || 0}
              </p>
              {attemptCount > 0 && (
                <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                  Attempt {attemptCount + 1} of 3
                </span>
              )}
            </div>
          </div>
          <div className="mt-2 md:mt-0">
            <div className="flex items-center space-x-4">
              {quiz.timeLimit > 0 && (
                <div className="text-right">
                  <div className="text-xs text-gray-500">Time Remaining</div>
                  <div className={`text-lg font-bold ${timeLeft < 300 ? "text-red-600 animate-pulse" : "text-gray-800"}`}>
                    {formatTime(timeLeft)}
                  </div>
                </div>
              )}
              <div className="text-right">
                <div className="text-xs text-gray-500">Progress</div>
                <div className="text-lg font-bold text-green-600">
                  {Math.round(((currentQuestionIndex + 1) / (quiz.questions?.length || 1)) * 100)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-xl font-bold text-gray-800">{currentQuestion.text || "Question"}</h4>
            {currentQuestion.points > 1 && (
              <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                {currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          <div className="space-y-3 mt-6">
            {(currentQuestion.options || []).map((option, idx) => (
              <div
                key={`answer-${currentQuestionIndex}-${idx}`}
                onClick={() => handleAnswerSelect(currentQuestionIndex, idx)}
                className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                  answers[currentQuestionIndex] === idx
                    ? "bg-red-50 border-red-500 ring-2 ring-red-200"
                    : "bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 font-bold ${
                    answers[currentQuestionIndex] === idx
                      ? "bg-red-500 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="text-gray-800">{option}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </button>
          
          <div className="flex space-x-2">
            {(quiz.questions || []).map((_, idx) => (
              <button
                key={`question-nav-${idx}`}
                type="button"
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`w-8 h-8 rounded-full text-sm transition ${
                  idx === currentQuestionIndex
                    ? "bg-red-500 text-white ring-2 ring-red-300"
                    : answers[idx] !== undefined
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                title={`Question ${idx + 1}`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
          
          {currentQuestionIndex < (quiz.questions?.length || 0) - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || attemptCount >= 3}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  {attemptCount >= 3 ? "Max Attempts Reached" : "Submit Quiz"}
                  <CheckCircle className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="w-full h-2 bg-gray-200 rounded-full">
          <div 
            className="h-2 bg-red-500 rounded-full transition-all duration-300" 
            style={{ width: `${((currentQuestionIndex + 1) / (quiz.questions?.length || 1)) * 100}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {Object.keys(answers).length} of {quiz.questions?.length || 0} answered
            </span>
            {attemptCount > 0 && (
              <span className="text-sm text-gray-600">
                • Attempt {attemptCount + 1} of 3
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-gray-600 hover:text-gray-800 hover:underline"
          >
            Exit Quiz
          </button>
        </div>
        
        {attemptCount >= 3 && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
            <p className="text-xs text-red-700">Maximum attempts (3) reached. You cannot retake this quiz.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const AdminAnalytics = ({ course, onClose }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (course?._id) {
      fetchAnalytics();
    }
  }, [course]);

  const fetchAnalytics = async () => {
    try {
      const { data } = await api.get(`/courses/${course._id}/admin/analytics`);
      setAnalytics(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center p-8">
        <BarChart className="w-16 h-16 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-600">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-800">📊 Quiz Analytics</h3>
            <p className="text-sm text-gray-600">{course?.title}</p>
          </div>
          <button
            type="button"
            onClick={fetchAnalytics}
            className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center"
          >
            <BarChart className="w-3 h-3 mr-1" />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">Total Quizzes</p>
                <p className="text-2xl font-bold text-blue-800">
                  {analytics.lessonsWithQuizzes || 0}
                </p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-600 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Total Attempts</p>
                <p className="text-2xl font-bold text-green-800">
                  {analytics.totalQuizAttempts || 0}
                </p>
              </div>
              <Users className="w-8 h-8 text-green-600 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700">Avg. Score</p>
                <p className="text-2xl font-bold text-purple-800">
                  {(analytics.averageScore || 0).toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700">Pass Rate</p>
                <p className="text-2xl font-bold text-yellow-800">
                  {(analytics.passRate || 0).toFixed(1)}%
                </p>
              </div>
              <Trophy className="w-8 h-8 text-yellow-600 opacity-50" />
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h4 className="font-bold text-gray-700 mb-4">Lesson-wise Performance</h4>
          <div className="space-y-4">
            {(analytics.lessonAnalytics || []).map((lesson) => (
              <div key={`lesson-${lesson.lessonId}`} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h5 className="font-bold text-gray-800">{lesson.lessonTitle}</h5>
                    <p className="text-sm text-gray-600">{lesson.quizTitle}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-gray-800">
                      {(lesson.averageScore || 0).toFixed(1)}%
                    </span>
                    <p className="text-xs text-gray-500">
                      {lesson.totalAttempts || 0} attempt{(lesson.totalAttempts || 0) !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Pass Rate</span>
                      <span>{(lesson.passRate || 0).toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-green-500 rounded-full" 
                        style={{ width: `${lesson.passRate || 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {Object.keys(analytics.userPerformance || {}).length > 0 && (
          <div>
            <h4 className="font-bold text-gray-700 mb-4">User Performance</h4>
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <div className="grid grid-cols-12 bg-gray-100 p-3 text-sm font-medium text-gray-700">
                <div className="col-span-6">User ID</div>
                <div className="col-span-2">Attempts</div>
                <div className="col-span-2">Avg. Score</div>
                <div className="col-span-2">Pass Rate</div>
              </div>
              <div className="divide-y divide-gray-200">
                {Object.entries(analytics.userPerformance || {}).map(([userId, data], index) => (
                  <div key={`user-${userId}-${index}`} className="grid grid-cols-12 p-3 hover:bg-white transition">
                    <div className="col-span-6">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium">
                          User {userId?.slice(-8) || "Unknown"}
                        </span>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium">{data.totalAttempts || 0}</span>
                    </div>
                    <div className="col-span-2">
                      <span className={`font-bold ${(data.averageScore || 0) >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                        {(data.averageScore || 0).toFixed(1)}%
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium">{(data.passRate || 0).toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const QuizModal = ({ 
  course, 
  initialLessonId = null, 
  onClose, 
  onQuizUpdated,
  onBackToLessons
}) => {
  const user = useStore((store) => store.user);
  const isAdmin = user?.role === "admin" || user?.role === "instructor";
  
  const [activeTab, setActiveTab] = useState("lessons");
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [userAttempts, setUserAttempts] = useState([]);
  const [courseDetails, setCourseDetails] = useState(course);
  const [lessons, setLessons] = useState(course?.lessons || []);

  useEffect(() => {
    if (course?._id && user?._id) {
      fetchCourseDetails();
      if (!isAdmin) {
        fetchUserAttempts();
      }
    }
  }, [course, user, isAdmin]);

  useEffect(() => {
    if (initialLessonId && lessons.length > 0) {
      const lesson = lessons.find(l => l._id === initialLessonId);
      if (lesson && lesson.quiz) {
        setSelectedLesson(lesson);
        setSelectedQuiz(lesson.quiz);
        setActiveTab("take");
      }
    }
  }, [initialLessonId, lessons]);

  const fetchCourseDetails = async () => {
    try {
      const { data } = await api.get(`/courses/${course._id}?userId=${user._id}`);
      setCourseDetails(data);
      setLessons(data.lessons || []);
    } catch (error) {
      console.error("Error fetching course details:", error);
    }
  };

  const fetchUserAttempts = async () => {
    try {
      const { data } = await api.get(`/courses/${course._id}/quiz-attempts?userId=${user._id}`);
      setUserAttempts(data || []);
    } catch (error) {
      console.error("Error fetching user attempts:", error);
    }
  };

  const handleSaveQuiz = async (quizData) => {
    try {
      setLoading(true);
      
      const questionsWithIds = (quizData.questions || []).map(q => ({
        ...q,
        _id: q._id || `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        correctAnswer: Number(q.correctAnswer)
      }));

      const quizDataWithIds = {
        ...quizData,
        questions: questionsWithIds
      };

      if (selectedLesson?.quiz) {
        await api.patch(
          `/courses/${course._id}/lessons/${selectedLesson._id}/quiz`,
          quizDataWithIds
        );
        toast.success("Quiz updated successfully!");
      } else {
        await api.post(
          `/courses/${course._id}/lessons/${selectedLesson._id}/quiz`,
          quizDataWithIds
        );
        toast.success("Quiz created successfully!");
      }
      
      onQuizUpdated?.();
      fetchCourseDetails();
      setSelectedLesson(null);
      setActiveTab("lessons");
    } catch (error) {
      console.error("Error saving quiz:", error);
      console.error("Error details:", error.response?.data);
      toast.error(error.response?.data?.error || "Failed to save quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async (lessonId) => {
    if (!window.confirm("Are you sure you want to delete this quiz?")) return;

    try {
      await api.delete(`/courses/${course._id}/lessons/${lessonId}/quiz`);
      toast.success("Quiz deleted successfully!");
      onQuizUpdated?.();
      fetchCourseDetails();
      setSelectedLesson(null);
    } catch (error) {
      console.error("Error deleting quiz:", error);
      toast.error("Failed to delete quiz");
    }
  };

  const handleTakeQuiz = async (lesson) => {
    // Check if lesson is completed
    if (!isAdmin && !lesson.completed) {
      toast.error("Please complete the lesson video first before taking the quiz!");
      return;
    }
    
    // Check user attempts for this lesson
    const lessonAttempts = userAttempts.filter(attempt => 
      attempt.lessonId === lesson._id
    );
    
    // STRICT: Check if max attempts reached (3 attempts only)
    if (lessonAttempts.length >= 3) {
      toast.error("Maximum attempts (3) reached. You cannot retake this quiz.");
      return;
    }
    
    // If admin, allow taking quiz regardless of completion
    if (isAdmin) {
      toast.info("As an admin, you can take any quiz without completing the lesson.");
    }
    
    setSelectedLesson(lesson);
    setSelectedQuiz(lesson.quiz);
    setActiveTab("take");
  };

  // Get lesson status with strict 3-attempt limit
  const getLessonStatus = (lesson) => {
    const lessonAttempts = userAttempts.filter(attempt => 
      attempt.lessonId === lesson._id
    );
    
    // STRICT: Check if max attempts reached (3 attempts only)
    if (lessonAttempts.length >= 3) {
      return { 
        status: "max-attempts", 
        message: "Maximum attempts reached", 
        canTake: false,
        attemptsCount: lessonAttempts.length
      };
    }
    
    if (!lesson.completed && !isAdmin) {
      return { 
        status: "locked", 
        message: "Complete lesson to unlock", 
        canTake: false,
        attemptsCount: lessonAttempts.length
      };
    }
    
    if (!lesson.quiz) {
      return { 
        status: "no-quiz", 
        message: "No quiz available", 
        canTake: false,
        attemptsCount: lessonAttempts.length
      };
    }
    
    const lastAttempt = lessonAttempts.length > 0 ? lessonAttempts[0] : null;
    
    if (lastAttempt) {
      if (lastAttempt.passed) {
        return { 
          status: "passed", 
          message: "Quiz Passed", 
          canTake: lessonAttempts.length < 3, // Allow retake only if less than 3 attempts
          percentage: lastAttempt.percentage,
          passed: true,
          attemptsCount: lessonAttempts.length
        };
      } else {
        return { 
          status: "failed", 
          message: "Retake Quiz", 
          canTake: lessonAttempts.length < 3, // Allow retake only if less than 3 attempts
          percentage: lastAttempt.percentage,
          passed: false,
          attemptsCount: lessonAttempts.length
        };
      }
    }
    
    return { 
      status: "available", 
      message: "Take Quiz", 
      canTake: true,
      attemptsCount: lessonAttempts.length
    };
  };

  return (
    <Modal onClose={onClose} maxWidth="max-w-4xl">
      <div className="bg-white rounded-xl shadow-[0_20px_40px_-5px_rgba(0,0,0,0.3)] w-full">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-red-50 to-white">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
              <Award className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {showAnalytics ? "📊 Quiz Analytics" : 
                 activeTab === "take" ? "🎯 Take Quiz" : 
                 activeTab === "create" ? "📝 Quiz Creator" : 
                 "📚 Course Quizzes"}
              </h2>
              <p className="text-sm text-gray-600">
                {activeTab === "take" && selectedLesson 
                  ? `${selectedLesson.title}`
                  : courseDetails?.title || course?.title
                }
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {activeTab === "take" && (
              <button
                type="button"
                onClick={() => {
                  if (onBackToLessons) {
                    onBackToLessons();
                  } else {
                    setSelectedQuiz(null);
                    setSelectedLesson(null);
                    setActiveTab("lessons");
                  }
                }}
                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center mr-2"
              >
                <ChevronLeft className="w-3 h-3 mr-1" />
                Back to Lessons
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {showAnalytics ? (
            <AdminAnalytics course={courseDetails || course} onClose={() => setShowAnalytics(false)} />
          ) : activeTab === "create" ? (
            <QuizCreator
              lesson={selectedLesson}
              onSave={handleSaveQuiz}
              onClose={() => {
                setSelectedLesson(null);
                setActiveTab("lessons");
              }}
              isEditing={selectedLesson?.quiz}
            />
          ) : activeTab === "take" ? (
            <TakeQuiz
              quiz={selectedQuiz}
              lesson={selectedLesson}
              course={courseDetails || course}
              onClose={() => {
                setSelectedQuiz(null);
                setSelectedLesson(null);
                setActiveTab("lessons");
                fetchCourseDetails();
                if (!isAdmin) fetchUserAttempts();
              }}
              onComplete={() => {
                fetchCourseDetails();
                if (!isAdmin) fetchUserAttempts();
                toast.success("Quiz submitted successfully!");
              }}
              userAttempts={userAttempts}
              returnToLessons={() => {
                if (onBackToLessons) {
                  onBackToLessons();
                } else {
                  setSelectedQuiz(null);
                  setSelectedLesson(null);
                  setActiveTab("lessons");
                }
              }}
            />
          ) : (
            <div className="space-y-6">
              {isAdmin && (
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-800">
                    📚 Course Lessons ({lessons.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowAnalytics(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center text-sm font-medium"
                  >
                    <BarChart className="w-4 h-4 mr-2" />
                    View Analytics
                  </button>
                </div>
              )}

              {!isAdmin && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center">
                    <Info className="w-5 h-5 text-blue-600 mr-2" />
                    <div>
                      <p className="text-sm text-blue-700 font-medium mb-1">
                        <span className="font-bold">Note:</span> You can only take quizzes for lessons you have completed watching.
                      </p>
                      <p className="text-xs text-blue-600">
                        Complete a lesson by watching at least 90% of the video. Maximum 3 attempts per quiz.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {lessons.length === 0 ? (
                <div className="text-center p-8 bg-gray-50 rounded-lg">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">No lessons available yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {lessons.map((lesson, index) => {
                    const lessonStatus = getLessonStatus(lesson);
                    const userAttempt = userAttempts.find(attempt => attempt.lessonId === lesson._id);
                    const lessonAttempts = userAttempts.filter(attempt => attempt.lessonId === lesson._id);
                    
                    return (
                      <div key={`lesson-${lesson._id || index}`} className="bg-white p-4 rounded-lg border border-gray-200 hover:border-red-300 transition">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-bold text-gray-800">{lesson.title}</h4>
                              <div className="flex space-x-2">
                                {lesson.completed ? (
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Completed
                                  </span>
                                ) : (
                                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full flex items-center">
                                    <Lock className="w-3 h-3 mr-1" />
                                    Not Completed
                                  </span>
                                )}
                                
                                {lesson.quiz && (
                                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                                    Has Quiz
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-3">{lesson.description}</p>
                            
                            <div className="flex items-center space-x-4">
                              {lesson.quiz ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleTakeQuiz(lesson)}
                                    disabled={!lessonStatus.canTake}
                                    className={`px-3 py-1.5 text-sm rounded-lg transition flex items-center font-medium ${
                                      !lessonStatus.canTake
                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        : lessonStatus.status === "passed"
                                        ? "bg-green-600 text-white hover:bg-green-700"
                                        : lessonStatus.status === "failed"
                                        ? "bg-red-600 text-white hover:bg-red-700"
                                        : "bg-red-600 text-white hover:bg-red-700"
                                    }`}
                                    title={!lessonStatus.canTake ? 
                                      (lessonStatus.status === "max-attempts" 
                                        ? "Maximum 3 attempts reached" 
                                        : lessonStatus.message) 
                                      : ""}
                                  >
                                    {lessonStatus.status === "passed" && <CheckCircle className="w-3 h-3 mr-1" />}
                                    {lessonStatus.status === "failed" && <AlertCircle className="w-3 h-3 mr-1" />}
                                    {lessonStatus.status === "available" && <Award className="w-3 h-3 mr-1" />}
                                    {lessonStatus.status === "max-attempts" ? "Max Attempts Reached" : 
                                     lessonStatus.status === "passed" ? "Quiz Passed" : 
                                     lessonStatus.status === "failed" ? "Retake Quiz" : 
                                     lessonStatus.status === "available" ? "Take Quiz" : 
                                     lessonStatus.message}
                                  </button>
                                  
                                  {userAttempt && (
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                      userAttempt.passed ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                    }`}>
                                      Score: {userAttempt.percentage?.toFixed(1) || 0}% - {userAttempt.passed ? "Passed" : "Failed"}
                                    </span>
                                  )}
                                  
                                  <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                                    Attempt {lessonAttempts.length} of 3
                                  </span>
                                  
                                  {lessonStatus.status === "max-attempts" && (
                                    <span className="text-xs text-red-600 flex items-center">
                                      <AlertCircle className="w-3 h-3 mr-1" />
                                      Max attempts (3) reached
                                    </span>
                                  )}
                                </>
                              ) : !isAdmin ? (
                                <span className="text-sm text-gray-500">No quiz available</span>
                              ) : null}
                              
                              {isAdmin && (
                                <div className="flex items-center space-x-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedLesson(lesson);
                                      setActiveTab("create");
                                    }}
                                    className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center"
                                  >
                                    {lesson.quiz ? "Edit Quiz" : "Add Quiz"}
                                  </button>
                                  
                                  {lesson.quiz && (
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteQuiz(lesson._id)}
                                      className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center"
                                    >
                                      <Trash2 className="w-3 h-3 mr-1" />
                                      Delete
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default QuizModal;