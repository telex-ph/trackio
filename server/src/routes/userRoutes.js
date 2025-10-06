import express from "express";
import {
  getUsers,
  getUsersByRoleScope,
} from "../controllers/userControllers.js";
const router = express.Router();

router.get("/get-users", getUsers);

router.get("/get-by-role/:id/:role", getUsersByRoleScope);

export default router;
