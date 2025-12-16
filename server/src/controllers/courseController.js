import Course from "../model/Course.js";

export const addCourse = async (req, res) => {
  const newCourse = req.body;

  if (!newCourse)
    return res.status(400).json({ message: "New course is required" });

  try {
    const result = await Course.add(newCourse);
    res.status(200).json(result);
  } catch (error) {
    console.error("Add course error:", error.message);
    res.status(400).json({ error: error.message });
  }
};

export const getCourses = async (req, res) => {
  const category = req.query.category;

  try {
    const result = await Course.getAll(category);
    res.status(200).json(result);
  } catch (error) {
    console.error("Fetching courses error:", error.message);
    res.status(400).json({ error: error.message });
  }
};

export const getCourse = async (req, res) => {
  const { id } = req.params;

  if (!id) return res.status(400).json({ message: "Course ID is required" });

  try {
    const result = await Course.get(id);
    res.status(200).json(result);
  } catch (error) {
    console.error("Fetching course error:", error.message);
    res.status(400).json({ error: error.message });
  }
};

export const updateCourse = async (req, res) => {
  const { id } = req.params;
  const newCourse = req.body;

  if (!newCourse)
    return res.status(400).json({ message: "New course is required" });

  try {
    const result = await Course.update(id, newCourse);
    res.status(200).json(result);
  } catch (error) {
    console.error("Updating course error:", error.message);
    res.status(400).json({ error: error.message });
  }
};

export const addCourseLesson = async (req, res) => {
  const newLesson = req.body;
  const id = req.params.id;

  if (!id || !newLesson)
    return res.status(400).json({ message: "New lesson is required" });

  try {
    const result = await Course.findByIdAndAddLesson(id, newLesson);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error adding error:", error.message);
    res.status(400).json({ error: error.message });
  }
};
