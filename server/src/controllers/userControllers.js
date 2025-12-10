import { ObjectId } from "mongodb";
import User from "../model/User.js";

export const getUsers = async (req, res) => {
  const { search, role } = req.query;

  try {
    const users = await User.getAll(search, role);
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users: ", error);
    res.status(500).json({
      message: "Failed to fetch list of users",
      error: error.message,
    });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  let { field, newValue } = req.body;

  try {
    if (!field || newValue === undefined) {
      return res
        .status(400)
        .json({ message: "field and newValue are required" });
    }

    if (typeof newValue === "string" && ObjectId.isValid(newValue)) {
      newValue = new ObjectId(newValue);
    }

    const updatedUser = await User.update(id, field, newValue);

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      message: "Failed to update user",
      error: error.message,
    });
  }
};

export const updateDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body.updates;

    let updatedUser;

    for (const [field, newValue] of Object.entries(updates)) {
      updatedUser = await User.update(id, field, newValue);
    }

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      message: "Failed to update user",
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

export const getUsersByAccount = async (req, res) => {
  const id = req.params.id;

  try {
    const users = await User.getUserAccountsById(id);
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users base on account scope: ", error);
    res.status(500).json({
      message: "Failed to fetch list of users by account scope",
      error: error.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  const id = req.params.id;

  try {
    const users = await User.update(id, "isDeleted", true);
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users base on role scope: ", error);
    res.status(500).json({
      message: "Failed to fetch list of users by role scope",
      error: error.message,
    });
  }
};
