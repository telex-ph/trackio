import React, { useState, useMemo, useRef, useEffect } from "react";
import { User, Clock, Play, BookOpen, X, BookOpenText, List, CheckCircle, FileText, TrendingUp, Grid3x3, Upload, Maximize, Minimize2, Users, FileUp, Video, Loader, Pause, Volume2, Settings } from "lucide-react";
import CourseBannerImage from "../../assets/background/course-image.png";

// --- Mock Data ---
const mockVideos = [{ id: 101, title: "Introduction to Hooks", course: "React Hooks", instructor: "John Doe", time: "3:20", type: "React", progress: 100, description: "A detailed first look into the useState hook." }, { id: 102, title: "Auto Layout Deep Dive", course: "Figma UI/UX", instructor: "Jane Smith", time: "4:15", type: "Figma", progress: 65, description: "Mastering Auto Layout 3.0 principles." }, { id: 103, title: "Server Side Rendering", course: "Next.js", instructor: "Alex Kim", time: "5:00", type: "Next.js", progress: 20, description: "Understanding the core concepts of SSR." }, { id: 107, title: "Data Visualization", course: "Python Data Science", instructor: "Chris Lee", time: "7:40", type: "Python", progress: 30, description: "Practical exercises on Matplotlib." },];
const mockCourses = [{ id: 1, title: "React Hooks Masterclass", instructor: "John Doe", duration: "10 hrs", lessons: 3, progress: 85, lessonsList: [{ id: 1, title: "Introduction to State Hook", duration: "12:30", completed: true, description: "useState fundamentals." }, { id: 2, title: "Deep Dive into Effect Hook", duration: "15:00", completed: true, description: "useEffect and cleanup." }, { id: 4, title: "Performance Optimization", duration: "10:10", completed: false, description: "useCallback & useMemo." }, ] }, { id: 2, title: "Figma UI/UX Essentials", instructor: "Jane Smith", duration: "8 hrs", lessons: 2, progress: 100, lessonsList: [{ id: 1, title: "Figma Interface Tour", duration: "5:00", completed: true, description: "Quick tour of the interface." }, { id: 2, title: "Mastering Auto Layout 3.0", duration: "14:20", completed: true, description: "Responsive components." }, ] }, { id: 3, title: "Next.js & Server Components", instructor: "Alex Kim", duration: "12 hrs", lessons: 0, progress: 40, lessonsList: [] }, { id: 4, title: "Advanced Web Security", instructor: "Jane Smith", duration: "15 hrs", lessons: 5, progress: 60, lessonsList: [{ id: 1, title: "XSS Prevention", duration: "2:00", completed: true, description: "Cross-site scripting mitigation." }, { id: 2, title: "CSRF & Session Hijacking", duration: "3:30", completed: false, description: "Protecting against forgery." }, { id: 3, title: "API Security Best Practices", duration: "4:00", completed: false, description: "Auth and rate limiting." }, ] }, ];
const mockActivity = [{ id: 1, type: "New Enrollment", details: "Alice enrolled in React Hooks.", time: "2 min ago" }, { id: 2, type: "Course Upload", details: "New video added to Figma UI/UX.", time: "1 hr ago" }, { id: 3, type: "Activity Received", details: "New enrollment processed.", time: "1 day ago" }, { id: 4, type: "New Enrollment", details: "Bob joined Next.js course.", time: "2 days ago" }, { id: 5, type: "Course Upload", details: "Security lesson updated.", time: "5 days ago" }];
const mockInstructors = [{ id: 1, name: "John Doe", title: "Lead Dev", initials: "JD" }, { id: 2, name: "Jane Smith", title: "UX Expert", initials: "JS" }, { id: 3, name: "Alex Kim", title: "Back-end Master", initials: "AK" }, { id: 4, name: "Chris Lee", title: "Data Scientist", initials: "CL" }, { id: 5, name: "Maria Garcia", title: "Mobile Dev", initials: "MG" }];
const InputStyle = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none transition"; 

