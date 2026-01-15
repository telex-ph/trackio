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
  <div className="relative group p-6 transition-all duration-500">
    {/* Ultra-Realistic 3D Push Pin - #9B1C1C */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center pointer-events-none">
      {/* Pin Head */}
      <div 
        style={{ backgroundColor: '#9B1C1C' }} 
        className="w-7 h-5 rounded-[50%/40%] shadow-[inset_0_3px_5px_rgba(255,255,255,0.4),0_2px_4px_rgba(0,0,0,0.3)] relative z-10"
      />
      {/* Pin Neck */}
      <div 
        style={{ backgroundColor: '#9B1C1C' }} 
        className="w-4 h-2 -mt-1 shadow-md relative z-10 border-t border-black/10"
      />
      {/* Pin Base */}
      <div 
        style={{ backgroundColor: '#9B1C1C' }} 
        className="w-6 h-2.5 rounded-b-full shadow-lg relative z-10 border-t border-white/10"
      />
      {/* Pin Needle Shadow */}
      <div className="w-1 h-2 bg-black/40 blur-[0.5px] -mt-0.5" />
      {/* Dynamic Long Shadow cast on the background */}
      <div className="absolute top-8 left-5 w-10 h-3 bg-black/20 blur-[6px] rounded-full -rotate-[30deg]" />
    </div>

    {/* The Card Container */}
    <div 
      className="bg-white rounded-xl p-5 pt-10 flex flex-col h-full relative transition-all duration-500 
                 border border-gray-100
                 shadow-[20px_20px_40px_rgba(0,0,0,0.12),-5px_-5px_25px_rgba(255,255,255,0.8)] 
                 group-hover:shadow-[30px_30px_60px_rgba(155,28,28,0.15)]
                 group-hover:-translate-y-2 cursor-pointer"
      style={{ 
        transform: 'rotate(-1.5deg)', 
        minHeight: '280px' 
      }}
    >
      <div className="relative z-10 flex flex-col h-full">
        {/* Header Section */}
        <div className="mb-3">
          <div className="flex justify-between items-start">
            <h4 className="font-extrabold text-lg text-gray-900 leading-tight group-hover:text-red-800 transition-colors line-clamp-1">
              {c.title}
            </h4>
            {certificateReady && (
              <div className="absolute top-2 right-2">
                <span className="bg-gradient-to-r from-green-600 to-green-700 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center animate-pulse shadow-sm">
                  <GraduationCap className="w-3 h-3 mr-1" />
                  Certificate Ready
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center mt-1">
            <User className="w-3 h-3 mr-1 text-red-700" />
            <span style={{ color: '#9B1C1C' }} className="text-[10px] font-black uppercase tracking-widest">
              {c.instructor
                ? c.instructor.charAt(0).toUpperCase() + c.instructor.slice(1)
                : ""}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-500 mb-4 line-clamp-2 leading-relaxed h-8">
          {c.description}
        </p>

        {/* Stats Row */}
        <div className="flex items-center justify-between mb-4 bg-gray-50/50 p-2 rounded-lg border border-gray-100">
          <div className="flex items-center text-gray-700 font-bold text-[10px]">
            <Play className="w-3 h-3 mr-1 text-red-700" />
            {(Math.floor(overAllDuration) / 60).toFixed(1)}m
          </div>
          <div className="flex items-center text-gray-700 font-bold text-[10px]">
            <BookOpenText className="w-3 h-3 mr-1 text-red-700" />
            {c.lessons.length} Lessons
          </div>
          <div className="flex items-center space-x-1">
            {hasQuizzes && (
              <span className="text-[9px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tighter">
                {totalQuizzes} Q
              </span>
            )}
            <span className="text-[9px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full font-bold">
              {c.progress || 0}%
            </span>
          </div>
        </div>

        {/* Progress Bar Mini */}
        <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden mb-5">
          <div 
            className="h-full transition-all duration-1000 ease-out"
            style={{ width: `${c.progress || 0}%`, backgroundColor: '#9B1C1C' }}
          />
        </div>

        {/* Action Buttons - One Line Only */}
        <div className="mt-auto pt-4 flex items-center gap-2 border-t border-dashed border-gray-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(c);
            }}
            style={{ backgroundColor: '#9B1C1C' }}
            className="flex-1 whitespace-nowrap py-2 px-3 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-md hover:brightness-110 active:scale-95 transition-all"
          >
            View Lessons
          </button>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {certificateReady && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenCertificate(c);
                }}
                className="px-2 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition shadow-sm flex items-center"
              >
                <GraduationCap className="w-4 h-4" />
              </button>
            )}

            {c.createdBy === user._id && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenQuizzes(c);
                  }}
                  className={`p-2 rounded-lg transition border shadow-sm flex items-center ${
                    hasQuizzes
                      ? "bg-green-100 text-green-800 hover:bg-green-200 border-green-200"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200"
                  }`}
                >
                  <Award className="w-4 h-4" />
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenUpload(c);
                  }}
                  className="p-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition shadow-sm flex items-center"
                >
                  <Video className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
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
      {/* Container: Sharp Edges, Maroon Top Border, No Rounded Corners */}
      <div className="bg-white rounded-none shadow-2xl w-full border-t-4 border-t-[#800000] flex flex-col overflow-hidden border-x border-b border-gray-200">
        
        {/* --- Header Section --- */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-red-50 flex items-center justify-center mr-4 border border-red-100">
              <List className="w-5 h-5 text-[#800000]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 uppercase tracking-tight">
                Lessons: <span className="text-[#800000]">{courseDetails.title}</span>
              </h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Course Curriculum</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#800000] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* --- Main Content Area: No Scrollbar --- */}
        <div 
          className="flex flex-col md:flex-row max-h-[80vh] overflow-y-auto scrollbar-hide"
          style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
        >
          {/* Internal CSS for hiding scrollbar */}
          <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>

          <div className={`p-6 space-y-6 ${selectedLesson ? "md:w-2/3" : "w-full"}`}>
            
            {/* Stats Bar */}
            <div className="flex flex-wrap justify-between items-center border-b border-gray-100 pb-4 gap-4">
              <div className="flex gap-4">
                <div className="text-center md:text-left">
                  <p className="text-[9px] font-bold text-gray-400 uppercase">Total Lessons</p>
                  <p className="text-sm font-bold text-gray-800">{courseDetails.lessons?.length || 0}</p>
                </div>
                <div className="text-center md:text-left border-l border-gray-200 pl-4">
                  <p className="text-[9px] font-bold text-gray-400 uppercase">Duration</p>
                  <p className="text-sm font-bold text-[#800000]">
                    {(Math.floor(courseDetails.duration || 0) / 60).toFixed(1)} mins
                  </p>
                </div>
                <div className="text-center md:text-left border-l border-gray-200 pl-4">
                  <p className="text-[9px] font-bold text-gray-400 uppercase">Progress</p>
                  <p className="text-sm font-bold text-[#800000]">{completionStatus?.completionPercentage || 0}%</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenQuizzes(course)}
                  className="px-4 py-2 bg-gray-100 text-[#800000] text-[10px] font-bold uppercase tracking-widest border border-gray-200 hover:bg-gray-200 transition-all flex items-center"
                >
                  <Award className="w-3.5 h-3.5 mr-2" />
                  View Quizzes
                </button>
                
                {isCourseFullyCompleted && user.role !== "instructor" && (
                  <button
                    onClick={() => onOpenCertificate(course)}
                    className="px-4 py-2 bg-[#800000] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-red-900 transition-all flex items-center animate-pulse"
                  >
                    <GraduationCap className="w-3.5 h-3.5 mr-2" />
                    Get Certificate
                  </button>
                )}
              </div>
            </div>
            
            {/* Lesson List */}
            {courseDetails.lessons?.length > 0 ? (
              <ul className="space-y-2">
                {courseDetails.lessons.map(lessonItem)}
              </ul>
            ) : (
              <div className="text-center p-12 border border-dashed border-gray-200">
                <BookOpenText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No Lessons Available</p>
              </div>
            )}

            {/* Completion Summary Card */}
            {user.role !== "instructor" && completionStatus && (
              <div className="p-5 bg-gray-50 border border-gray-200">
                <h3 className="text-xs font-bold text-gray-900 mb-4 uppercase tracking-widest flex items-center">
                  <GraduationCap className="w-4 h-4 mr-2 text-[#800000]" />
                  Completion Status
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white p-3 border border-gray-100">
                    <div className="text-xl font-black text-gray-800">
                      {completionStatus.completedLessons}/{completionStatus.totalLessons}
                    </div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase">Lessons Done</div>
                  </div>
                  <div className="bg-white p-3 border border-gray-100">
                    <div className="text-xl font-black text-[#800000]">
                      {completionStatus.passedQuizzes}/{completionStatus.totalQuizzes}
                    </div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase">Quizzes Passed</div>
                  </div>
                </div>
                
                {isCourseFullyCompleted ? (
                  <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-xs font-bold flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    COURSE FULLY COMPLETED
                  </div>
                ) : completionStatus.lessonsNeedingCompletion?.length > 0 && (
                  <div className="p-4 bg-white border border-gray-200">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Requirements Remaining:</p>
                    <ul className="space-y-1">
                      {completionStatus.lessonsNeedingCompletion.slice(0, 3).map((req, idx) => (
                        <li key={idx} className="text-[11px] text-gray-600 flex items-center">
                          <span className="w-1.5 h-1.5 bg-[#800000] mr-2"></span> {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Quizzes Preview Section */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-[0.2em] flex items-center">
                  <Award className="w-4 h-4 mr-2 text-[#800000]" />
                  Quick Access: Quizzes
                </h3>
              </div>
              
              {!courseDetails.lessons?.some(lesson => lesson.quiz) ? (
                <div className="p-6 bg-gray-50 text-center border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">No quizzes found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {courseDetails.lessons
                    ?.filter(lesson => lesson.quiz)
                    .slice(0, 3)
                    .map((lesson) => {
                      const userAttempt = userQuizAttempts.find(a => a.lessonId === lesson._id);
                      return (
                        <div key={lesson._id} className="p-4 bg-white border border-gray-100 flex justify-between items-center group hover:border-[#800000] transition-colors">
                          <div>
                            <h4 className="font-bold text-gray-800 text-sm">{lesson.quiz.title}</h4>
                            <div className="flex gap-3 mt-1">
                              <span className="text-[9px] font-bold text-gray-400 uppercase">Video: {lesson.progress || 0}%</span>
                              {userAttempt && (
                                <span className={`text-[9px] font-bold uppercase ${userAttempt.passed ? 'text-green-600' : 'text-red-600'}`}>
                                  {userAttempt.passed ? 'Passed' : 'Failed'}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => onOpenQuizzes(course, lesson._id)}
                            disabled={lesson.progress < 90}
                            className={`px-4 py-2 text-[9px] font-bold uppercase tracking-widest transition-all ${
                              lesson.progress < 90
                                ? "bg-gray-50 text-gray-300 border border-gray-100"
                                : "bg-[#800000] text-white hover:bg-red-900"
                            }`}
                          >
                            {userAttempt?.passed ? "Review" : "Take"}
                          </button>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>

          {/* --- Right Sidebar: Lesson Details --- */}
          {selectedLesson && (
            <div className="w-full md:w-1/3 p-6 bg-gray-50 flex flex-col justify-between md:border-l border-gray-200">
              <div>
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-4 flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-[#800000]" />
                  Module Details
                </h3>
                
                <div className="bg-white p-4 border border-gray-200 mb-4">
                  <h4 className="text-sm font-bold text-[#800000] mb-2 uppercase">{selectedLesson.title}</h4>
                  <div className="flex items-center text-[10px] font-bold text-gray-400 mb-4">
                    <Clock className="w-3 h-3 mr-1" />
                    {(Math.floor(selectedLesson.duration) / 60).toFixed(1)} MINUTES
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {selectedLesson.description || "No specific description available."}
                  </p>
                </div>

                {selectedLesson.quiz && (
                  <div className={`p-4 border border-blue-200 ${selectedLesson.progress >= 90 ? 'bg-green-50 border-green-200' : 'bg-blue-50'}`}>
                    <p className="text-[10px] font-black uppercase mb-1 flex items-center">
                       {selectedLesson.progress >= 90 ? '✅ Ready for Quiz' : '📘 Requirements'}
                    </p>
                    <p className="text-[11px] text-gray-600 mb-3">
                      {selectedLesson.progress >= 90 
                        ? "You have completed the required watch time." 
                        : `Watch ${90 - (selectedLesson.progress || 0)}% more to unlock the assessment.`}
                    </p>
                    <button
                      onClick={() => {
                        onOpenQuizzes(course, selectedLesson._id);
                        setSelectedLesson(null);
                      }}
                      disabled={selectedLesson.progress < 90}
                      className={`w-full py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all ${
                        selectedLesson.progress >= 90
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {selectedLesson.progress >= 90 ? "Enter Quiz Room" : "Locked"}
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => onPlayLesson(selectedLesson, course)}
                className="w-full py-4 bg-gray-900 text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-black transition-all mt-6"
              >
                Launch Lesson
              </button>
            </div>
          )}
        </div>

        {/* --- Footer --- */}
        <div className="p-4 border-t border-gray-100 flex justify-end bg-gray-50">
          <button
            onClick={() => {
              if (refreshCourses) refreshCourses();
              onClose();
            }}
            className="px-8 py-2 bg-white text-gray-800 border border-gray-300 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-100 transition-all"
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

const AllCoursesModal = ({ courses, onClose, onOpenLessons, onOpenUpload, onOpenQuizzes, onOpenCertificate }) => (
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

  // Prevent seeking by blocking seek events
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