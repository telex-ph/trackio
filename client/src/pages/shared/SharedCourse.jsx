import { useState, useMemo, useRef, useEffect } from "react";
import {
  User,
  Clock,
  Play,
  BookOpen,
  X,
  BookOpenText,
  List,
  CheckCircle,
  FileText,
  TrendingUp,
  Grid3x3,
  Users,
  Video,
  Award,
  GraduationCap
} from "lucide-react";
import api from "../../utils/axios";
import CourseHeaderPage from "../../components/courses/CourseHeaderPage";
import CourseUploadModal from "../../components/courses/modals/CourseUploadModal";
import QuizModal from "../../components/modals/QuizModal";
import CertificateModal from "../../components/modals/CertificateModal";
import { useStore } from "../../store/useStore";
import Spinner from "../../assets/loaders/Spinner";
import Empty from "../../assets/illustrations/Empty";

const mockActivity = [
  {
    id: 1,
    type: "New Enrollment",
    details: "Alice enrolled in React Hooks.",
    time: "2 min ago",
  },
  {
    id: 2,
    type: "Course Upload",
    details: "New video added to Figma UI/UX.",
    time: "1 hr ago",
  },
  {
    id: 3,
    type: "Activity Received",
    details: "New enrollment processed.",
    time: "1 day ago",
  },
  {
    id: 4,
    type: "New Enrollment",
    details: "Bob joined Next.js course.",
    time: "2 days ago",
  },
  {
    id: 5,
    type: "Course Upload",
    details: "Security lesson updated.",
    time: "5 days ago",
  },
];

const mockInstructors = [
  { id: 1, name: "John Doe", role: "Senior Developer", courses: 5 },
  { id: 2, name: "Jane Smith", role: "UI/UX Expert", courses: 8 },
  { id: 3, name: "Mike Johnson", role: "Backend Specialist", courses: 3 },
  { id: 4, name: "Sarah Wilson", role: "DevOps Engineer", courses: 6 },
];

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

const VideoItem = ({ v, i, onPlay }) => (
  <li
    key={v.id}
    className="flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0 hover:bg-red-50 rounded-lg transition"
  >
    <div className="flex items-center space-x-4">
      <span className="text-lg font-bold text-gray-400 w-6 shrink-0 hidden sm:inline">
        {String(i + 1).padStart(2, "0")}
      </span>
      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-red-800 flex items-center justify-center shrink-0">
        <Play className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
      </div>
      <div>
        <p className="text-sm sm:text-base font-semibold text-gray-800">
          {v.title}
        </p>
        <p className="text-xs sm:text-sm text-gray-500">
          {v.instructor} • {v.type}
        </p>
      </div>
    </div>
    <div className="flex items-center space-x-3 sm:space-x-6">
      <div className="flex flex-col items-end hidden sm:flex">
        <span className="text-gray-600 font-medium text-sm">{v.time}</span>
        {v.progress > 0 && (
          <div className="mt-1 w-16 h-1.5 bg-gray-200 rounded-full">
            <div
              className={`h-1.5 rounded-full ${
                v.progress === 100 ? "bg-green-500" : "bg-red-600"
              }`}
              style={{ width: `${v.progress}%` }}
            />
          </div>
        )}
        {v.progress === 100 ? (
          <span className="text-xs font-bold text-green-600 mt-0.5">
            Finished
          </span>
        ) : (
          v.progress > 0 && (
            <span className="text-xs font-medium text-red-600 mt-0.5">
              {v.progress}%
            </span>
          )
        )}
      </div>
      <button
        onClick={() => onPlay(v)}
        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center hover:bg-red-200 transition"
      >
        <Play className="w-3 h-3 sm:w-4 sm:h-4" />
      </button>
    </div>
  </li>
);

