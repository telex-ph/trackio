import Course from "../model/Course.js";

export const addCourse = async (req, res) => {
  const { title, desciption } = req.body;

  if (!title || !desciption)
    return res
      .status(400)
      .json({ message: "Title and description is required" });

  try {
    const result = await Course.add(title, desciption);
    res.status(200).json(result);
  } catch (error) {
    console.error("Add course error:", error.message);
    res.status(400).json({ error: error.message });
  }
};

export const getCourses = async (req, res) => {
  const category = req.query.category;

  console.log(category);

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
    console.error("Fetcing course error:", error.message);
    res.status(400).json({ error: error.message });
  }
};
