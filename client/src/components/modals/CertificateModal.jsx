import { useState, useEffect } from "react";
import {
  X,
  Download,
  Share2,
  Printer,
  GraduationCap,
  Award,
  Calendar,
  FileText,
  User,
  CheckCircle,
  Clock,
  BookOpen,
  Copy,
  Trophy,
  Star,
  Info
} from "lucide-react";
import api from "../../utils/axios";
import { toast } from "react-hot-toast";

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

const CertificateModal = ({ course, user, onClose }) => {
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [courseCompletionStatus, setCourseCompletionStatus] = useState(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (course?._id && user?._id) {
      fetchCertificate();
      fetchCourseCompletionStatus();
    }
  }, [course, user]);

  const fetchCertificate = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/courses/${course._id}/certificate?userId=${user._id}`);
      setCertificate(data);
    } catch (error) {
      console.error("Error fetching certificate:", error);
      // Don't show error if no certificate exists yet
      if (error.response?.status !== 404) {
        toast.error("Failed to load certificate");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseCompletionStatus = async () => {
    try {
      const { data } = await api.get(`/courses/${course._id}/completion-status?userId=${user._id}`);
      setCourseCompletionStatus(data);
    } catch (error) {
      console.error("Error fetching completion status:", error);
    }
  };

  const generateCertificate = async () => {
    try {
      setGenerating(true);
      const { data } = await api.post(`/courses/${course._id}/certificate/generate`, {
        userId: user._id
      });
      setCertificate(data);
      toast.success("Certificate generated successfully!");
    } catch (error) {
      console.error("Error generating certificate:", error);
      toast.error(error.response?.data?.error || "Failed to generate certificate");
    } finally {
      setGenerating(false);
    }
  };

  const downloadCertificate = async () => {
    try {
      setDownloading(true);
      const { data } = await api.get(`/courses/${course._id}/certificate/download?userId=${user._id}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${course.title.replace(/\s+/g, '_')}_Certificate.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success("Certificate downloaded successfully!");
    } catch (error) {
      console.error("Error downloading certificate:", error);
      toast.error("Failed to download certificate");
    } finally {
      setDownloading(false);
    }
  };

  const shareCertificate = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Certificate of Completion - ${course.title}`,
          text: `I have successfully completed the ${course.title} course!`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing certificate:", error);
      toast.error("Failed to share certificate");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Modal onClose={onClose}>
        <div className="bg-white rounded-xl shadow-[0_20px_40px_-5px_rgba(0,0,0,0.3)] w-full">
          <div className="p-6 flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
            <p className="text-gray-600">Loading certificate...</p>
          </div>
        </div>
      </Modal>
    );
  }

  // Check if course is fully completed (all lessons + all quizzes passed)
  const isCourseFullyCompleted = courseCompletionStatus?.fullyCompleted;

  if (!isCourseFullyCompleted && !certificate) {
    return (
      <Modal onClose={onClose}>
        <div className="bg-white rounded-xl shadow-[0_20px_40px_-5px_rgba(0,0,0,0.3)] w-full">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <GraduationCap className="w-8 h-8 text-red-600 mr-3" />
                <h2 className="text-xl font-bold text-gray-900">Course Certificate</h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="text-center py-10">
              <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-12 h-12 text-yellow-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Course Not Yet Completed
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Complete all lessons and pass all quizzes to unlock your certificate.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h4 className="font-bold text-gray-700 mb-4">Completion Requirements</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Lessons:</span>
                    <span className="font-bold">{courseCompletionStatus?.totalLessons || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Lessons Completed:</span>
                    <span className={`font-bold ${courseCompletionStatus?.completedLessons === courseCompletionStatus?.totalLessons ? 'text-green-600' : 'text-red-600'}`}>
                      {courseCompletionStatus?.completedLessons || 0} / {courseCompletionStatus?.totalLessons || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Quizzes Passed:</span>
                    <span className={`font-bold ${courseCompletionStatus?.passedQuizzes === courseCompletionStatus?.totalQuizzes ? 'text-green-600' : 'text-red-600'}`}>
                      {courseCompletionStatus?.passedQuizzes || 0} / {courseCompletionStatus?.totalQuizzes || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Overall Progress:</span>
                    <span className="font-bold text-red-600">
                      {courseCompletionStatus?.completionPercentage || 0}%
                    </span>
                  </div>
                </div>
                
                {courseCompletionStatus?.lessonsNeedingCompletion?.length > 0 && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <h5 className="font-medium text-yellow-800 mb-2">Remaining Requirements:</h5>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {courseCompletionStatus.lessonsNeedingCompletion.map((lesson, idx) => (
                        <li key={idx} className="flex items-center">
                          <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                          {lesson}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-3 justify-center">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    );
  }

  if (!certificate && isCourseFullyCompleted) {
    return (
      <Modal onClose={onClose}>
        <div className="bg-white rounded-xl shadow-[0_20px_40px_-5px_rgba(0,0,0,0.3)] w-full">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <GraduationCap className="w-8 h-8 text-red-600 mr-3" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">🎉 Course Completed!</h2>
                  <p className="text-sm text-gray-600">You've completed all requirements</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="text-center py-10">
              <div className="w-32 h-32 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-16 h-16 text-green-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-4">
                Congratulations! 🎓
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                You've successfully completed all lessons and passed all quizzes for <span className="font-bold text-red-600">{course.title}</span>.
              </p>
              
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 mb-6 border border-green-200">
                <h4 className="font-bold text-gray-700 mb-4 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  Completion Summary
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{courseCompletionStatus?.completedLessons || 0}</div>
                    <div className="text-sm text-gray-600">Lessons Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{courseCompletionStatus?.passedQuizzes || 0}</div>
                    <div className="text-sm text-gray-600">Quizzes Passed</div>
                  </div>
                  <div className="text-center col-span-2">
                    <div className="text-2xl font-bold text-red-600">100%</div>
                    <div className="text-sm text-gray-600">Overall Completion</div>
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <p className="text-gray-600 mb-4">
                  Generate your official certificate of completion:
                </p>
                <button
                  onClick={generateCertificate}
                  disabled={generating}
                  className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition font-medium flex items-center justify-center mx-auto shadow-lg"
                >
                  {generating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating Certificate...
                    </>
                  ) : (
                    <>
                      <GraduationCap className="w-5 h-5 mr-2" />
                      Generate Certificate
                    </>
                  )}
                </button>
              </div>
              
              <div className="flex space-x-3 justify-center">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal onClose={onClose} maxWidth="max-w-4xl">
      <div className="bg-white rounded-xl shadow-[0_20px_40px_-5px_rgba(0,0,0,0.3)] w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <GraduationCap className="w-8 h-8 text-red-600 mr-3" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">🎓 Certificate of Completion</h2>
                <p className="text-sm text-gray-600">{course.title}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Certificate Preview */}
          <div className="bg-gradient-to-br from-red-50 to-white border-4 border-red-800 rounded-xl p-8 mb-6 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-red-100 rounded-full -translate-x-16 -translate-y-16 opacity-50"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-red-100 rounded-full translate-x-16 translate-y-16 opacity-50"></div>
            <div className="absolute top-4 right-4">
              <Star className="w-12 h-12 text-yellow-400 opacity-30" />
            </div>
            <div className="absolute bottom-4 left-4">
              <Star className="w-8 h-8 text-yellow-400 opacity-30" />
            </div>
            
            <div className="text-center relative z-10">
              {/* Certificate Header */}
              <div className="mb-8">
                <div className="flex items-center justify-center mb-4">
                  <GraduationCap className="w-16 h-16 text-red-600 mr-3" />
                  <div>
                    <h1 className="text-4xl font-bold text-red-900 tracking-wide">CERTIFICATE OF COMPLETION</h1>
                    <p className="text-lg text-gray-600 mt-1">This certifies that</p>
                  </div>
                </div>
                <div className="h-1 w-64 bg-gradient-to-r from-red-600 to-red-800 mx-auto rounded-full"></div>
              </div>
              
              {/* Student Name */}
              <div className="mb-10">
                <h2 className="text-5xl font-bold text-red-900 mb-3 py-2 border-b-4 border-t-4 border-red-200 px-8">
                  {user.name || user.email}
                </h2>
                <p className="text-gray-600 text-lg">has successfully completed</p>
              </div>
              
              {/* Course Title */}
              <div className="mb-10">
                <h3 className="text-3xl font-bold text-gray-800 mb-2">{course.title}</h3>
                <p className="text-gray-600 max-w-2xl mx-auto">{course.description}</p>
              </div>
              
              {/* Certificate Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-4 bg-white rounded-lg shadow-sm border">
                  <div className="flex items-center justify-center mb-2">
                    <Calendar className="w-5 h-5 text-red-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Completion Date</span>
                  </div>
                  <p className="font-bold text-gray-800 text-lg">
                    {formatDate(certificate.completionDate)}
                  </p>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm border">
                  <div className="flex items-center justify-center mb-2">
                    <Award className="w-5 h-5 text-red-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Certificate ID</span>
                  </div>
                  <p className="font-mono font-bold text-gray-800 text-lg tracking-wider">
                    {certificate.certificateNumber}
                  </p>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm border">
                  <div className="flex items-center justify-center mb-2">
                    <BookOpen className="w-5 h-5 text-red-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Course Duration</span>
                  </div>
                  <p className="font-bold text-gray-800 text-lg">
                    {Math.floor(course.duration / 60)}h {(course.duration % 60)}m
                  </p>
                </div>
              </div>
              
              {/* Signatures */}
              <div className="pt-8 border-t border-gray-200 mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="text-center">
                    <div className="h-0.5 w-48 bg-gray-400 mx-auto mb-3"></div>
                    <p className="text-sm text-gray-600">Course Instructor</p>
                    <p className="font-bold text-gray-800 text-lg">{course.instructor || "Learning Platform"}</p>
                  </div>
                  <div className="text-center">
                    <div className="h-0.5 w-48 bg-gray-400 mx-auto mb-3"></div>
                    <p className="text-sm text-gray-600">Issued By</p>
                    <p className="font-bold text-gray-800 text-lg">President & CEO</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Certificate Actions */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h4 className="font-bold text-gray-700 mb-4 flex items-center">
              <FileText className="w-5 h-5 text-red-600 mr-2" />
              Certificate Details & Actions
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center mb-2">
                  <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Issued On</span>
                </div>
                <p className="font-bold text-gray-800">{formatDate(certificate.issuedAt)}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center mb-2">
                  <Clock className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Valid Until</span>
                </div>
                <p className="font-bold text-gray-800">{formatDate(certificate.expiryDate)}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center mb-2">
                  <CheckCircle className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Status</span>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-green-100 to-green-200 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified & Active
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <button
                onClick={downloadCertificate}
                disabled={downloading}
                className="col-span-2 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition font-medium flex items-center justify-center shadow-md"
              >
                {downloading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 mr-2" />
                    Download Certificate (PDF)
                  </>
                )}
              </button>
              
              <div className="flex space-x-2">
                <button
                  onClick={shareCertificate}
                  className="flex-1 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium flex items-center justify-center border border-gray-200"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium flex items-center justify-center border border-gray-200"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </button>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <div className="flex items-center mb-2">
                <Info className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-700">Certificate Verification</span>
              </div>
              <p className="text-xs text-blue-600">
                This certificate can be verified using the Certificate ID. Keep this ID secure for future verification.
              </p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-sm text-gray-600">Certificate ID:</span>
                <div className="flex items-center">
                  <code className="font-mono text-sm bg-white px-3 py-1 rounded border mr-2">
                    {certificate.certificateNumber}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(certificate.certificateNumber);
                      toast.success("Certificate ID copied to clipboard!");
                    }}
                    className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CertificateModal;