const CourseCard = ({ c, onViewDetails, onOpenUpload, onOpenQuizzes, onOpenCertificate }) => {
  const user = useStore((store) => store.user);
  const lessons = c.lessons;
  const overAllDuration = lessons.reduce((acc, current) => {
    return acc + current.duration;
  }, 0);

  const hasQuizzes = c.lessons?.some(lesson => lesson.quiz) || false;
  const totalQuizzes = c.lessons?.filter(lesson => lesson.quiz).length || 0;
  const isAdmin = user?.role === "admin" || user?.role === "instructor";

  // Calculate if course is fully completed (for users)
  const isCourseFullyCompleted = () => {
    if (user.role === "instructor" || user.role === "admin") return false;
    
    const completedLessons = c.lessons?.filter(lesson => {
      const hasQuiz = lesson.quiz ? true : false;
      const passedQuiz = lesson.quiz?.attempts?.some(attempt => 
        attempt.userId === user._id && attempt.passed
      ) || false;
      
      return lesson.completed && (!hasQuiz || passedQuiz);
    }) || [];
    
    return completedLessons.length === c.lessons?.length && c.lessons?.length > 0;
  };

  const certificateReady = isCourseFullyCompleted();

  return (
    <div className="bg-white border-white rounded-xl shadow-lg hover:shadow-xl transition duration-300 overflow-hidden cursor-pointer">
      <div className="h-32 sm:h-40 bg-white relative">
        <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-red-800">
          <BookOpen className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>
        <div className="absolute bottom-2 right-2 flex items-center bg-red-900/80 text-white text-xs font-semibold px-2 py-1 rounded-full">
          <Play className="w-3 h-3 mr-1" />
          {(Math.floor(overAllDuration) / 60).toFixed(1)} minutes
        </div>
        {hasQuizzes && (
          <div className="absolute top-2 left-2">
            <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
              <Award className="w-3 h-3 mr-1" />
              {totalQuizzes} Quiz{totalQuizzes !== 1 ? 'zes' : ''}
            </span>
          </div>
        )}
        {certificateReady && (
          <div className="absolute top-2 right-2">
            <span className="bg-gradient-to-r from-green-600 to-green-700 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center animate-pulse">
              <GraduationCap className="w-3 h-3 mr-1" />
              Certificate Ready
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h4 className="font-semibold text-lg truncate mb-1">{c.title}</h4>
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{c.description}</p>
        <div className="text-sm text-gray-500 flex items-center mb-3">
          <User className="w-4 h-4 mr-1 text-red-700" />
          <span className="text-red-800 font-medium">
            {c.instructor
              ? c.instructor.charAt(0).toUpperCase() + c.instructor.slice(1)
              : ""}
          </span>
        </div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-base font-bold text-gray-800 flex items-center">
            <BookOpenText className="w-4 h-4 mr-1 text-red-600" />
            {c.lessons.length} Lessons
          </p>
          <div className="flex items-center space-x-2">
            {hasQuizzes && (
              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                {totalQuizzes} Quiz{totalQuizzes !== 1 ? 'zes' : ''}
              </span>
            )}
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {c.progress || 0}% Complete
            </span>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(c);
            }}
            className="px-3 py-1 text-sm bg-red-800 text-white rounded-lg hover:bg-red-700 transition"
          >
            View Lessons
          </button>
          
          <div className="flex space-x-2">
            {/* Certificate button - for all users (including regular users) */}
            {certificateReady && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenCertificate(c);
                }}
                className="px-3 py-1 text-sm bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition flex items-center"
              >
                <GraduationCap className="w-3 h-3 mr-1" />
                Certificate
              </button>
            )}
            
            {c.createdBy === user._id && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenQuizzes(c);
                  }}
                  className={`px-3 py-1 text-sm rounded-lg transition flex items-center ${
                    hasQuizzes
                      ? "bg-green-100 text-green-800 hover:bg-green-200"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  <Award className="w-3 h-3 mr-1" />
                  Quizzes
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenUpload(c);
                  }}
                  className="px-3 py-1 text-sm bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition flex items-center"
                >
                  <Video className="w-3 h-3 mr-1" />
                  Add Lesson
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const CourseLessonsModal = ({ 
  course, 
  onClose, 
  onPlayLesson, 
  onOpenQuizzes,
  onOpenCertificate,
  refreshCourses 
}) => {
  if (!course) return null;

  const [selectedLesson, setSelectedLesson] = useState(null);
  const user = useStore((store) => store.user);
  const [userQuizAttempts, setUserQuizAttempts] = useState([]);
  const [courseDetails, setCourseDetails] = useState(course);
  const [completionStatus, setCompletionStatus] = useState(null);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const { data } = await api.get(`/courses/${course._id}?userId=${user._id}`);
        setCourseDetails(data);
      } catch (error) {
        console.error("Error fetching course details:", error);
      }
    };
    
    const fetchUserQuizAttempts = async () => {
      if (course?._id && user?._id) {
        try {
          const { data } = await api.get(`/courses/${course._id}/quiz-attempts?userId=${user._id}`);
          setUserQuizAttempts(data);
        } catch (error) {
          console.error("Error fetching quiz attempts:", error);
        }
      }
    };
    
    const fetchCompletionStatus = async () => {
      if (course?._id && user?._id) {
        try {
          const { data } = await api.get(`/courses/${course._id}/completion-status?userId=${user._id}`);
          setCompletionStatus(data);
        } catch (error) {
          console.error("Error fetching completion status:", error);
        }
      }
    };
    
    fetchCourseDetails();
    fetchUserQuizAttempts();
    fetchCompletionStatus();
  }, [course, user]);

  const lessonItem = (l, i) => {
    const userAttempt = userQuizAttempts.find(
      attempt => attempt.lessonId === l._id
    );
    
    // Check if lesson has quiz and if user passed it
    const hasQuiz = l.quiz ? true : false;
    const passedQuiz = userAttempt?.passed || false;
    const lessonCompleted = l.completed && (!hasQuiz || passedQuiz);
    
    return (
      <li
        key={l._id}
        onClick={() => setSelectedLesson(l)}
        className={`flex items-center p-3 rounded-lg cursor-pointer transition ${
          lessonCompleted
            ? "bg-green-50 hover:bg-green-100"
            : "bg-gray-50 hover:bg-gray-100"
        } ${
          selectedLesson?._id === l._id
            ? "bg-red-100 ring-2 ring-red-500 shadow-md"
            : ""
        }`}
      >
        <span className="text-sm font-bold text-gray-500 w-5 mr-3">{i + 1}.</span>
        <div className="flex-grow">
          <div className="flex items-center justify-between">
            <p className="font-medium text-gray-800">{l.title}</p>
            {l.quiz && (
              <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full ml-2">
                Has Quiz
              </span>
            )}
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-gray-500 flex items-center">
              <Clock className="w-3 h-3 mr-1" />{" "}
              {(Math.floor(l.duration) / 60).toFixed(1)} minutes
            </p>
            {userAttempt && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                userAttempt.passed ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}>
                Quiz: {userAttempt.percentage.toFixed(0)}%
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {lessonCompleted && <CheckCircle className="w-4 h-4 text-green-600" />}
          {l.quiz && l.progress >= 90 && !passedQuiz && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenQuizzes(course, l._id);
              }}
              className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
            >
              Take Quiz
            </button>
          )}
          {l.quiz && passedQuiz && (
            <CheckCircle className="w-4 h-4 text-green-600" />
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlayLesson(l, course);
            }}
            className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center hover:bg-red-200 transition"
          >
            <Play className="w-4 h-4" />
          </button>
        </div>
      </li>
    );
  };

  // Calculate if course is fully completed
  const isCourseFullyCompleted = completionStatus?.fullyCompleted || false;

  return (
    <Modal onClose={onClose} maxWidth="max-w-4xl">
      <div className="bg-white rounded-xl shadow-[0_20px_40px_-5px_rgba(0,0,0,0.3)] w-full">
        <div className="p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center">
            <List className="w-5 h-5 sm:w-6 sm:h-6 mr-3 text-red-800" />
            <h2 className="text-xl sm:text-2xl font-bold">
              Lessons: <span className="text-red-800">{courseDetails.title}</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-col md:flex-row max-h-[80vh] overflow-y-auto">
          <div
            className={`p-4 sm:p-6 space-y-4 ${
              selectedLesson ? "md:w-2/3" : "w-full"
            }`}
          >
            <div className="flex justify-between items-center border-b pb-3 mb-4 border-gray-100">
              <p className="text-sm text-gray-600">
                {courseDetails.lessons?.length || 0} lessons • Duration:{" "}
                <span className="text-red-800 font-bold">
                  {(Math.floor(courseDetails.duration || 0) / 60).toFixed(1)} minutes
                </span>{" "}
                • Progress: <span className="text-red-800 font-bold">{completionStatus?.completionPercentage || 0}%</span>
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onOpenQuizzes(course)}
                  className="text-sm text-red-600 hover:text-red-800 font-medium flex items-center"
                >
                  <Award className="w-4 h-4 mr-1" />
                  View Quizzes
                </button>
                
                {/* Certificate button in lessons modal */}
                {isCourseFullyCompleted && user.role !== "instructor" && (
                  <button
                    onClick={() => onOpenCertificate(course)}
                    className="ml-3 px-4 py-2 text-sm bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition flex items-center animate-pulse"
                  >
                    <GraduationCap className="w-4 h-4 mr-2" />
                    Get Certificate
                  </button>
                )}
              </div>
            </div>
            
            {courseDetails.lessons?.length > 0 ? (
              <ul className="space-y-3">{courseDetails.lessons.map(lessonItem)}</ul>
            ) : (
              <div className="text-center p-8 bg-yellow-50 rounded-lg">
                <BookOpenText className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
                <p className="text-lg font-semibold text-yellow-800">
                  No Lessons Yet.
                </p>
              </div>
            )}

            {/* Completion Status Summary */}
            {user.role !== "instructor" && completionStatus && (
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                  <GraduationCap className="w-5 h-5 mr-2 text-blue-600" />
                  Course Completion Status
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${completionStatus.completedLessons === completionStatus.totalLessons ? 'text-green-600' : 'text-blue-600'}`}>
                      {completionStatus.completedLessons}/{completionStatus.totalLessons}
                    </div>
                    <div className="text-sm text-gray-600">Lessons Completed</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${completionStatus.passedQuizzes === completionStatus.totalQuizzes ? 'text-green-600' : 'text-red-600'}`}>
                      {completionStatus.passedQuizzes}/{completionStatus.totalQuizzes}
                    </div>
                    <div className="text-sm text-gray-600">Quizzes Passed</div>
                  </div>
                </div>
                
                {isCourseFullyCompleted ? (
                  <div className="p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded border border-green-300">
                    <p className="text-sm font-bold text-green-800 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      🎉 Course Fully Completed! Certificate Available
                    </p>
                  </div>
                ) : completionStatus.lessonsNeedingCompletion?.length > 0 && (
                  <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                    <p className="text-sm font-medium text-yellow-800 mb-2">
                      Remaining Requirements:
                    </p>
                    <ul className="text-xs text-yellow-700 space-y-1">
                      {completionStatus.lessonsNeedingCompletion.slice(0, 3).map((req, idx) => (
                        <li key={idx} className="flex items-center">
                          <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                          {req}
                        </li>
                      ))}
                      {completionStatus.lessonsNeedingCompletion.length > 3 && (
                        <li className="text-yellow-600">
                          + {completionStatus.lessonsNeedingCompletion.length - 3} more
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Course Quizzes Section */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-red-600" />
                  Course Quizzes
                </h3>
                {courseDetails.lessons?.some(lesson => lesson.quiz) && (
                  <button
                    onClick={() => onOpenQuizzes(course)}
                    className="text-sm text-red-600 hover:text-red-800 font-medium"
                  >
                    View All Quizzes →
                  </button>
                )}
              </div>
              
              {!courseDetails.lessons?.some(lesson => lesson.quiz) ? (
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No quizzes available for this course yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {courseDetails.lessons
                    ?.filter(lesson => lesson.quiz)
                    .slice(0, 3)
                    .map((lesson) => {
                      const userAttempt = userQuizAttempts.find(
                        attempt => attempt.lessonId === lesson._id
                      );
                      
                      return (
                        <div key={lesson._id} className="bg-white p-4 rounded-lg border border-gray-200 hover:border-red-300 transition">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-bold text-gray-800">{lesson.quiz.title}</h4>
                              <div className="flex items-center space-x-3 mt-1">
                                <span className="text-xs text-gray-500">
                                  Lesson: {lesson.title}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {lesson.quiz.questions?.length || 0} questions
                                </span>
                                <span className="text-xs text-gray-500">
                                  Pass: {lesson.quiz.passingScore}%
                                </span>
                              </div>
                              <div className="mt-2 space-y-1">
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-gray-600">Video Watched:</span>
                                  <span className={`text-xs font-bold ${
                                    lesson.progress >= 90 ? 'text-green-600' : 'text-yellow-600'
                                  }`}>
                                    {lesson.progress || 0}%
                                  </span>
                                </div>
                                {userAttempt && (
                                  <div className="flex items-center space-x-2">
                                    <span className="text-xs text-gray-600">Quiz Status:</span>
                                    <span className={`text-xs font-bold ${
                                      userAttempt.passed ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                      {userAttempt.passed ? '✅ Passed' : '❌ Failed'}
                                    </span>
                                  </div>
                                )}
                                {!userAttempt && lesson.progress >= 90 && (
                                  <div className="flex items-center space-x-2">
                                    <span className="text-xs text-gray-600">Status:</span>
                                    <span className="text-xs font-bold text-blue-600">
                                      📝 Ready to take quiz
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => onOpenQuizzes(course, lesson._id)}
                              className={`px-3 py-1.5 text-sm rounded-lg transition ${
                                lesson.progress < 90
                                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                  : userAttempt?.passed
                                  ? "bg-green-600 text-white hover:bg-green-700"
                                  : "bg-red-600 text-white hover:bg-red-700"
                              }`}
                              disabled={lesson.progress < 90}
                              title={lesson.progress < 90 ? "Watch 90% of video first" : ""}
                            >
                              {userAttempt?.passed ? "Quiz Passed" : userAttempt ? "Retake Quiz" : "Take Quiz"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  
                  {courseDetails.lessons?.filter(lesson => lesson.quiz).length > 3 && (
                    <div className="text-center pt-2">
                      <button
                        onClick={() => onOpenQuizzes(course)}
                        className="text-sm text-gray-600 hover:text-red-600"
                      >
                        + {courseDetails.lessons.filter(lesson => lesson.quiz).length - 3} more quizzes
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {selectedLesson && (
            <div className="w-full md:w-1/3 p-4 sm:p-6 bg-gray-50 flex flex-col justify-between md:border-l border-t md:border-t-0 border-gray-200">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-red-600" />
                  Lesson Details
                </h3>
                <p className="text-sm font-semibold text-red-800 mb-2">
                  {selectedLesson.title}
                </p>
                <div className="space-y-3 mb-4">
                  <p className="text-xs text-gray-600 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />{" "}
                    {(Math.floor(selectedLesson.duration) / 60).toFixed(1)}{" "}
                    minutes
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Video Watched:</span>
                    <span className={`text-xs font-bold ${
                      selectedLesson.progress >= 90 ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {selectedLesson.progress || 0}%
                    </span>
                  </div>
                  
                  {selectedLesson.quiz && (
                    <>
                      <div className="p-2 bg-blue-50 rounded border border-blue-200">
                        <div className="flex items-center space-x-2 mb-1">
                          <Award className="w-3 h-3 text-blue-600" />
                          <span className="text-xs font-medium text-blue-700">
                            Quiz Required
                          </span>
                        </div>
                        <p className="text-xs text-blue-600">
                          Must pass quiz to complete lesson
                        </p>
                      </div>
                      
                      {selectedLesson.progress >= 90 && (
                        <div className="p-2 bg-green-50 rounded border border-green-200">
                          <p className="text-xs font-bold text-green-700">
                            ✅ Video watched 90%+
                          </p>
                          <p className="text-xs text-green-600 mt-1">
                            You can now take the quiz
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {selectedLesson.description ||
                      "No specific description available."}
                  </p>
                </div>
                
                {selectedLesson.quiz && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-bold text-blue-800 flex items-center">
                        <Award className="w-4 h-4 mr-1" />
                        Quiz Available
                      </h4>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                        {selectedLesson.quiz.questions?.length || 0} questions
                      </span>
                    </div>
                    <p className="text-xs text-blue-600 mb-3">
                      {selectedLesson.quiz.description || "Test your knowledge from this lesson"}
                    </p>
                    <button
                      onClick={() => {
                        onOpenQuizzes(course, selectedLesson._id);
                        setSelectedLesson(null);
                      }}
                      className={`w-full py-2 text-sm rounded-lg transition ${
                        selectedLesson.progress >= 90
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                      disabled={selectedLesson.progress < 90}
                    >
                      {selectedLesson.progress >= 90 ? "Take Quiz Now" : `Watch ${90 - (selectedLesson.progress || 0)}% more to unlock`}
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={() => onPlayLesson(selectedLesson, course)}
                className="w-full py-2.5 bg-red-800 text-white rounded-lg hover:bg-red-700 transition mt-4"
              >
                Play Lesson
              </button>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={() => {
              if (refreshCourses) refreshCourses();
              onClose();
            }}
            className="px-5 py-2 bg-red-800 text-white rounded-lg hover:bg-red-700"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

const AllVideosModal = ({ videos, onClose, onPlay }) => (
  <Modal onClose={onClose}>
    <div className="bg-white rounded-xl shadow-[0_20px_40px_-5px_rgba(0,0,0,0.3)] w-full">
      <div className="p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center">
        <div className="flex items-center">
          <TrendingUp className="w-6 h-6 mr-3 text-red-800" />
          <h2 className="text-xl sm:text-2xl font-bold">
            All Training Courses
          </h2>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="p-4 sm:p-6 max-h-[80vh] overflow-y-auto">
        <p className="text-sm text-gray-600 border-b pb-3 mb-4 border-gray-100">
          {videos.length} total videos.
        </p>
        <ul className="space-y-4">
          {videos.map((v, i) => (
            <VideoItem key={v.id} v={v} i={i} onPlay={onPlay} />
          ))}
        </ul>
      </div>
      <div className="p-4 border-t border-gray-100 flex justify-end">
        <button
          onClick={onClose}
          className="px-5 py-2 bg-red-800 text-white rounded-lg hover:bg-red-700"
        >
          Close
        </button>
      </div>
    </div>
  </Modal>
);

const AllCoursesModal = ({ courses, onClose, onOpenLessons, onOpenUpload, onOpenCertificate }) => (
  <Modal onClose={onClose} maxWidth="max-w-6xl">
    <div className="bg-white rounded-xl shadow-[0_20px_40px_-5px_rgba(0,0,0,0.3)] w-full">
      <div className="p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center">
        <div className="flex items-center">
          <Grid3x3 className="w-6 h-6 mr-3 text-red-800" />
          <h2 className="text-xl sm:text-2xl font-bold">
            All Courses ({courses.length})
          </h2>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="p-4 sm:p-6 max-h-[80vh] overflow-y-auto">
        <p className="text-sm text-gray-600 border-b pb-3 mb-4 border-gray-100">
          {courses.length} courses available.
        </p>
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((c) => (
            <CourseCard
              key={c._id}
              c={c}
              onViewDetails={onOpenLessons}
              onOpenUpload={onOpenUpload}
              onOpenQuizzes={openQuizzes}
              onOpenCertificate={onOpenCertificate}
            />
          ))}
        </section>
      </div>
      <div className="p-4 border-t border-gray-100 flex justify-end">
        <button
          onClick={onClose}
          className="px-5 py-2 bg-red-800 text-white rounded-lg hover:bg-red-700"
        >
          Close
        </button>
      </div>
    </div>
  </Modal>
);

const AllInstructorsModal = ({ instructors, onClose, onCardClick }) => (
  <Modal onClose={onClose} maxWidth="max-w-3xl">
    <div className="bg-white rounded-xl shadow-[0_20px_40px_-5px_rgba(0,0,0,0.3)] w-full">
      <div className="p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center">
        <div className="flex items-center">
          <Users className="w-6 h-6 mr-3 text-red-800" />
          <h2 className="text-xl sm:text-2xl font-bold">
            All Instructors ({instructors.length})
          </h2>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="p-4 sm:p-6 max-h-[80vh] overflow-y-auto">
        <p className="text-sm text-gray-600 border-b pb-3 mb-4 border-gray-100">
          Click on an instructor to view their profile (simulated).
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {instructors.map((ins) => (
            <InstructorCard key={ins.id} ins={ins} onClick={onCardClick} />
          ))}
        </div>
      </div>
      <div className="p-4 border-t border-gray-100 flex justify-end">
        <button
          onClick={onClose}
          className="px-5 py-2 bg-red-800 text-white rounded-lg hover:bg-red-700"
        >
          Close
        </button>
      </div>
    </div>
  </Modal>
);

const ActivityItem = ({ it, onClick }) => (
  <li
    key={it.id}
    onClick={() => onClick(`Viewing Details: ${it.details}`)}
    className="flex items-start space-x-3 p-3 border border-gray-100 rounded-lg hover:bg-red-50 transition cursor-pointer"
  >
    <div className="w-6 h-6 rounded-full bg-red-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
      {it.type === "New Enrollment"
        ? "E"
        : it.type === "Course Upload"
        ? "U"
        : "A"}
    </div>
    <div className="flex-grow">
      <p className="text-sm font-medium text-gray-800">{it.details}</p>
      <p className="text-xs text-gray-500">{it.time}</p>
    </div>
  </li>
);

const AllActivityModal = ({ activity, onClose, onActivityClick }) => (
  <Modal onClose={onClose} maxWidth="max-w-3xl">
    <div className="bg-white rounded-xl shadow-[0_20px_40px_-5px_rgba(0,0,0,0.3)] w-full">
      <div className="p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center">
        <div className="flex items-center">
          <List className="w-6 h-6 mr-3 text-red-800" />
          <h2 className="text-xl sm:text-2xl font-bold">
            Full Activity Log ({activity.length})
          </h2>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="p-4 sm:p-6 max-h-[80vh] overflow-y-auto">
        <ul className="space-y-3">
          {activity.map((it) => (
            <ActivityItem key={it.id} it={it} onClick={onActivityClick} />
          ))}
        </ul>
      </div>
      <div className="p-4 border-t border-gray-100 flex justify-end">
        <button
          onClick={onClose}
          className="px-5 py-2 bg-red-800 text-white rounded-lg hover:bg-red-700"
        >
          Close
        </button>
      </div>
    </div>
  </Modal>
);

const VideoPlayer = ({ media, onClose, courseId, onOpenQuiz, refreshCourses }) => {
  const [isExpanded, setIsExpanded] = useState(false),
    [currentTime, setCurrentTime] = useState(0),
    [duration, setDuration] = useState(0),
    [hasQuiz, setHasQuiz] = useState(false),
    [showQuizButton, setShowQuizButton] = useState(false),
    [videoCompleted, setVideoCompleted] = useState(false),
    [lessonStatus, setLessonStatus] = useState(null),
    [isPlaying, setIsPlaying] = useState(false);
    
  const user = useStore((store) => store.user);
  const videoRef = useRef(null);
  
  useEffect(() => {
    // Check if lesson has quiz
    if (media?.quiz) {
      setHasQuiz(true);
    }
    
    const checkLessonStatus = async () => {
      try {
        const { data } = await api.get(
          `/courses/${courseId}/lessons/${media._id}/status?userId=${user._id}`
        );
        
        console.log("Lesson status:", data);
        setLessonStatus(data);
        
        // Show quiz button if:
        // 1. Has quiz AND
        // 2. Video watched 90%+ AND
        // 3. Hasn't passed quiz yet (or no attempts)
        if (media.quiz && data.videoWatched && (!data.passedQuiz || data.hasQuiz)) {
          setShowQuizButton(true);
        }
        
        setVideoCompleted(data.completed);
      } catch (error) {
        console.error("Error checking lesson status:", error);
      }
    };
    
    checkLessonStatus();
  }, [media, courseId, user._id]);
  
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setCurrentTime(current);
      setDuration(total);
      
      // Check if video is 90% watched
      if (total > 0 && current / total > 0.9 && hasQuiz && !lessonStatus?.videoWatched) {
        console.log("Video 90% complete - showing quiz button");
        setShowQuizButton(true);
        
        // Update progress in backend
        updateVideoProgress(90);
      }
    }
  };
  
  const updateVideoProgress = async (progress) => {
    try {
      await api.post(`/courses/${courseId}/progress`, {
        userId: user._id,
        lessonId: media._id,
        progress: progress,
        completed: false // Don't mark as completed until quiz passed
      });
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };
  
  const handleVideoEnd = async () => {
    console.log("Video ended for lesson:", media._id);
    setIsPlaying(false);
    
    try {
      // Mark video as 100% watched
      await api.post(`/courses/${courseId}/progress`, {
        userId: user._id,
        lessonId: media._id,
        progress: 100,
        completed: false // Don't mark as completed until quiz passed
      });
      
      // Refresh lesson status
      const { data } = await api.get(
        `/courses/${courseId}/lessons/${media._id}/status?userId=${user._id}`
      );
      
      setLessonStatus(data);
      if (media.quiz && !data.passedQuiz) {
        setShowQuizButton(true);
      }
      
      // Refresh courses data
      if (refreshCourses) {
        refreshCourses();
      }
      
      console.log("Video marked as 100% watched. Quiz button visible:", showQuizButton);
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };
  
  const handleQuizClick = () => {
    console.log("Quiz button clicked");
    if (onOpenQuiz) {
      onOpenQuiz();
    }
    onClose();
  };

  const { title, course, instructor, description, url } = useMemo(
    () => ({
      title: media.title,
      course: media.courseTitle || media.course,
      instructor: media.instructorName || media.instructor,
      description: media.description || "",
      url: media.url,
    }),
    [media]
  );
  
  const vWidth = isExpanded ? "w-full" : "w-full lg:w-3/5";
  const oClass = isExpanded
    ? "hidden"
    : "w-full lg:w-2/5 p-4 sm:p-6 border-t lg:border-t-0 lg:border-l border-gray-100 overflow-y-auto flex flex-col bg-gray-50";
  const vHeight = isExpanded ? "h-full" : "h-[300px] sm:h-[450px] md:h-[550px]";

  // Custom video controls
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeeked = (e) => {
    // Reset to previous time if user tries to seek
    if (videoRef.current) {
      videoRef.current.currentTime = currentTime;
    }
  };

  // Prevent right-click menu
  const handleContextMenu = (e) => {
    e.preventDefault();
  };

  return (
    <Modal onClose={onClose}>
      <div
        className="bg-white rounded-xl shadow-[0_20px_40px_-5px_rgba(0,0,0,0.3)] w-full overflow-hidden flex flex-col transition-all duration-300"
        style={{ height: isExpanded ? "90vh" : "auto" }}
      >
        <div className={`flex flex-col lg:flex-row ${vHeight}`}>
          <div
            className={`${vWidth} bg-gray-900 relative flex flex-col justify-between transition-all duration-300`}
          >
            <div className="aspect-video w-full h-full relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                {url && (
                  <video
                    ref={videoRef}
                    className="w-full h-full"
                    autoPlay
                    controls={false} // Disable native controls
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={handleVideoEnd}
                    onSeeked={handleSeeked}
                    onContextMenu={handleContextMenu}
                    onClick={togglePlayPause}
                    onDoubleClick={(e) => e.preventDefault()} // Disable double-click to fullscreen
                    style={{ cursor: 'pointer' }}
                  >
                    <source src={url} type="video/webm" />
                    <source src={url} type="video/mp4" />
                    Your browser does not support playing this video.
                  </video>
                )}
                
                {/* Custom Play/Pause Overlay */}
                <div 
                  className="absolute inset-0 flex items-center justify-center"
                  onClick={togglePlayPause}
                >
                  {!isPlaying && (
                    <div className="w-20 h-20 bg-black/60 rounded-full flex items-center justify-center cursor-pointer hover:bg-black/70 transition">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                  )}
                </div>
                
                {/* Custom Progress Bar (View Only) */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-3">
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={togglePlayPause}
                      className="text-white hover:text-gray-300 transition"
                    >
                      {isPlaying ? (
                        <div className="w-8 h-8 flex items-center justify-center">
                          <span className="text-lg">⏸️</span>
                        </div>
                      ) : (
                        <Play className="w-8 h-8" />
                      )}
                    </button>
                    
                    <div className="flex-1">
                      <div className="text-xs text-white mb-1">
                        {Math.floor(currentTime / 60)}:{(Math.floor(currentTime) % 60).toString().padStart(2, '0')} / {Math.floor(duration / 60)}:{(Math.floor(duration) % 60).toString().padStart(2, '0')}
                      </div>
                      <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-1.5 bg-red-600"
                          style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {showQuizButton && hasQuiz && (
                <div className="absolute bottom-4 right-4 z-10 animate-fade-in">
                  <button
                    onClick={handleQuizClick}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center shadow-lg animate-pulse-slow"
                  >
                    <Award className="w-4 h-4 mr-2" />
                    {lessonStatus?.passedQuiz ? "Quiz Passed" : "Take Quiz Now"}
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className={oClass}>
            <div className="mb-6 p-4 bg-red-50 rounded-lg shadow-inner flex-shrink-0">
              <h2 className="text-lg sm:text-xl font-extrabold text-red-800 mb-2 leading-snug">
                {title}
              </h2>
              <div className="space-y-1 text-sm">
                <p className="text-gray-700 flex items-center font-semibold">
                  <BookOpenText className="w-4 h-4 mr-2 text-red-600" />
                  Course:{" "}
                </p>
                <p className="ml-1 font-normal text-gray-600">{course}</p>
                <p className="text-gray-700 flex items-center font-semibold">
                  <User className="w-4 h-4 mr-2 text-red-600" />
                  Instructor:{" "}
                  <span className="ml-1 font-normal text-gray-600">
                    {instructor
                      ? instructor.charAt(0).toUpperCase() + instructor.slice(1)
                      : ""}
                  </span>
                </p>
                {hasQuiz && (
                  <div className="mt-3 p-2 bg-green-50 rounded border border-green-200">
                    <div className="flex items-center">
                      <Award className="w-4 h-4 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-green-700">
                        Quiz available after watching 90% of video
                      </span>
                    </div>
                    
                    {lessonStatus && (
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">Video Progress:</span>
                          <span className="text-xs font-bold text-blue-600">
                            {lessonStatus.progress || 0}%
                          </span>
                        </div>
                        
                        {lessonStatus.videoWatched && !lessonStatus.passedQuiz && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">Quiz Status:</span>
                            <span className="text-xs font-bold text-red-600">
                              ❌ Need to pass quiz
                            </span>
                          </div>
                        )}
                        
                        {lessonStatus.passedQuiz && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">Quiz Status:</span>
                            <span className="text-xs font-bold text-green-600">
                              ✅ Quiz Passed
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {showQuizButton && (
                      <p className="text-xs font-bold text-green-700 mt-1 animate-pulse">
                        🎯 {lessonStatus?.passedQuiz ? "Quiz passed! Lesson completed!" : "Quiz available!"}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex-grow overflow-y-auto pr-2">
              <h3 className="text-lg font-bold text-gray-700 mb-3 flex items-center">
                <FileText className="w-4 h-4 mr-2 text-red-600" />
                Overview
              </h3>
              <div className="space-y-4 text-gray-600 text-sm">
                <p className="leading-relaxed font-medium">{description}</p>
                
                {hasQuiz && (
                  <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                    <h4 className="text-sm font-bold text-blue-800 mb-2">📝 Quiz Requirement:</h4>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>• Watch at least 90% of this video</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <div className="pt-4 flex shrink-0 mt-4 border-t border-gray-200">
              <button
                onClick={onClose}
                className="w-full py-2.5 bg-red-800 text-white rounded-lg hover:bg-red-700 flex items-center justify-center"
              >
                <X className="w-4 h-4 mr-2" /> Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

const SharedCourse = ({ isWatchOnly = true }) => {
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const user = useStore((store) => store.user);

  const fetchCourses = async () => {
    try {
      setCoursesLoading(true);
      const { data: responseCourses } = await api.get(`/courses?userId=${user._id}`);
      setCourses(responseCourses);
    } catch (error) {
      console.error(error);
    } finally {
      setCoursesLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [user._id]);

  const [currentVideo, setCurrentVideo] = useState(null),
    [showLessons, setShowLessons] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null),
    [showAllVideos, setShowAllVideos] = useState(false);
  const [showAllCourses, setShowAllCourses] = useState(false),
    [uploadContext, setUploadContext] = useState(null);
  const [showAllInstructors, setShowAllInstructors] = useState(false);
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [showQuizzes, setShowQuizzes] = useState(false);
  const [selectedQuizCourse, setSelectedQuizCourse] = useState(null);
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const [selectedCertificateCourse, setSelectedCertificateCourse] = useState(null);

  const [uploading, setUploading] = useState(false);

  const playVideo = (v, courseId) => {
    setCurrentVideo({...v, courseId});
    setShowLessons(false);
    setShowAllVideos(false);
    setShowAllCourses(false);
    setUploadContext(null);
    setShowAllInstructors(false);
    setShowAllActivity(false);
    setShowQuizzes(false);
    setShowCertificate(false);
  };
  
  const playLesson = (lesson, course) =>
    playVideo({
      ...lesson,
      courseTitle: course.title,
      instructorName: course.instructor,
      courseId: course._id
    }, course._id);
    
  const openLessons = (c) => {
    setSelectedCourse(c);
    setShowLessons(true);
    setCurrentVideo(null);
    setShowAllVideos(false);
    setShowAllCourses(false);
    setUploadContext(null);
    setShowAllInstructors(false);
    setShowAllActivity(false);
    setShowQuizzes(false);
    setShowCertificate(false);
  };
  
  const openUpload = (context) => {
    setUploadContext(context);
  };

  const openQuizzes = (course, lessonId = null) => {
    setSelectedQuizCourse(course);
    if (lessonId) {
      setSelectedLessonId(lessonId);
    }
    setShowQuizzes(true);
    setCurrentVideo(null);
    setShowLessons(false);
    setShowAllVideos(false);
    setShowAllCourses(false);
    setUploadContext(null);
    setShowAllInstructors(false);
    setShowAllActivity(false);
    setShowCertificate(false);
  };

  const openCertificate = (course) => {
    setSelectedCertificateCourse(course);
    setShowCertificate(true);
    setCurrentVideo(null);
    setShowLessons(false);
    setShowAllVideos(false);
    setShowAllCourses(false);
    setUploadContext(null);
    setShowAllInstructors(false);
    setShowAllActivity(false);
    setShowQuizzes(false);
  };

  const handleQuizFromVideo = () => {
    if (currentVideo && currentVideo.courseId) {
      const course = courses.find(c => c._id === currentVideo.courseId);
      if (course) {
        openQuizzes(course, currentVideo._id);
      }
    }
  };

  const handleUpload = async (data) => {
    try {
      setUploading(true);
      
      if (data.type === "course") {
        // Create new course with quiz
        const formData = new FormData();
        formData.append("file", data.newLesson.file);
        
        const { data: uploadResponse } = await api.post(
          "/upload/course",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        
        const newCourse = {
          title: data.title,
          description: data.description,
          instructor: user.role,
          duration: uploadResponse.duration,
          progress: 0,
          completed: false,
          lessons: [{
            title: data.newLesson.title,
            description: data.newLesson.description,
            url: uploadResponse.url,
            duration: uploadResponse.duration,
            quiz: data.newLesson.quiz || null
          }],
          createdBy: user._id,
        };
        
        await api.post("/courses", newCourse);
        fetchCourses();
        
      } else if (data.type === "video") {
        // Add lesson to existing course with quiz
        const formData = new FormData();
        formData.append("file", data.newLesson.file);
        
        const { data: uploadResponse } = await api.post(
          "/upload/course",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        
        const newLesson = {
          title: data.newLesson.title,
          description: data.newLesson.description,
          url: uploadResponse.url,
          duration: uploadResponse.duration,
          quiz: data.newLesson.quiz || null
        };
        
        await api.post(`/courses/${data.courseId}`, newLesson);
        fetchCourses();
      }
      
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
      setUploadContext(null);
    }
  };

  return (
    <div className="min-h-screen">
      {showLessons && (
        <CourseLessonsModal
          course={selectedCourse}
          onClose={() => setShowLessons(false)}
          onPlayLesson={playLesson}
          onOpenQuizzes={openQuizzes}
          onOpenCertificate={openCertificate}
          refreshCourses={fetchCourses}
        />
      )}
      {showAllVideos && (
        <AllVideosModal
          videos={videos}
          onClose={() => setShowAllVideos(false)}
        />
      )}
      {currentVideo && (
        <VideoPlayer
          media={currentVideo}
          onClose={() => setCurrentVideo(null)}
          courseId={currentVideo.courseId}
          onOpenQuiz={handleQuizFromVideo}
          refreshCourses={fetchCourses}
        />
      )}
      {showAllCourses && (
        <AllCoursesModal
          courses={courses}
          onClose={() => setShowAllCourses(false)}
          onOpenLessons={openLessons}
          onOpenUpload={(c) => openUpload({ type: "video", course: c })}
          onOpenQuizzes={openQuizzes}
          onOpenCertificate={openCertificate}
        />
      )}
      {showAllInstructors && (
        <AllInstructorsModal
          instructors={mockInstructors}
          onClose={() => setShowAllInstructors(false)}
        />
      )}
      {showAllActivity && (
        <AllActivityModal
          activity={mockActivity}
          onClose={() => setShowAllActivity(false)}
        />
      )}
      {uploadContext && (
        <CourseUploadModal
          onClose={() => setUploadContext(null)}
          onUpload={handleUpload}
          courseToAddTo={uploadContext}
          uploading={uploading}
        />
      )}
      {showQuizzes && selectedQuizCourse && (
        <QuizModal
          course={selectedQuizCourse}
          initialLessonId={selectedLessonId}
          onClose={() => {
            setShowQuizzes(false);
            setSelectedQuizCourse(null);
            setSelectedLessonId(null);
            fetchCourses(); // Refresh courses after quiz attempt
          }}
          onQuizAdded={fetchCourses}
          onQuizUpdated={fetchCourses}
          onBackToLessons={() => {
            setShowQuizzes(false);
            setSelectedQuizCourse(null);
            setSelectedLessonId(null);
            
            if (selectedQuizCourse) {
              setSelectedCourse(selectedQuizCourse);
              setShowLessons(true);
            }
          }}
        />
      )}
      {showCertificate && selectedCertificateCourse && (
        <CertificateModal
          course={selectedCertificateCourse}
          user={user}
          onClose={() => {
            setShowCertificate(false);
            setSelectedCertificateCourse(null);
          }}
        />
      )}

      <div className={`flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6`}>
        <div className="grow w-full">
          {!isWatchOnly && <CourseHeaderPage />}

          <section className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-4">
                  Lesson Course
                </h2>
                <p className="text-light">View all available courses</p>
              </div>
              {!isWatchOnly && (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => openUpload({ type: "course" })}
                    className="px-3 py-1.5 bg-red-800 text-white rounded-lg text-sm flex items-center font-medium shadow-md hover:bg-red-700 transition"
                  >
                    <BookOpenText className="w-4 h-4 mr-1" /> Upload New Course
                  </button>
                  <button
                    onClick={() => setShowAllCourses(true)}
                    className="text-red-800 font-medium text-sm"
                  >
                    View All Courses
                  </button>
                </div>
              )}
            </div>

            {coursesLoading ? (
              <Spinner size={30} />
            ) : (
              <section>
                {courses.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((c) => {
                      return (
                        <CourseCard
                          key={c._id}
                          c={c}
                          onViewDetails={openLessons}
                          onOpenUpload={(course) =>
                            openUpload({ type: "video", course })
                          }
                          onOpenQuizzes={openQuizzes}
                          onOpenCertificate={openCertificate}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="w-full max-w-lg mx-auto mt-80">
                    <Empty />
                    <div className="mt-10">
                      <h3 className="font-bold mb-2 text-center">
                        Page is Currently Empty
                      </h3>
                      <p className="text-lg mb-6 text-center">
                        This page doesn't have any content yet. Please check
                        back later!
                      </p>
                    </div>
                  </div>
                )}
              </section>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

const InstructorCard = ({ ins, onClick }) => (
  <div
    onClick={() => onClick(ins)}
    className="bg-white p-4 rounded-lg border border-gray-200 hover:border-red-300 transition cursor-pointer text-center"
  >
    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
      <User className="w-8 h-8 text-red-600" />
    </div>
    <h4 className="font-bold text-gray-800">{ins.name}</h4>
    <p className="text-sm text-gray-600">{ins.role}</p>
    <p className="text-xs text-gray-500 mt-2">{ins.courses} courses</p>
  </div>
);

export default SharedCourse;