import { useMemo, useRef, useState, useEffect } from "react";
import { 
Upload,
Video, 
X, 
FileUp, 
Award, 
Plus, 
Trash2, 
Info 
} from "lucide-react";
import Spinner from "../../../assets/loaders/Spinner";
import { toast } from "react-hot-toast";
import { useStore } from "../../../store/useStore"; 

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
    // Ensure all questions have STRING IDs and correctAnswer is NUMBER
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

const InputStyle = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none transition";

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

const CourseUploadModal = ({ onClose, onUpload, courseToAddTo, uploading }) => {
  const user = useStore((store) => store.user); // ✅ Get user from store
  
  const isNewCourse = useMemo(
    () => courseToAddTo?.type === "course",
    [courseToAddTo]
  );
  const isAddingToCourse = useMemo(
    () => courseToAddTo?.type === "video" && courseToAddTo?.course !== null,
    [courseToAddTo]
  );

  const [cTitle, setCTitle] = useState("");
  const [cDesc, setCDesc] = useState("");
  const [lTitle, setLTitle] = useState("");
  const [lDesc, setLDesc] = useState("");
  const [file, setFile] = useState(null);
  const [includeQuiz, setIncludeQuiz] = useState(false);
  const [quizData, setQuizData] = useState({
    title: `${lTitle} Quiz`,
    description: `Test your knowledge from "${lTitle}"`,
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
    // IMPORTANT: Prevent form submission
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

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

    // Generate a unique ID for the question
    const questionId = `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newQuestion = {
      _id: questionId,
      text: currentQuestion.text,
      questionType: currentQuestion.questionType,
      options: currentQuestion.questionType === "true-false" ? ["True", "False"] : [...currentQuestion.options],
      correctAnswer: currentQuestion.correctAnswer,
      points: currentQuestion.points,
      explanation: currentQuestion.explanation
    };

    setQuizData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));

    // Reset question form
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
    const updatedQuestions = quizData.questions.filter((_, i) => i !== index);
    setQuizData(prev => ({ ...prev, questions: updatedQuestions }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      toast.error("Video file is required. Please select a video to upload.");
      return;
    }

    if (!lTitle.trim()) {
      toast.error("Lesson title is required");
      return;
    }

    // If quiz is included, validate and process quiz data
    let finalQuizData = null;
    if (includeQuiz) {
      if (quizData.questions.length === 0) {
        toast.error("Please add at least one question to the quiz");
        return;
      }
      
      setIsSaving(true);
      try {
        const savedQuiz = await handleSaveQuiz(quizData);
        if (!savedQuiz) {
          setIsSaving(false);
          return; // Validation failed
        }
        finalQuizData = savedQuiz;
      } catch (error) {
        console.error("Error saving quiz:", error);
        toast.error("Failed to save quiz");
        setIsSaving(false);
        return;
      } finally {
        setIsSaving(false);
      }
    }

    try {
      const data = {
        type: isNewCourse ? "course" : "video",
        title: cTitle.trim(),
        description: cDesc.trim(),
        newLesson: {
          title: lTitle.trim(),
          description: lDesc.trim() || "No specific description available.",
          file: file,
          quiz: finalQuizData // Use the validated quiz data
        }
      };

      if (isAddingToCourse) {
        data.courseId = courseToAddTo.course._id;
      }

      console.log("Uploading course data:", data);
      await onUpload(data);
      
    } catch (error) {
      console.error("Upload error in modal:", error);
      toast.error("Failed to prepare upload data");
    }
  };

  const renderQuizSection = () => (
    <div className="pt-4 border-t border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-bold text-gray-700 flex items-center">
          <Award className="w-5 h-5 mr-2 text-red-600" />
          Add Quiz to Lesson
        </h4>
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={includeQuiz}
            onChange={(e) => {
              setIncludeQuiz(e.target.checked);
              // If turning off quiz, reset quiz data
              if (!e.target.checked) {
                setQuizData({
                  title: `${lTitle} Quiz`,
                  description: `Test your knowledge from "${lTitle}"`,
                  passingScore: 70,
                  timeLimit: 0,
                  questions: []
                });
              }
            }}
            className="sr-only peer"
          />
          <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
          <span className="ml-3 text-sm font-medium text-gray-900">
            {includeQuiz ? "Quiz Enabled" : "Add Quiz"}
          </span>
        </label>
      </div>

      {includeQuiz && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-6">
          {/* Quiz Basic Info */}
          <div>
            <h5 className="font-bold text-gray-700 mb-3">📋 Quiz Information</h5>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Quiz Title *
                </label>
                <input
                  type="text"
                  value={quizData.title}
                  onChange={(e) => setQuizData(prev => ({ ...prev, title: e.target.value }))}
                  className={InputStyle}
                  placeholder="e.g., Lesson Quiz"
                  required={includeQuiz}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Passing Score (%) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={quizData.passingScore}
                    onChange={(e) => setQuizData(prev => ({ ...prev, passingScore: parseInt(e.target.value) || 70 }))}
                    className={InputStyle}
                    required={includeQuiz}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Time Limit (minutes)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={quizData.timeLimit}
                    onChange={(e) => setQuizData(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 0 }))}
                    className={InputStyle}
                    placeholder="0 for no limit"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Quiz Description
                </label>
                <textarea
                  value={quizData.description}
                  onChange={(e) => setQuizData(prev => ({ ...prev, description: e.target.value }))}
                  className={InputStyle}
                  rows="2"
                  placeholder="What will this quiz cover?"
                />
              </div>
            </div>
          </div>

          {/* Add Questions */}
          <div>
            <h5 className="font-bold text-gray-700 mb-3">❓ Add Questions</h5>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Question Text *
                </label>
                <textarea
                  value={currentQuestion.text}
                  onChange={(e) => setCurrentQuestion(prev => ({ ...prev, text: e.target.value }))}
                  className={InputStyle}
                  rows="2"
                  placeholder="Enter your question here..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Question Type
                </label>
                <div className="flex space-x-4">
                  <button
                    type="button" // IMPORTANT: Add type="button"
                    onClick={() => handleQuestionTypeChange("multiple-choice")}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition ${
                      currentQuestion.questionType === "multiple-choice"
                        ? "bg-red-100 text-red-700 border border-red-300"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Multiple Choice
                  </button>
                  <button
                    type="button" // IMPORTANT: Add type="button"
                    onClick={() => handleQuestionTypeChange("true-false")}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition ${
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
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Answer Options *
                  </label>
                  <div className="space-y-2">
                    {currentQuestion.options.map((option, idx) => (
                      <div key={idx} className="flex items-center space-x-2 bg-white p-2 rounded border">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="correctAnswer"
                            checked={currentQuestion.correctAnswer === idx}
                            onChange={() => setCurrentQuestion(prev => ({ ...prev, correctAnswer: idx }))}
                            className="text-red-600"
                          />
                          <span className="ml-2 text-xs font-medium text-gray-700 w-4">
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
                          className={`${InputStyle} flex-1 border-0 focus:ring-0 text-xs`}
                          placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentQuestion.questionType === "true-false" && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Select Correct Answer
                  </label>
                  <div className="flex space-x-4">
                    {["True", "False"].map((option, idx) => (
                      <button
                        key={idx}
                        type="button" // IMPORTANT: Add type="button"
                        onClick={() => setCurrentQuestion(prev => ({ ...prev, correctAnswer: idx }))}
                        className={`px-4 py-2 rounded text-xs font-medium transition ${
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
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
                  <label className="block text-xs font-medium text-gray-700 mb-1">
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
                type="button" // IMPORTANT: Add type="button"
                onClick={handleAddQuestion}
                className="w-full py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center text-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add This Question
              </button>
            </div>
          </div>

          {/* Questions List */}
          {quizData.questions.length > 0 && (
            <div>
              <h5 className="font-bold text-gray-700 mb-3">
                📚 Added Questions ({quizData.questions.length})
              </h5>
              <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                {quizData.questions.map((q, idx) => (
                  <div key={q._id || idx} className="bg-white p-3 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xs font-bold text-red-600">Q{idx + 1}</span>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                            {q.points} point{q.points !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-800">{q.text}</p>
                        <div className="mt-2 space-y-1">
                          {q.options.map((opt, optIdx) => (
                            <div key={optIdx} className="flex items-center space-x-1">
                              <span className={`text-xs ${optIdx === q.correctAnswer ? 'text-green-600 font-bold' : 'text-gray-500'}`}>
                                {String.fromCharCode(65 + optIdx)}. {opt}
                                {optIdx === q.correctAnswer && " ✅"}
                              </span>
                            </div>
                          ))}
                        </div>
                        {q.explanation && (
                          <p className="text-xs text-gray-500 mt-1">
                            💡 {q.explanation}
                          </p>
                        )}
                      </div>
                      <button
                        type="button" // IMPORTANT: Add type="button"
                        onClick={() => handleRemoveQuestion(idx)}
                        className="ml-2 p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Remove Question"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {quizData.questions.length === 0 && includeQuiz && (
            <div className="text-center py-4">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium mb-2">
                <Info className="w-3 h-3 mr-1" />
                No questions added
              </div>
              <p className="text-xs text-gray-500">
                💡 Add at least one question to create a quiz
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <Modal onClose={onClose} maxWidth="max-w-2xl">
      <div className="bg-white rounded-xl shadow-[0_20px_40px_-5px_rgba(0,0,0,0.3)] w-full">
        <div className="p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center">
            <Upload className="w-6 h-6 mr-3 text-red-800" />
            <h2 className="text-xl sm:text-2xl font-bold text-red-800">
              {isNewCourse
                ? "Upload New Course"
                : isAddingToCourse
                ? "Add Lesson to Course"
                : "Quick Video Upload"}
            </h2>
          </div>
          <button
            type="button" // IMPORTANT: Add type="button"
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-4 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            {isAddingToCourse && (
              <div className="pb-3 border-b border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Course
                </label>
                <p className="text-base font-bold text-gray-800">
                  {courseToAddTo.course.title}
                </p>
              </div>
            )}
            {isNewCourse && (
              <div className="pb-4 border-gray-100">
                <h3 className="text-lg font-bold text-gray-700 mb-2">
                  Course Info
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={cTitle}
                    onChange={(e) => setCTitle(e.target.value)}
                    required
                    className={InputStyle}
                    placeholder="e.g., Next.js Masterclass"
                  />
                </div>
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={cDesc}
                    onChange={(e) => setCDesc(e.target.value)}
                    required
                    rows={2}
                    className={InputStyle}
                    placeholder="A comprehensive course..."
                  />
                </div>
              </div>
            )}
            <div className="pt-2 border-t border-red-100">
              <h3 className="text-lg font-bold text-red-700 mb-3 flex items-center">
                <Video className="w-5 h-5 mr-2" />{" "}
                {isNewCourse ? "First Lesson Details" : "New Lesson Details"}
              </h3>
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Lesson Title *
                  </label>
                  <input
                    type="text"
                    value={lTitle}
                    onChange={(e) => setLTitle(e.target.value)}
                    required
                    className={InputStyle}
                    placeholder="e.g., Module 1: Introduction"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={lDesc}
                    onChange={(e) => setLDesc(e.target.value)}
                    rows={1}
                    className={InputStyle}
                    placeholder="Brief summary..."
                  />
                </div>
                <div className="pt-2">
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Video File *
                  </label>
                  <FileDrop onFileSelect={setFile} />
                </div>
              </div>
            </div>
            
            {/* Quiz Section */}
            {renderQuizSection()}
            
            <div className="pt-4 flex justify-end space-x-3 border-t border-gray-100">
              <button
                type="button" // IMPORTANT: Add type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>

              {(uploading || isSaving) ? (
                <Spinner size={30} />
              ) : (
                <button
                  type="submit" // This button should submit the form
                  className={`px-4 py-2 text-sm text-white rounded-lg transition bg-red-800 hover:bg-red-700 ${
                    (includeQuiz && quizData.questions.length === 0) || !isLessonReady
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={(includeQuiz && quizData.questions.length === 0) || !isLessonReady}
                >
                  {isNewCourse ? "Create Course & Upload" : "Upload Lesson"}
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