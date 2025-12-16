import React from "react";
import CourseBannerImage from "../../assets/background/course-image.png";

const CourseHeaderPage = () => {
  return (
    <div
      className="relative p-6 sm:p-8 rounded-3xl overflow-hidden mb-8 shadow-xl"
      style={{
        backgroundImage:
          "linear-gradient(to right, #f0e4e4ff 0%, #ffffff 50%, #A52A2A 80%, #8B0000 100%)",
        minHeight: "260px",
      }}
    >
      <div className="relative z-10 max-w-lg pt-4 sm:pt-8">
        <h2 className="text-3xl sm:text-4xl font-extrabold mb-3 text-gray-900">
          Instructor Dashboard
        </h2>
        <p className="text-sm sm:text-base text-gray-700 mb-6">
          View your metrics, manage courses, and track performance.
        </p>
        <div className="space-x-4">
          <button
            onClick={() => handleAction("View Performance")}
            className="px-5 py-2 bg-red-800 text-white rounded-lg"
          >
            Performance
          </button>
        </div>
      </div>
      <div className="absolute right-0 top-0 h-full flex items-end justify-end pr-4 sm:pr-6 pb-2">
        <img
          src={CourseBannerImage}
          alt="Course Banner"
          className="h-full object-contain opacity-95"
        />
      </div>
    </div>
  );
};

export default CourseHeaderPage;