const Modal = ({ children, onClose, maxWidth = "max-w-5xl" }) => (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto" onClick={onClose}><div className={`w-full ${maxWidth} mx-auto`} onClick={(e) => e.stopPropagation()}>{children}</div></div>);

const CourseProgress = ({ progress }) => { 
    if (progress === 0) return <span className="text-xs font-medium text-gray-500">Not Started</span>; 
    const [c, t] = progress === 100 ? ["bg-green-500", "text-green-500"] : ["bg-red-600", "text-red-600"]; 
    return (<div className="pt-2"><p className={`text-xs font-bold ${t}`}>{progress === 100 ? "Completed" : `${progress}% In Progress`}</p><div className="w-full bg-gray-200 rounded-full h-2 mt-1"><div className={`h-2 rounded-full ${c}`} style={{ width: `${progress}%` }} /></div></div>); 
};

const VideoItem = ({ v, i, onPlay }) => (
    <li key={v.id} className="flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0 hover:bg-red-50 rounded-lg transition">
        <div className="flex items-center space-x-4">
            <span className="text-lg font-bold text-gray-400 w-6 flex-shrink-0 hidden sm:inline">{String(i + 1).padStart(2, "0")}</span>
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-red-800 flex items-center justify-center flex-shrink-0"><Play className="w-4 h-4 sm:w-5 sm:h-5 text-white" /></div>
            <div><p className="text-sm sm:text-base font-semibold text-gray-800">{v.title}</p><p className="text-xs sm:text-sm text-gray-500">{v.instructor} • {v.type}</p></div>
        </div>
        <div className="flex items-center space-x-3 sm:space-x-6">
            <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-gray-600 font-medium text-sm">{v.time}</span>
                {v.progress > 0 && <div className="mt-1 w-16 h-1.5 bg-gray-200 rounded-full"><div className={`h-1.5 rounded-full ${v.progress === 100 ? 'bg-green-500' : 'bg-red-600'}`} style={{ width: `${v.progress}%` }} /></div>}
                {v.progress === 100 ? <span className="text-xs font-bold text-green-600 mt-0.5">Finished</span> : v.progress > 0 && <span className="text-xs font-medium text-red-600 mt-0.5">{v.progress}%</span>}
            </div>
            <button onClick={() => onPlay(v)} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center hover:bg-red-200 transition"><Play className="w-3 h-3 sm:w-4 sm:h-4" /></button>
        </div>
    </li>
);

const CourseCard = ({ c, onViewDetails, onOpenUpload }) => (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg hover:shadow-xl transition duration-300 overflow-hidden cursor-pointer">
        <div className="h-32 sm:h-40 bg-white relative">
            <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-red-800"><BookOpen className="w-8 h-8 sm:w-10 sm:h-10" /></div>
            <div className="absolute bottom-2 right-2 flex items-center bg-red-900/80 text-white text-xs font-semibold px-2 py-1 rounded-full"><Play className="w-3 h-3 mr-1"/>{c.duration}</div>
        </div>
        <div className="p-4">
            <h4 className="font-semibold text-lg truncate mb-1">{c.title}</h4>
            <div className="text-sm text-gray-500 flex items-center mb-3"><User className="w-4 h-4 mr-1 text-red-700"/><span className="text-red-800 font-medium">{c.instructor}</span></div>
            <div className="flex items-center justify-between mb-3">
                <p className="text-base font-bold text-gray-800 flex items-center text-base"><BookOpenText className="w-4 h-4 mr-1 text-red-600"/>{c.lessons} Lessons</p>
                <button onClick={(e)=>{e.stopPropagation();onViewDetails(c)}} className="px-3 py-1 text-sm bg-red-800 text-white rounded-lg hover:bg-red-700 transition">Details</button>
            </div>
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                <CourseProgress progress={c.progress}/>
                <button onClick={(e)=>{e.stopPropagation();onOpenUpload(c)}} className="px-3 py-1.5 text-xs sm:text-sm bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition flex items-center font-bold shadow-sm"><Video className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2"/> Add Lesson</button>
            </div>
        </div>
    </div>
);

const CourseLessonsModal = ({ course, onClose, onPlayLesson }) => { 
    if (!course) return null; 
    const { lessonsList: list, lessons: count, duration, progress, title } = course;
    const [selectedLesson, setSelectedLesson] = useState(null);

    const lessonItem = (l, i) => (
        <li key={l.id} onClick={()=>setSelectedLesson(l)} className={`flex items-center p-3 rounded-lg cursor-pointer transition ${l.completed ? 'bg-green-50 hover:bg-green-100' : 'bg-gray-50 hover:bg-gray-100'} ${selectedLesson?.id === l.id ? 'bg-red-100 ring-2 ring-red-500 shadow-md' : ''}`}>
            <span className="text-sm font-bold text-gray-500 w-5 mr-3">{i+1}.</span>
            <div className="flex-grow"><p className="font-medium text-gray-800">{l.title}</p><p className="text-xs text-gray-500 flex items-center"><Clock className="w-3 h-3 mr-1"/> {l.duration}</p></div>
            <div className="flex items-center space-x-2">{l.completed && <CheckCircle className="w-4 h-4 text-green-600"/>}<button onClick={(e) => {e.stopPropagation(); onPlayLesson(l, course);}} className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center hover:bg-red-200 transition"><Play className="w-4 h-4"/></button></div>
        </li>
    );

    return (
        <Modal onClose={onClose} maxWidth="max-w-4xl">
            <div className="bg-white rounded-xl shadow-[0_20px_40px_-5px_rgba(0,0,0,0.3)] w-full"> 
                <div className="p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center"><div className="flex items-center"><List className="w-5 h-5 sm:w-6 sm:h-6 mr-3 text-red-800"/><h2 className="text-xl sm:text-2xl font-bold">Lessons: <span className="text-red-800">{title}</span></h2></div><button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"><X className="w-4 h-4"/></button></div>
                <div className="flex flex-col md:flex-row max-h-[80vh] overflow-y-auto">
                    <div className={`p-4 sm:p-6 space-y-4 ${selectedLesson ? 'md:w-2/3' : 'w-full'}`}> 
                        <p className="text-sm text-gray-600 border-b pb-3 mb-4 border-gray-100">{count} lessons • Duration: <span className="text-red-800 font-bold">{duration}</span> • Progress: <span className="text-red-800 font-bold">{progress}%</span></p>
                        {list?.length > 0 ? (<ul className="space-y-3">{list.map(lessonItem)}</ul>) : (<div className="text-center p-8 bg-yellow-50 rounded-lg"><BookOpenText className="w-8 h-8 text-yellow-600 mx-auto mb-3" /><p className="text-lg font-semibold text-yellow-800">No Lessons Yet.</p></div>)}
                    </div>
                    {selectedLesson && (<div className="w-full md:w-1/3 p-4 sm:p-6 bg-gray-50 flex flex-col justify-between md:border-l border-t md:border-t-0 border-gray-200"> 
                            <div><h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center"><FileText className="w-5 h-5 mr-2 text-red-600"/>Details</h3><p className="text-sm font-semibold text-red-800 mb-2">{selectedLesson.title}</p><p className="text-xs text-gray-600 mb-4 flex items-center"><Clock className="w-3 h-3 mr-1"/> {selectedLesson.duration}</p>
                                <div className="p-3 bg-white rounded-lg border border-gray-200"><p className="text-sm text-gray-600 whitespace-pre-wrap">{selectedLesson.description || "No specific description available."}</p></div>
                            </div>
                            <button onClick={() => onPlayLesson(selectedLesson, course)} className="w-full py-2.5 bg-red-800 text-white rounded-lg hover:bg-red-700 transition mt-4">Play</button>
                        </div>)}
                </div><div className="p-4 border-t border-gray-100 flex justify-end"><button onClick={onClose} className="px-5 py-2 bg-red-800 text-white rounded-lg hover:bg-red-700">Close</button></div>
            </div>
        </Modal>
    ); 
};

const AllVideosModal = ({ videos, onClose, onPlay }) => (
    <Modal onClose={onClose}><div className="bg-white rounded-xl shadow-[0_20px_40px_-5px_rgba(0,0,0,0.3)] w-full"><div className="p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center"><div className="flex items-center"><TrendingUp className="w-6 h-6 mr-3 text-red-800"/><h2 className="text-xl sm:text-2xl font-bold">All Training Courses</h2></div><button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"><X className="w-4 h-4"/></button></div><div className="p-4 sm:p-6 max-h-[80vh] overflow-y-auto"><p className="text-sm text-gray-600 border-b pb-3 mb-4 border-gray-100">{videos.length} total videos.</p><ul className="space-y-4">{videos.map((v,i)=><VideoItem key={v.id} v={v} i={i} onPlay={onPlay}/>)}</ul></div><div className="p-4 border-t border-gray-100 flex justify-end"><button onClick={onClose} className="px-5 py-2 bg-red-800 text-white rounded-lg hover:bg-red-700">Close</button></div></div></Modal>
);

const AllCoursesModal = ({ courses, onClose, onOpenLessons, onOpenUpload }) => (
    <Modal onClose={onClose} maxWidth="max-w-6xl"><div className="bg-white rounded-xl shadow-[0_20px_40px_-5px_rgba(0,0,0,0.3)] w-full"><div className="p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center"><div className="flex items-center"><Grid3x3 className="w-6 h-6 mr-3 text-red-800"/><h2 className="text-xl sm:text-2xl font-bold">All Courses ({courses.length})</h2></div><button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"><X className="w-4 h-4"/></button></div><div className="p-4 sm:p-6 max-h-[80vh] overflow-y-auto"><p className="text-sm text-gray-600 border-b pb-3 mb-4 border-gray-100">{courses.length} courses available.</p>
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(c=> <CourseCard key={c.id} c={c} onViewDetails={onOpenLessons} onOpenUpload={onOpenUpload}/>)}
        </section>
    </div><div className="p-4 border-t border-gray-100 flex justify-end"><button onClick={onClose} className="px-5 py-2 bg-red-800 text-white rounded-lg hover:bg-red-700">Close</button></div></div></Modal>
);

