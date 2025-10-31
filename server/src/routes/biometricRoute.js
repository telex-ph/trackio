import express from "express";
const router = express.Router();

router.post("/events", getEvents);

export default router;
