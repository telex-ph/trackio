import { useMemo, useRef, useState } from "react";
import { Upload, Video, X, FileUp } from "lucide-react";
import Spinner from "../../../assets/loaders/Spinner";

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
        accept=".mp4, .mov, .avi"
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
            <p className="font-semibold text-green-700">File: **{name}**</p>
            <p className="text-sm text-gray-500 mt-1">Click to change.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <FileUp className="w-8 h-8 text-gray-500 mb-2" />
            <p className="font-semibold text-gray-700">
              Click or drag video file
            </p>
            <p className="text-sm text-gray-500 mt-1">
              MP4, MOV, AVI (Max 5GB)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const InputStyle =
  "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none transition";

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
  const isNewCourse = useMemo(
    () => courseToAddTo?.type === "course",
    [courseToAddTo]
  );
  const isQuickAccess = useMemo(
    () => courseToAddTo?.type === "video" && courseToAddTo?.course === null,
    [courseToAddTo]
  );
  const isAddingToCourse = useMemo(
    () => courseToAddTo?.type === "video" && courseToAddTo?.course !== null,
    [courseToAddTo]
  );

  const [cTitle, setCTitle] = useState(""),
    [cDesc, setCDesc] = useState("");
  const [lTitle, setLTitle] = useState(""),
    [lDesc, setLDesc] = useState("");
  const [file, setFile] = useState(null);
  const [cId] = useState(courseToAddTo?.course?.id || "");

  const isLessonReady = useMemo(() => lTitle.trim() && file, [lTitle, file]);
  const isCourseReady = useMemo(
    () => cTitle.trim() && cDesc.trim(),
    [cTitle, cDesc]
  );
  const isDisabled = useMemo(
    () =>
      isNewCourse
        ? !isCourseReady || !isLessonReady
        : !isLessonReady || (isAddingToCourse && !cId),
    [isNewCourse, isCourseReady, isLessonReady, cId, isAddingToCourse]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isDisabled) {
      return;
    }

    const lessonData = {
      id: Date.now(),
      title: lTitle.trim(),
      duration: 0,
      description: lDesc.trim() || "No specific description available.",
      file: file,
    };

    const data = isNewCourse
      ? {
          type: "course",
          title: cTitle.trim(),
          duration: 0,
          description: cDesc.trim(),
          newLesson: lessonData,
          completed: false,
        }
      : { type: "video", courseId: cId || null, newLesson: lessonData };
    onUpload(data);
  };

  return (
    <Modal onClose={onClose} maxWidth="max-w-xl">
      <div className="bg-white rounded-xl shadow-[0_20px_40px_-5px_rgba(0,0,0,0.3)] w-full">
        <div className="p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center">
            <Upload className="w-6 h-6 mr-3 text-red-800" />
            <h2 className="text-xl sm:text-2xl font-bold text-red-800">
              {isNewCourse
                ? "Upload New Course"
                : isQuickAccess
                ? "Quick Video Upload"
                : "Add Lesson to Course"}
            </h2>
          </div>
          <button
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
                    Title
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
                    Description
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
                    Lesson Title
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
                    Video File
                  </label>
                  <FileDrop onFileSelect={setFile} />
                </div>
                <p
                  className={`text-xs mt-2 font-medium ${
                    !isLessonReady ? "text-red-600" : "text-gray-500"
                  }`}
                >
                  {isLessonReady
                    ? "Video complete."
                    : "**REQUIRED:** Title, Duration (MM:SS), File."}
                </p>
              </div>
            </div>
            <div className="pt-4 flex justify-end space-x-3 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>

              {uploading ? (
                <Spinner size={30} />
              ) : (
                <button
                  type="submit"
                  className={`px-4 py-2 text-sm text-white rounded-lg transition ${
                    isDisabled
                      ? "bg-red-400 cursor-not-allowed"
                      : "bg-red-800 hover:bg-red-700"
                  }`}
                  disabled={uploading}
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