const InstructorCard = ({ ins, onClick }) => (
    <div key={ins.id} className="text-center p-2 rounded-lg hover:bg-red-50 transition cursor-pointer" onClick={() => onClick(`Profile: ${ins.name}`)}>
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-red-700 p-[3px] mx-auto mb-1">
            <div className="w-full h-full bg-gray-300 rounded-full flex items-center justify-center text-sm sm:text-lg font-bold text-red-800 bg-red-100">{ins.initials}</div>
        </div>
        <p className="text-xs font-semibold truncate mt-1">{ins.name.split(" ")[0]}</p>
        <p className="text-[10px] text-gray-500">{ins.title}</p>
    </div>
);

const AllInstructorsModal = ({ instructors, onClose, onCardClick }) => (
    <Modal onClose={onClose} maxWidth="max-w-3xl">
        <div className="bg-white rounded-xl shadow-[0_20px_40px_-5px_rgba(0,0,0,0.3)] w-full">
            <div className="p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center"><Users className="w-6 h-6 mr-3 text-red-800"/><h2 className="text-xl sm:text-2xl font-bold">All Instructors ({instructors.length})</h2></div>
                <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"><X className="w-4 h-4"/></button>
            </div>
            <div className="p-4 sm:p-6 max-h-[80vh] overflow-y-auto">
                <p className="text-sm text-gray-600 border-b pb-3 mb-4 border-gray-100">Click on an instructor to view their profile (simulated).</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                    {instructors.map(ins => <InstructorCard key={ins.id} ins={ins} onClick={onCardClick} />)}
                </div>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end"><button onClick={onClose} className="px-5 py-2 bg-red-800 text-white rounded-lg hover:bg-red-700">Close</button></div>
        </div>
    </Modal>
);

