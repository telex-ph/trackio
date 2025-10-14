import express from "express";
import {
  addUser,
  getUser,
  getUsers,
  getUsersByRoleScope,
} from "../controllers/userControllers.js";
const router = express.Router();

router.get("/get-users", getUsers);

router.post("/add-user", addUser);

router.get("/get-user/:id", getUser);

router.get("/get-by-role/:id/:role", getUsersByRoleScope);

export default router;
