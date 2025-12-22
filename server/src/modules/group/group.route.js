import express from "express";
import {
  getUserGroups,
  addGroup,
  updateGroup,
  getGroup,
  addMember,
  removeMember,
} from "./group.controller.js";

const router = express.Router();

router.get("/get-groups/:id", getUserGroups);

router.patch("/add-member/:id", addMember);

router.patch("/remove-member/:id", removeMember);

router.get("/get-group/:id", getGroup);

router.post("/add-group", addGroup);

router.patch("/update-group", updateGroup);

export default router;