const ActivityItem = ({ it, onClick }) => (
    <li key={it.id} onClick={() => onClick(`Viewing Details: ${it.details}`)} className="flex items-start space-x-3 p-3 border border-gray-100 rounded-lg hover:bg-red-50 transition cursor-pointer">
        <div className="w-6 h-6 rounded-full bg-red-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">{it.type==="New Enrollment"?"E":it.type==="Course Upload"?"U":"A"}</div>
        <div className="flex-grow"><p className="text-sm font-medium text-gray-800">{it.details}</p><p className="text-xs text-gray-500">{it.time}</p></div>
    </li>
);
const AllActivityModal = ({ activity, onClose, onActivityClick }) => (
    <Modal onClose={onClose} maxWidth="max-w-3xl">
        <div className="bg-white rounded-xl shadow-[0_20px_40px_-5px_rgba(0,0,0,0.3)] w-full">
            <div className="p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center"><List className="w-6 h-6 mr-3 text-red-800"/><h2 className="text-xl sm:text-2xl font-bold">Full Activity Log ({activity.length})</h2></div>
                <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"><X className="w-4 h-4"/></button>
            </div>
            <div className="p-4 sm:p-6 max-h-[80vh] overflow-y-auto">
                <ul className="space-y-3">{activity.map(it => <ActivityItem key={it.id} it={it} onClick={onActivityClick} />)}</ul>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end"><button onClick={onClose} className="px-5 py-2 bg-red-800 text-white rounded-lg hover:bg-red-700">Close</button></div>
        </div>
    </Modal>
);

const FileDrop = ({ onFileSelect }) => {
    const ref = useRef(null); const [isDrag, setIsDrag] = useState(false); const [name, setName] = useState(null);
    const handleChange = (e) => { const file = e.target.files[0]; if (file) { setName(file.name); onFileSelect(file); } else { setName(null); onFileSelect(null); } };
    const handleDrop = (e) => { e.preventDefault(); setIsDrag(false); const file = e.dataTransfer.files[0]; if (file) { setName(file.name); onFileSelect(file); } else { setName(null); onFileSelect(null); } };
    
    return (<div className="relative"><input type="file" ref={ref} onChange={handleChange} accept=".mp4, .mov, .avi" className="hidden"/>
            <div onClick={() => ref.current.click()} onDragOver={(e) => { e.preventDefault(); setIsDrag(true); }} onDragLeave={() => setIsDrag(false)} onDrop={handleDrop}
                className={`p-6 sm:p-8 border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors ${isDrag ? 'border-red-500 bg-red-50' : name ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-red-500 hover:bg-red-50'}`}
            >
                {name ? (<div className="flex flex-col items-center"><Video className="w-8 h-8 text-green-600 mb-2" /><p className="font-semibold text-green-700">File: **{name}**</p><p className="text-sm text-gray-500 mt-1">Click to change.</p></div>) : (
                    <div className="flex flex-col items-center"><FileUp className="w-8 h-8 text-gray-500 mb-2" /><p className="font-semibold text-gray-700">Click or drag video file</p><p className="text-sm text-gray-500 mt-1">MP4, MOV, AVI (Max 5GB)</p></div>
                )}
            </div></div>);
};

