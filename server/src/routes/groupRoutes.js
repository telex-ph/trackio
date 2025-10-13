import express from "express";
import {
  getUserGroups,
  addGroup,
  updateGroup,
  getGroupMembers,
} from "../controllers/groupController.js";

const router = express.Router();

router.get("/get-groups/:id", getUserGroups);

router.get("/get-group-members/:id", getGroupMembers);

router.post("/add-group", addGroup);

router.patch("/update-group", updateGroup);

export default router;
