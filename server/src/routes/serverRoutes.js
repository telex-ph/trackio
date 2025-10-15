import express from "express";
const router = express.Router();

router.get("/server-time", (req, res) => {
  res.json({ now: new Date().toISOString() });
});

export default router;
