import CourseCard from "../../components/cards/CourseCard";

const SharedCourse = () => {
  return (
    <div>
      <section className="flex flex-col mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2>Courses</h2>
            <p className="text-light">
              Browse and manage all available courses.
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-3 2xl:grid-cols-5 gap-4 grid-rows-[23rem,auto]"></section>
    </div>
  );
};

export default SharedCourse;
