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
  Copy
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
      toast.error("Failed to load certificate");
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
      setLoading(true);
      const { data } = await api.post(`/courses/${course._id}/certificate`, {
        userId: user._id
      });
      setCertificate(data);
      toast.success("Certificate generated successfully!");
    } catch (error) {
      console.error("Error generating certificate:", error);
      toast.error(error.response?.data?.error || "Failed to generate certificate");
    } finally {
      setLoading(false);
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

  if (!courseCompletionStatus?.fullyCompleted && !certificate) {
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
                You need to complete all lessons and pass all quizzes to generate a certificate.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h4 className="font-bold text-gray-700 mb-4">Completion Requirements</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Lessons:</span>
                    <span className="font-bold">{course.lessons?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Lessons Completed:</span>
                    <span className="font-bold text-green-600">
                      {courseCompletionStatus?.completedLessons || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Progress:</span>
                    <span className="font-bold text-red-600">
                      {courseCompletionStatus?.completionPercentage || 0}%
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
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
                <h2 className="text-xl font-bold text-gray-900">Certificate of Completion</h2>
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
          
          {!certificate ? (
            <div className="text-center py-10">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Generate Your Certificate
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Congratulations on completing the course! Click the button below to generate your certificate.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                >
                  Close
                </button>
                <button
                  onClick={generateCertificate}
                  className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium flex items-center"
                >
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Generate Certificate
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Certificate Preview */}
              <div className="bg-gradient-to-br from-red-50 to-white border-4 border-red-800 rounded-xl p-8 mb-6 relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-red-100 rounded-full -translate-x-16 -translate-y-16 opacity-50"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-red-100 rounded-full translate-x-16 translate-y-16 opacity-50"></div>
                
                <div className="text-center relative z-10">
                  {/* Certificate Header */}
                  <div className="mb-8">
                    <div className="flex items-center justify-center mb-4">
                      <GraduationCap className="w-12 h-12 text-red-600 mr-3" />
                      <h1 className="text-3xl font-bold text-red-900">CERTIFICATE OF COMPLETION</h1>
                    </div>
                    <div className="h-1 w-48 bg-red-600 mx-auto rounded-full"></div>
                  </div>
                  
                  {/* Presented To */}
                  <div className="mb-10">
                    <p className="text-gray-600 text-lg mb-2">This certificate is proudly presented to</p>
                    <h2 className="text-4xl font-bold text-red-900 mb-3">{user.name || user.email}</h2>
                    <p className="text-gray-600">for successfully completing the course</p>
                  </div>
                  
                  {/* Course Title */}
                  <div className="mb-10">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{course.title}</h3>
                    <p className="text-gray-600">{course.description}</p>
                  </div>
                  
                  {/* Certificate Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="text-left">
                      <div className="flex items-center mb-2">
                        <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                        <span className="text-sm text-gray-600">Completion Date</span>
                      </div>
                      <p className="font-bold text-gray-800">
                        {formatDate(certificate.completionDate)}
                      </p>
                    </div>
                    <div className="text-left">
                      <div className="flex items-center mb-2">
                        <Award className="w-4 h-4 text-gray-500 mr-2" />
                        <span className="text-sm text-gray-600">Certificate ID</span>
                      </div>
                      <p className="font-mono font-bold text-gray-800">
                        {certificate.certificateNumber}
                      </p>
                    </div>
                    <div className="text-left">
                      <div className="flex items-center mb-2">
                        <BookOpen className="w-4 h-4 text-gray-500 mr-2" />
                        <span className="text-sm text-gray-600">Lessons Completed</span>
                      </div>
                      <p className="font-bold text-gray-800">
                        {courseCompletionStatus?.completedLessons || 0} of {courseCompletionStatus?.totalLessons || 0}
                      </p>
                    </div>
                    <div className="text-left">
                      <div className="flex items-center mb-2">
                        <CheckCircle className="w-4 h-4 text-gray-500 mr-2" />
                        <span className="text-sm text-gray-600">Status</span>
                      </div>
                      <p className="font-bold text-green-600">Verified & Active</p>
                    </div>
                  </div>
                  
                  {/* Signatures */}
                  <div className="pt-8 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <div className="h-0.5 w-32 bg-gray-400 mb-2"></div>
                        <p className="text-sm text-gray-600">Course Instructor</p>
                        <p className="font-bold text-gray-800">{course.instructor || "Learning Platform"}</p>
                      </div>
                      <div>
                        <div className="h-0.5 w-32 bg-gray-400 mb-2"></div>
                        <p className="text-sm text-gray-600">Issued By</p>
                        <p className="font-bold text-gray-800">Learning Management System</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Certificate Actions */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-bold text-gray-700 mb-4">Certificate Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center mb-2">
                      <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Issued On</span>
                    </div>
                    <p className="font-bold">{formatDate(certificate.issuedAt)}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center mb-2">
                      <Clock className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Valid Until</span>
                    </div>
                    <p className="font-bold">{formatDate(certificate.expiryDate)}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center mb-2">
                      <CheckCircle className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Certificate Status</span>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={downloadCertificate}
                    disabled={downloading}
                    className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium flex items-center justify-center"
                  >
                    {downloading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Download Certificate (PDF)
                      </>
                    )}
                  </button>
                  <button
                    onClick={shareCertificate}
                    className="px-5 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium flex items-center"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-5 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium flex items-center"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Print
                  </button>
                </div>
                
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500">
                    This certificate verifies the successful completion of all course requirements.
                    Certificate ID: <span className="font-mono">{certificate.certificateNumber}</span>
                  </p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(certificate.certificateNumber);
                      toast.success("Certificate ID copied to clipboard!");
                    }}
                    className="mt-1 text-xs text-blue-600 hover:text-blue-800 flex items-center justify-center mx-auto"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copy Certificate ID
                  </button>
                </div>
              </div>
            </>
          )}
          
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