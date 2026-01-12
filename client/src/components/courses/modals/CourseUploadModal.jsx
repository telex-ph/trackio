import { useMemo, useRef, useState, useEffect } from "react";
import { 
  Upload, 
  Video, 
  X, 
  FileUp, 
  Award, 
  Plus, 
  Trash2, 
  Info,
  ChevronDown,
  HelpCircle,
  Clock,
  Target
} from "lucide-react";
import Spinner from "../../../assets/loaders/Spinner";
import { toast } from "react-hot-toast";
import { useStore } from "../../../store/useStore"; 

/**
 * logic for saving quiz and generating unique ids
 */
const handleSaveQuiz = async (quizData) => {
  if (!quizData.title.trim()) {
    toast.error("Quiz title is required");
    return null;
  }

  if (quizData.questions.length === 0) {
    toast.error("Please add at least one question");
    return null;
  }

  try {
    const questionsWithIds = quizData.questions.map(q => ({
      ...q,
      _id: q._id || `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      correctAnswer: Number(q.correctAnswer)
    }));

    const quizDataWithIds = {
      ...quizData,
      questions: questionsWithIds
    };

    return quizDataWithIds;
    
  } catch (error) {
    console.error("Error saving quiz:", error);
    toast.error("Failed to save quiz");
    return null;
  }
};

/**
 * reusable dropzone component
 */
const FileDrop = ({ onFileSelect }) => {
  const ref = useRef(null);
  const [isDrag, setIsDrag] = useState(false);
  const [name, setName] = useState(null);
  
  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setName(file.name);
      onFileSelect(file);
    } else {
      setName(null);
      onFileSelect(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDrag(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setName(file.name);
      onFileSelect(file);
    } else {
      setName(null);
      onFileSelect(null);
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        ref={ref}
        onChange={handleChange}
        accept=".mp4, .mov, .avi, .webm"
        className="hidden"
      />
      <div
        onClick={() => ref.current.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDrag(true);
        }}
        onDragLeave={() => setIsDrag(false)}
        onDrop={handleDrop}
        className={`p-6 sm:p-8 border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors ${
          isDrag
            ? "border-red-500 bg-red-50"
            : name
            ? "border-green-500 bg-green-50"
            : "border-gray-200 hover:border-red-500 hover:bg-red-50"
        }`}
      >
        {name ? (
          <div className="flex flex-col items-center">
            <Video className="w-8 h-8 text-green-600 mb-2" />
            <p className="font-semibold text-green-700">File: {name}</p>
            <p className="text-sm text-gray-500 mt-1">Click to change.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <FileUp className="w-8 h-8 text-gray-500 mb-2" />
            <p className="font-semibold text-gray-700">
              Click or drag video file
            </p>
            <p className="text-sm text-gray-500 mt-1">
              MP4, MOV, AVI, WEBM (Max 5GB)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const InputStyle = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none transition bg-white";

/**
 * modal background and wrapper
 */
const Modal = ({ children, onClose, maxWidth = "max-w-5xl" }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto no-scrollbar"
    onClick={onClose}
    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
  >
    <style>{`
      .no-scrollbar::-webkit-scrollbar { display: none; }
      .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    `}</style>
    <div
      className={`w-full ${maxWidth} mx-auto relative`}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  </div>
);

const CourseUploadModal = ({ onClose, onUpload, courseToAddTo, uploading }) => {
  const [cTitle, setCTitle] = useState("");
  const [cDesc, setCDesc] = useState("");
  const [lTitle, setLTitle] = useState("");
  const [lDesc, setLDesc] = useState("");
  const [file, setFile] = useState(null);
  const [includeQuiz, setIncludeQuiz] = useState(false);
  const [quizData, setQuizData] = useState({
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

  const [isSaving, setIsSaving] = useState(false);
  const isLessonReady = useMemo(() => lTitle.trim() && file, [lTitle, file]);

  const isNewCourse = useMemo(() => courseToAddTo?.type === "course", [courseToAddTo]);
  const isAddingToCourse = useMemo(() => courseToAddTo?.type === "video" && courseToAddTo?.course !== null, [courseToAddTo]);

  useEffect(() => {
    if (lTitle) {
      setQuizData(prev => ({
        ...prev,
        title: `${lTitle} Quiz`,
        description: `Test your knowledge from "${lTitle}"`
      }));
    }
  }, [lTitle]);

  const handleAddQuestion = (e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (!currentQuestion.text.trim()) { toast.error("Question text is required"); return; }
    if (currentQuestion.questionType === "multiple-choice") {
      if (currentQuestion.options.some(opt => !opt.trim())) {
        toast.error("All options must be filled"); return;
      }
    }
    const newQuestion = {
      ...currentQuestion,
      _id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      options: currentQuestion.questionType === "true-false" ? ["True", "False"] : [...currentQuestion.options]
    };
    setQuizData(prev => ({ ...prev, questions: [...prev.questions, newQuestion] }));
    setCurrentQuestion({
      text: "",
      questionType: "multiple-choice",
      options: ["", "", "", ""],
      correctAnswer: 0,
      points: 1,
      explanation: ""
    });
    toast.success("Question added!");
  };

  const handleRemoveQuestion = (index) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const handleQuestionTypeChange = (type) => {
    setCurrentQuestion(prev => ({
      ...prev,
      questionType: type,
      options: type === "true-false" ? ["True", "False"] : ["", "", "", ""],
      correctAnswer: 0
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !lTitle.trim()) { toast.error("Missing required fields"); return; }
    
    let finalQuizData = null;
    if (includeQuiz) {
      if (quizData.questions.length === 0) { toast.error("Add at least one question"); return; }
      setIsSaving(true);
      finalQuizData = await handleSaveQuiz(quizData);
      setIsSaving(false);
      if (!finalQuizData) return;
    }

    const data = {
      type: isNewCourse ? "course" : "video",
      title: cTitle.trim(),
      description: cDesc.trim(),
      newLesson: {
        title: lTitle.trim(),
        description: lDesc.trim() || "No summary available.",
        file,
        quiz: finalQuizData 
      }
    };
    if (isAddingToCourse) data.courseId = courseToAddTo.course._id;
    await onUpload(data);
  };

  const renderQuizSection = () => (
    <div className="pt-6 border-t border-gray-100">
      <div className="flex items-center justify-between mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
        <div className="flex items-center space-x-3">
          <Award className="w-5 h-5 text-gray-700" />
          <div>
            <h4 className="text-sm font-bold text-gray-800">Add Quiz to Lesson</h4>
            <p className="text-xs text-gray-500">Include a short assessment for this lesson</p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={includeQuiz}
            onChange={(e) => setIncludeQuiz(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-800"></div>
        </label>
      </div>

      {includeQuiz && (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5 ml-1">Quiz Title</label>
              <input type="text" value={quizData.title} onChange={(e) => setQuizData(prev => ({ ...prev, title: e.target.value }))} className={InputStyle} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5 ml-1">Passing Score (%)</label>
              <div className="relative">
                <Target className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input type="number" value={quizData.passingScore} onChange={(e) => setQuizData(prev => ({ ...prev, passingScore: parseInt(e.target.value) }))} className={`${InputStyle} pl-9`} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5 ml-1">Time Limit (mins)</label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input type="number" value={quizData.timeLimit} onChange={(e) => setQuizData(prev => ({ ...prev, timeLimit: parseInt(e.target.value) }))} className={`${InputStyle} pl-9`} placeholder="0 for no limit" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-2">
               <HelpCircle className="w-4 h-4 text-gray-500" />
               <h5 className="text-sm font-bold text-gray-700">Question Builder</h5>
            </div>
            
            <textarea 
              value={currentQuestion.text} 
              onChange={(e) => setCurrentQuestion(prev => ({ ...prev, text: e.target.value }))} 
              className={`${InputStyle} resize-none`} 
              rows="2" 
              placeholder="Type your question here..."
            />

            <div className="flex p-1 bg-gray-200/50 rounded-lg w-fit">
              <button 
                type="button" 
                onClick={() => handleQuestionTypeChange("multiple-choice")}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${currentQuestion.questionType === 'multiple-choice' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Multiple Choice
              </button>
              <button 
                type="button" 
                onClick={() => handleQuestionTypeChange("true-false")}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${currentQuestion.questionType === 'true-false' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                True/False
              </button>
            </div>

            {currentQuestion.questionType === "multiple-choice" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentQuestion.options.map((option, idx) => (
                  <div key={idx} className={`flex items-center px-3 py-2 rounded-lg border transition ${currentQuestion.correctAnswer === idx ? 'border-green-500 bg-green-50/50' : 'border-gray-200 bg-white'}`}>
                    <input 
                      type="radio" 
                      name="correct" 
                      checked={currentQuestion.correctAnswer === idx} 
                      onChange={() => setCurrentQuestion(prev => ({ ...prev, correctAnswer: idx }))}
                      className="w-4 h-4 text-green-600 accent-green-600"
                    />
                    <input 
                      type="text" 
                      value={option} 
                      onChange={(e) => {
                        const newOpts = [...currentQuestion.options];
                        newOpts[idx] = e.target.value;
                        setCurrentQuestion(prev => ({ ...prev, options: newOpts }));
                      }}
                      placeholder={`Option ${idx + 1}`}
                      className="ml-3 bg-transparent w-full text-sm outline-none"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex space-x-3">
                {["True", "False"].map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentQuestion(prev => ({ ...prev, correctAnswer: idx }))}
                    className={`flex-1 py-3 rounded-lg border-2 font-bold text-sm transition ${currentQuestion.correctAnswer === idx ? 'border-red-800 bg-red-50 text-red-800' : 'border-gray-100 bg-white text-gray-500'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            <button 
              type="button" 
              onClick={handleAddQuestion}
              className="w-full py-2.5 bg-gray-800 text-white rounded-lg font-bold text-sm hover:bg-gray-900 transition flex items-center justify-center"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Question to List
            </button>
          </div>

          {quizData.questions.length > 0 && (
            <div className="space-y-3">
              <h5 className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Added Questions ({quizData.questions.length})</h5>
              <div className="max-h-48 overflow-y-auto no-scrollbar space-y-2 pr-1">
                {quizData.questions.map((q, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-xl border border-gray-200 flex items-start justify-between shadow-sm">
                    <div className="flex space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-50 text-red-800 flex items-center justify-center text-[10px] font-bold border border-red-100">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 leading-tight">{q.text}</p>
                        <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold">{q.questionType}</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => handleRemoveQuestion(idx)} className="p-1.5 text-gray-300 hover:text-red-600 transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <Modal onClose={onClose} maxWidth="max-w-2xl">
      <div className="bg-white rounded-2xl shadow-2xl w-full relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-red-800 z-20"></div>

        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 z-10 w-9 h-9 bg-gray-50 rounded-full flex items-center justify-center hover:bg-gray-100 transition shadow-sm border border-gray-100"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <form onSubmit={handleSubmit} className="max-h-[88vh] overflow-y-auto no-scrollbar">
          <div className="p-8 space-y-8">
            <div className="flex items-center pt-2">
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mr-4 shadow-inner">
                <Upload className="w-6 h-6 text-red-800" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900 leading-none">
                  {isNewCourse ? "Create New Course" : isAddingToCourse ? "Add New Lesson" : "Quick Upload"}
                </h2>
                <p className="text-sm text-gray-500 mt-1 font-medium">Complete the details below to publish.</p>
              </div>
            </div>

            <div className="border-b border-gray-100 -mx-8"></div>

            {isNewCourse && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 ml-1">
                   <Info className="w-5 h-5 text-gray-700" />
                   <h3 className="text-base font-bold text-gray-800">Course Information</h3>
                </div>
                <div className="space-y-3">
                  <input type="text" value={cTitle} onChange={(e) => setCTitle(e.target.value)} required className={InputStyle} placeholder="Give your course a catchy title" />
                  <textarea value={cDesc} onChange={(e) => setCDesc(e.target.value)} required rows={2} className={InputStyle} placeholder="What is this course about?" />
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center space-x-2 ml-1">
                <Video className="w-5 h-5 text-gray-700" /> 
                <h3 className="text-base font-bold text-gray-800">{isNewCourse ? "Initial Lesson" : "Lesson Details"}</h3>
              </div>
              <div className="space-y-4 p-5 bg-gray-50/50 rounded-2xl border border-gray-200">
                <input type="text" value={lTitle} onChange={(e) => setLTitle(e.target.value)} required className={InputStyle} placeholder="Lesson Title" />
                <textarea value={lDesc} onChange={(e) => setLDesc(e.target.value)} rows={2} className={InputStyle} placeholder="Briefly describe this lesson..." />
                <FileDrop onFileSelect={setFile} />
              </div>
            </div>

            {renderQuizSection()}

            <div className="pt-4 flex items-center justify-between">
                <button type="button" onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-800 transition">Discard</button>
                {uploading || isSaving ? (
                 <div className="flex items-center space-x-3 bg-red-800/10 px-6 py-2.5 rounded-xl">
                   <Spinner size={20} />
                   <span className="text-sm font-bold text-red-800">Processing...</span>
                 </div>
               ) : (
                 <button
                   type="submit"
                   className={`px-8 py-3 text-sm font-black text-white rounded-xl shadow-lg shadow-red-900/20 transition-all transform active:scale-95 ${
                     (includeQuiz && quizData.questions.length === 0) || !isLessonReady 
                     ? "bg-gray-300 cursor-not-allowed" 
                     : "bg-red-800 hover:bg-red-700 hover:-translate-y-0.5"
                   }`}
                   disabled={(includeQuiz && quizData.questions.length === 0) || !isLessonReady}
                 >
                   {isNewCourse ? "Publish Course" : "Upload Lesson"}
                 </button>
               )}
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CourseUploadModal;