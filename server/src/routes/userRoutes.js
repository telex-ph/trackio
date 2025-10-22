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
const router = express.Router();

router.get("/get-users", getUsers);

router.post("/add-user", addUser);

router.patch("/delete-user/:id", deleteUser);

router.patch("/update-user/:id", updateUser);

router.patch("/update-details/:id", updateDetails);

router.get("/get-user/:id", getUser);

router.get("/get-by-role/:id/:role", getUsersByRoleScope);

export default router;
