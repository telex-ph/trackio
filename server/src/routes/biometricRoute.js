import express from "express";
import { getEvents } from "../controllers/biometricController.js";
const router = express.Router();

router.post("/events", getEvents);

export default router;
