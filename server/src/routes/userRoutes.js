import express from "express";
import {
  addUser,
  deleteUser,
  getUser,
  getUsers,
  getUsersByRoleScope,
  updateDetails,
  updateUser,
} from "../controllers/userControllers.js";

import User from "../model/User.js"; 

const router = express.Router();

router.get("/get-users", getUsers);

router.get("/users", async (req, res) => {
  try {
    const searchQuery = req.query.search || "";

    const users = await User.getAll(searchQuery, null); 

    res.json(users);
  } catch (error) { 
    console.error("Error fetching users for search:", error);
    res.status(500).send("Server error");
  }
});
// =========================================

router.post("/add-user", addUser);

router.patch("/delete-user/:id", deleteUser);

router.patch("/update-user/:id", updateUser);

router.patch("/update-details/:id", updateDetails);

router.get("/get-user/:id", getUser);

router.get("/get-by-role/:id/:role", getUsersByRoleScope);

export default router;