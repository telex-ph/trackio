import User from "../model/User.js";

export const getUsers = async (req, res) => {
  try {
    const users = await User.getAll();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users: ", error);
    res.status(500).json({
      message: "Failed to fetch list of users",
      error: error.message,
    });
  }
};
