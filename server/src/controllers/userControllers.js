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

export const addUser = async (req, res) => {
  try {
    const userData = req.body;
    const newUser = await User.addUser(userData);
    res.status(201).json(newUser);
  } catch (error) {
    console.error("Error adding user:", error);
    res.status(500).json({
      message: "Failed to add user",
      error: error.message,
    });
  }
};

export const getUser = async (req, res) => {
  const id = req.params.id;
  try {
    const users = await User.getById(id);
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching user: ", error);
    res.status(500).json({
      message: "Failed to fetch the user",
      error: error.message,
    });
  }
};

export const getUsersByRoleScope = async (req, res) => {
  const id = req.params.id;
  const role = req.params.role;

  try {
    const users = await User.getUsersByRoleScope(id, role);
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users base on role scope: ", error);
    res.status(500).json({
      message: "Failed to fetch list of users by role scope",
      error: error.message,
    });
  }
};