const UploadModal = ({ onClose, onUpload, courseToAddTo }) => { 
    const isNewCourse = useMemo(() => courseToAddTo?.type === 'course', [courseToAddTo]);
    const isQuickAccess = useMemo(() => courseToAddTo?.type === 'video' && courseToAddTo?.course === null, [courseToAddTo]);
    const isAddingToCourse = useMemo(() => courseToAddTo?.type === 'video' && courseToAddTo?.course !== null, [courseToAddTo]);

    const [cTitle, setCTitle] = useState(''), [cDesc, setCDesc] = useState(''), [cRawDur, setCRawDur] = useState('');
    const [lTitle, setLTitle] = useState(''), [lDur, setLDur] = useState(''), [lDesc, setLDesc] = useState(''); 
    const [file, setFile] = useState(null); 
    const [cId] = useState(courseToAddTo?.course?.id || '');

    const filterNum = (v) => v.replace(/\D/g, '');
    const handleLDurChange = (e) => {
        let v = filterNum(e.target.value); 
        if (v.length > 4) v = v.slice(0, 4);
        let f = '';
        if (v.length > 2) { const m = v.slice(0, 2); const s = v.slice(2); f = `${m}:${parseInt(s, 10) > 59 ? '59' : s.padStart(2, '0')}`; } 
        else if (v.length > 0) { f = v; }
        setLDur(f);
    };
    
    const isLessonReady = useMemo(() => lTitle.trim() && lDur.length === 5 && lDur.includes(':') && file, [lTitle, lDur, file]);
    const isCourseReady = useMemo(() => cTitle.trim() && cRawDur.trim() && cDesc.trim(), [cTitle, cRawDur, cDesc]);
    const isDisabled = useMemo(() => isNewCourse ? !isCourseReady || !isLessonReady : !isLessonReady || (isAddingToCourse && !cId), [isNewCourse, isCourseReady, isLessonReady, cId, isAddingToCourse]);

    const handleSubmit = (e) => { 
        e.preventDefault(); 
        if (isDisabled) { alert("Pakitiyak ang lahat ng detalye: Title, Duration (MM:SS), at may File ang Lesson."); return; }
        const lessonData = { id: Date.now(), title: lTitle.trim(), duration: lDur, description: lDesc.trim() || 'No specific description available.', file: file.name };
        const data = isNewCourse ? { type: 'course', title: cTitle.trim(), duration: `${cRawDur} hrs`, description: cDesc.trim(), newLesson: lessonData } : { type: 'video', courseId: cId || null, newLesson: lessonData };
        onUpload(data); onClose(); 
    }; 

    return (
        <Modal onClose={onClose} maxWidth="max-w-xl">
            <div className="bg-white rounded-xl shadow-[0_20px_40px_-5px_rgba(0,0,0,0.3)] w-full">
                <div className="p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center">
                    <div className="flex items-center"><Upload className="w-6 h-6 mr-3 text-red-800"/><h2 className="text-xl sm:text-2xl font-bold text-red-800">{isNewCourse ? "Upload New Course" : isQuickAccess ? "Quick Video Upload" : "Add Lesson to Course"}</h2></div>
                    <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"><X className="w-4 h-4"/></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-4 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
                        {isAddingToCourse && (<div className="pb-3 border-b border-gray-100"><label className="block text-sm font-medium text-gray-700 mb-1">Target Course</label><p className="text-base font-bold text-gray-800">{courseToAddTo.course.title}</p></div>)}
                        {isNewCourse && (<div className="pb-4 border-b border-gray-100"><h3 className="text-lg font-bold text-gray-700 mb-2">Course Info</h3><div><label className="block text-sm font-medium text-gray-700 mb-1">Title</label><input type="text" value={cTitle} onChange={(e) => setCTitle(e.target.value)} required className={InputStyle} placeholder="e.g., Next.js Masterclass"/></div><div className="mt-3"><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea value={cDesc} onChange={(e) => setCDesc(e.target.value)} required rows={2} className={InputStyle} placeholder="A comprehensive course..."/></div><div className="mt-3"><label className="block text-sm font-medium text-gray-700 mb-1">Duration (Hours)</label><input type="tel" inputMode="numeric" value={cRawDur} onChange={(e) => setCRawDur(filterNum(e.target.value))} maxLength={3} required className={`${InputStyle} font-mono`} placeholder="e.g., 10"/></div></div>)}
                        <div className="pt-2 border-t border-red-100">
                            <h3 className="text-lg font-bold text-red-700 mb-3 flex items-center"><Video className="w-5 h-5 mr-2"/> {isNewCourse ? "First Lesson Details" : "New Lesson Details"}</h3>
                            <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div><label className="block text-xs font-medium text-gray-700 mb-1">Lesson Title</label><input type="text" value={lTitle} onChange={(e) => setLTitle(e.target.value)} required className={InputStyle} placeholder="e.g., Module 1: Introduction"/></div>
                                <div><label className="block text-xs font-medium text-gray-700 mb-1">Duration (MM:SS)</label><input type="tel" inputMode="numeric" value={lDur} onChange={handleLDurChange} maxLength={5} required className={`${InputStyle} font-mono`} placeholder="00:00"/></div>
                                <div><label className="block text-xs font-medium text-gray-700 mb-1">Description (Optional)</label><textarea value={lDesc} onChange={(e) => setLDesc(e.target.value)} rows={1} className={InputStyle} placeholder="Brief summary..."/></div>
                                <div className="pt-2"><label className="block text-xs font-medium text-gray-700 mb-2">Video File</label><FileDrop onFileSelect={setFile} /></div>
                                <p className={`text-xs mt-2 font-medium ${!isLessonReady ? 'text-red-600' : 'text-gray-500'}`}>{isLessonReady ? 'Video complete.' : '**REQUIRED:** Title, Duration (MM:SS), File.'}</p>
                            </div>
                        </div>
                        <div className="pt-4 flex justify-end space-x-3 border-t border-gray-100">
                            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
                            <button type="submit" className={`px-4 py-2 text-sm text-white rounded-lg transition ${isDisabled ? 'bg-red-400 cursor-not-allowed' : 'bg-red-800 hover:bg-red-700'}`} disabled={isDisabled}>
                                {isNewCourse ? "Create Course & Upload" : "Upload Lesson"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </Modal>
    ); 
};

const VideoPlayer = ({ media, onClose }) => {
    const [isExpanded, setIsExpanded] = useState(false), [isBuffering, setIsBuffering] = useState(false), [isPlaying, setIsPlaying] = useState(false); 
    if (!media) return null;
    const { title, course, instructor, duration, description } = useMemo(() => ({ title: media.title, course: media.courseTitle || media.course, instructor: media.instructorName || media.instructor, duration: media.duration, description: media.description || '' }), [media]);
    const sections = useMemo(() => description ? description.split(/[.\n]+/).map(s => s.trim()).filter(s => s.length > 5) || [description] : [{ defaultSections: ["This video provides an overview...", "A structured layout makes content organized...", "Using proper layouting clearly guides...", "Key is balancing visual weight and clarity."] }.defaultSections].flat(), [description]);
    const [simulatedTime, setTime] = useState(0);
    const totalDurationSeconds = duration?.includes(':') ? (parseInt(duration.split(':')[0] || 0) * 60) + parseInt(duration.split(':')[1] || 0) : 300; 
    
    useEffect(() => {
        let interval;
        if (isPlaying) { interval = setInterval(() => { setTime(prev => { const newT = prev + 1; if (newT > totalDurationSeconds) { clearInterval(interval); setIsPlaying(false); return totalDurationSeconds; } return newT; }); }, 1000);
        } else { clearInterval(interval); } return () => clearInterval(interval);
    }, [isPlaying, totalDurationSeconds]);
    useEffect(() => { setTime(0); setIsPlaying(false); setIsBuffering(false); }, [media]);
    const handlePlayClick = () => {
        if (!isPlaying && !isBuffering) { setIsBuffering(true); setIsPlaying(false); setTimeout(() => { setIsBuffering(false); setIsPlaying(true); }, 2000); 
        } else if (isPlaying) { setIsPlaying(false); } else if (isBuffering) { setIsBuffering(false); }
    };
    const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
    const progressPercent = (simulatedTime / totalDurationSeconds) * 100;

    const vWidth = isExpanded ? 'w-full' : 'w-full lg:w-3/5'; 
    const oClass = isExpanded ? 'hidden' : 'w-full lg:w-2/5 p-4 sm:p-6 border-t lg:border-t-0 lg:border-l border-gray-100 overflow-y-auto flex flex-col bg-gray-50';
    const modalMaxW = isExpanded ? 'max-w-7xl h-[90vh]' : 'max-w-full md:max-w-4xl h-auto';
    const vHeight = isExpanded ? 'h-full' : 'h-[300px] sm:h-[450px] md:h-[550px]';
    
    return (
        <Modal onClose={onClose} maxWidth={modalMaxW}>
            <div className="bg-white rounded-xl shadow-[0_20px_40px_-5px_rgba(0,0,0,0.3)] w-full overflow-hidden flex flex-col transition-all duration-300" style={{ height: isExpanded ? '90vh' : 'auto' }}>
                <div className={`flex flex-col lg:flex-row ${vHeight}`}> 
                    <div className={`${vWidth} bg-gray-900 relative flex flex-col justify-between transition-all duration-300`}>
                        <div className="aspect-video w-full h-full relative flex items-center justify-center">
                            <img src={"image_0b2b19.png"} alt={title} className={`w-full h-full object-cover ${isPlaying ? 'opacity-30' : 'opacity-70'} transition-opacity duration-500`} />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                {isBuffering && (<div className="flex flex-col items-center"><Loader className="w-16 h-16 text-white opacity-90 animate-spin"/><p className="mt-4 text-white font-semibold text-lg">Buffering...</p></div>)}
                                {!isPlaying && !isBuffering && (<button onClick={handlePlayClick} className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-700/80 hover:bg-red-600 flex items-center justify-center transition-all hover:scale-110 shadow-lg"><Play className="w-6 h-6 sm:w-8 sm:h-8 text-white ml-1"/></button>)}
                                {isPlaying && (<div className="absolute inset-0" onClick={handlePlayClick} title="Pause"><div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition"><button className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-black/50 hover:bg-black/80 flex items-center justify-center"><Pause className="w-5 h-5 sm:w-6 sm:h-6 text-white"/></button></div></div>)}
                            </div>
                            {isExpanded ? (<button onClick={() => setIsExpanded(false)} className="absolute top-4 right-4 z-10 w-8 h-8 sm:w-10 sm:h-10 bg-black/70 text-white rounded-full flex items-center justify-center hover:bg-red-700"><Minimize2 className="w-4 h-4 sm:w-5 sm:h-5"/></button>) : (<button onClick={() => setIsExpanded(true)} className="absolute bottom-4 right-4 z-10 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-red-700"><Maximize className="w-4 h-4"/></button>)}
                        </div>
                        {(!isBuffering) && (<div className="w-full bg-black/70 p-3 flex flex-col text-white flex-shrink-0">
                                <div className="h-1 bg-gray-600 rounded-full mb-2 relative group cursor-pointer"><div className="h-1 rounded-full bg-red-600" style={{ width: `${progressPercent}%` }}/><div className="absolute -top-1.5 w-4 h-4 rounded-full bg-red-600 border-2 border-white opacity-0 group-hover:opacity-100" style={{ left: `calc(${progressPercent}% - 8px)` }}/></div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <button onClick={handlePlayClick} title={isPlaying ? "Pause" : "Play"}>{isPlaying ? <Pause className="w-5 h-5"/> : <Play className="w-5 h-5 fill-white"/>}</button>
                                        <div className="flex items-center space-x-1 hidden sm:flex"><Volume2 className="w-5 h-5"/><div className="w-16 h-1 bg-gray-600 rounded-full cursor-pointer"><div className="h-1 rounded-full bg-white w-3/4"/></div></div>
                                        <span className="text-sm font-mono ml-2">{formatTime(simulatedTime)} / {duration || formatTime(totalDurationSeconds)}</span>
                                    </div>
                                    <div className="flex items-center space-x-3"><button title="Settings"><Settings className="w-5 h-5"/></button></div>
                                </div>
                            </div>)}
                    </div>
                    <div className={oClass}>
                        <div className="mb-6 p-4 bg-red-50 rounded-lg shadow-inner flex-shrink-0">
                            <h2 className="text-lg sm:text-xl font-extrabold text-red-800 mb-2 leading-snug">{title}</h2>
                            <div className="space-y-1 text-sm">
                                <p className="text-gray-700 flex items-center font-semibold"><BookOpenText className="w-4 h-4 mr-2 text-red-600"/>Course: <span className="ml-1 font-normal text-gray-600">{course}</span></p>
                                <p className="text-gray-700 flex items-center font-semibold"><User className="w-4 h-4 mr-2 text-red-600"/>Instructor: <span className="ml-1 font-normal text-gray-600">{instructor}</span></p>
                            </div>
                        </div>
                        <div className="flex-grow overflow-y-auto pr-2">
                            <h3 className="text-lg font-bold text-gray-700 mb-3 flex items-center"><FileText className="w-4 h-4 mr-2 text-red-600"/>Overview</h3>
                            <div className="space-y-4 text-gray-600 text-sm">
                                {sections.map((s,i)=>(<div key={i} className="flex items-start"><span className="text-red-600 text-base font-bold mr-2 mt-0.5"><CheckCircle className="w-4 h-4 mt-1 flex-shrink-0" /></span><p className="leading-relaxed font-medium">{s}</p></div>))}
                                {sections.length === 0 && <p className="text-gray-500 italic">No description.</p>}
                            </div>
                        </div>
                        <div className="pt-4 flex-shrink-0 mt-4 border-t border-gray-200"><button onClick={onClose} className="w-full py-2.5 bg-red-800 text-white rounded-lg hover:bg-red-700 flex items-center justify-center"><X className="w-4 h-4 mr-2"/> Close</button></div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

// --- Main Component (SharedCourse) ---
const SharedCourse = () => {
    const [videos, setVideos] = useState(mockVideos);
    const [courses, setCourses] = useState(mockCourses);
    const [currentVideo, setCurrentVideo] = useState(null), [showLessons, setShowLessons] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null), [showAllVideos, setShowAllVideos] = useState(false);
    const [showAllCourses, setShowAllCourses] = useState(false), [uploadContext, setUploadContext] = useState(null);
    const [showAllInstructors, setShowAllInstructors] = useState(false); 
    const [showAllActivity, setShowAllActivity] = useState(false); 
    
    const featuredCourse = mockCourses.find(c => c.id === 4) || mockCourses[0];
    const [activityFilter, setActivityFilter] = useState('All');
    const filteredActivity = useMemo(() => activityFilter === 'Today' ? mockActivity.filter(a => a.time.includes('min ago') || a.time.includes('hr ago')) : mockActivity, [activityFilter]);

    const handleAction = (a) => console.log("Action:", a);
    const playVideo = (v) => { setCurrentVideo(v); setShowLessons(false); setShowAllVideos(false); setShowAllCourses(false); setUploadContext(null); setShowAllInstructors(false); setShowAllActivity(false); handleAction(`Playing: ${v.title}`); };
    const playLesson = (lesson, course) => playVideo({ ...lesson, courseTitle: course.title, instructorName: course.instructor });
    const openLessons = (c) => { setSelectedCourse(c); setShowLessons(true); setCurrentVideo(null); setShowAllVideos(false); setShowAllCourses(false); setUploadContext(null); setShowAllInstructors(false); setShowAllActivity(false); handleAction(`Lessons for: ${c.title}`); };
    const openUpload = (context) => { setUploadContext(context); handleAction(`Opening Upload Modal. Context: ${context.type}`); };
    const createNewLesson = (c, l) => ({ id: l.id, title: l.title, course: c.title, instructor: c.instructor, time: l.duration, type: c.title.split(' ')[0] || "General", progress: 0, description: l.description });
    const openAllInstructors = () => { setShowAllInstructors(true); handleAction("Viewing all instructors."); };
    const openAllActivity = () => { setShowAllActivity(true); handleAction("Viewing all activity log."); };

    const handleUpload = (data) => { 
        if (data.type === 'course') {
            const { title, duration, newLesson } = data;
            const newCourse = { id: Date.now(), title, instructor: "Admin", duration, lessons: newLesson ? 1 : 0, progress: 0, lessonsList: newLesson ? [newLesson] : [] };
            setCourses(prev => [newCourse, ...prev]);
            if (newLesson) setVideos(prev => [createNewLesson(newCourse, newLesson), ...prev]);
        } else if (data.type === 'video') {
            const { courseId, newLesson } = data;
            
            if (!courseId) {
                const uncategorizedCourse = { id: Date.now(), title: "Uncategorized Video", instructor: "Admin", duration: newLesson.duration, lessons: 1, progress: 0, lessonsList: [newLesson] };
                setVideos(prev => [createNewLesson(uncategorizedCourse, newLesson), ...prev]);
                return;
            }

            setCourses(prev => prev.map(c => {
                if (c.id.toString() === courseId.toString()) {
                     const newLessonsList = [...(c.lessonsList || []), newLesson];
                     setVideos(prev => [createNewLesson(c, newLesson), ...prev]);
                     return { ...c, lessonsList: newLessonsList, lessons: newLessonsList.length };
                } return c;
            }));
        }
        setUploadContext(null);
    };

    const isOverlay = !!(currentVideo || showLessons || showAllVideos || showAllCourses || uploadContext || showAllInstructors || showAllActivity);
    
    return (
        <div className="bg-gray-100 min-h-screen">
            {showLessons && <CourseLessonsModal course={selectedCourse} onClose={() => setShowLessons(false)} onPlayLesson={playLesson} />}
            {showAllVideos && <AllVideosModal videos={videos} onClose={() => setShowAllVideos(false)} onPlay={playVideo} />}
            {currentVideo && <VideoPlayer media={currentVideo} onClose={() => setCurrentVideo(null)} />}
            {showAllCourses && <AllCoursesModal courses={courses} onClose={() => setShowAllCourses(false)} onOpenLessons={openLessons} onOpenUpload={(c) => openUpload({ type: 'video', course: c })} />}
            {showAllInstructors && <AllInstructorsModal instructors={mockInstructors} onClose={() => setShowAllInstructors(false)} onCardClick={handleAction} />}
            {showAllActivity && <AllActivityModal activity={mockActivity} onClose={() => setShowAllActivity(false)} onActivityClick={handleAction} />} 
            {uploadContext && (<UploadModal onClose={() => setUploadContext(null)} onUpload={handleUpload} courseToAddTo={uploadContext} />)} 
            
            <div className={`flex flex-col lg:flex-row p-4 md:p-6 space-y-6 lg:space-y-0 lg:space-x-6 ${isOverlay ? 'pointer-events-none blur-sm' : ''}`}>
                
                <div className="flex-grow w-full">
                    <div className="relative p-6 sm:p-8 rounded-3xl overflow-hidden mb-8 shadow-xl" style={{ backgroundImage: "linear-gradient(to right, #f0e4e4ff 0%, #ffffff 50%, #A52A2A 80%, #8B0000 100%)", minHeight: "260px" }}>
                        <div className="relative z-10 max-w-lg pt-4 sm:pt-8">
                            <h2 className="text-3xl sm:text-4xl font-extrabold mb-3 text-gray-900">Instructor Dashboard</h2>
                            <p className="text-sm sm:text-base text-gray-700 mb-6">View your metrics, manage courses, and track performance.</p>
                            <div className="space-x-4"><button onClick={()=>handleAction("View Performance")} className="px-5 py-2 bg-red-800 text-white rounded-lg">Performance</button></div>
                        </div>
                        <div className="absolute right-0 top-0 h-full flex items-end justify-end pr-4 sm:pr-6 pb-2"><img src={CourseBannerImage} alt="Course Banner" className="h-full object-contain opacity-95" /></div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-gray-800">Training Courses</h3>
                        <div className="flex items-center space-x-3">
                            <button onClick={() => openUpload({ type: 'video', course: null })} className="px-3 py-1.5 bg-red-100 text-red-800 rounded-lg text-sm flex items-center"><Upload className="w-4 h-4 mr-1"/>Upload Video</button>
                            <button onClick={()=>setShowAllVideos(true)} className="text-red-800 font-medium text-sm">See More</button>
                        </div>
                    </div>
                    <section className="bg-white p-4 sm:p-6 rounded-3xl shadow-xl mb-8">
                        <ul className="space-y-4">{videos.slice(0,3).map((v,i)=><VideoItem key={v.id} v={v} i={i} onPlay={playVideo}/>)}</ul>
                    </section>

                    <section className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold text-gray-800">Lesson Course</h3>
                            <div className="flex items-center space-x-3">
                                <button onClick={() => openUpload({ type: 'course' })} className="px-3 py-1.5 bg-red-800 text-white rounded-lg text-sm flex items-center font-medium shadow-md hover:bg-red-700 transition"><BookOpenText className="w-4 h-4 mr-1"/> Upload New Course</button>
                                <button onClick={()=>setShowAllCourses(true)} className="text-red-800 font-medium text-sm">View All Courses</button>
                            </div>
                        </div>
                        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {courses.slice(0, 6).map(c => <CourseCard key={c.id} c={c} onViewDetails={openLessons} onOpenUpload={(course) => openUpload({ type: 'video', course })} />)}
                        </section>
                    </section>
                </div>

                <aside className="w-full lg:w-80 flex-shrink-0">
                    <section className="bg-white p-6 rounded-3xl shadow-xl mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold text-gray-800">Team Instructors</h3>
                            <button onClick={openAllInstructors} className="text-red-800 text-sm font-medium">View all</button>
                        </div>
                        <div className="grid grid-cols-3 gap-4"> 
                            {mockInstructors.slice(0, 3).map(ins => <InstructorCard key={ins.id} ins={ins} onClick={handleAction} />)}
                        </div>
                    </section>

                    <section className="bg-white p-4 rounded-3xl shadow-xl mb-6">
                        <div className="p-3 rounded-xl mb-4 bg-red-800 text-white cursor-pointer hover:bg-red-700 transition" onClick={() => openLessons(featuredCourse)}>
                            <p className="text-xs font-medium text-red-100 mb-1">SPOTLIGHT COURSE</p>
                            <h4 className="text-lg font-bold mb-2">{featuredCourse.title}</h4>
                        </div>
                        
                        <div className="mb-2"> 
                            <div className="flex justify-between items-center mb-3 border-t border-gray-100 pt-3"> 
                                <h4 className="text-base font-semibold text-gray-800">Recent Activity</h4>
                                <button onClick={() => setActivityFilter(activityFilter === 'Today' ? 'All' : 'Today')} className={`text-[10px] font-medium px-2 py-0.5 rounded-full transition ${activityFilter === 'Today' ? 'bg-red-800 text-white' : 'text-red-600 bg-red-50 hover:bg-red-100'}`}>
                                    {activityFilter === 'Today' ? 'View All' : 'Today'}
                                </button>
                            </div>
                            
                            <ul className="space-y-3">
                                {filteredActivity.slice(0,3).map(it=>(
                                    <li key={it.id} onClick={() => handleAction(`Activity Click: ${it.details}`)} className="flex items-start space-x-3 border-b border-gray-100 pb-2 last:border-b-0 cursor-pointer hover:bg-gray-50 p-1 -m-1 rounded transition">
                                        <div className="w-6 h-6 rounded-full bg-red-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">{it.type==="New Enrollment"?"E":it.type==="Course Upload"?"U":"A"}</div>
                                        <div className="flex-grow"><p className="text-sm font-medium text-gray-800">{it.details}</p><p className="text-xs text-gray-500">{it.time}</p></div>
                                    </li>
                                ))}
                                {filteredActivity.length === 0 && <li className="text-xs text-gray-500 p-2 italic">No activity matching filter.</li>}
                            </ul>
                        </div>
                        
                        <button onClick={openAllActivity} className="w-full py-2 bg-red-800 text-white rounded-xl hover:bg-red-700 font-medium text-sm mt-2">More Activity</button>
                    </section>
                </aside>
            </div>
        </div>
    );
};

export default SharedCourse;