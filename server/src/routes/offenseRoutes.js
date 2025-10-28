import express from "express";
import {
  addOffense,
  getOffenses,
  getOffenseById,
  updateOffense,
  deleteOffense,
  getOffensesByAgent,
  getOffensesByCategory,
  getOffensesByStatus,
  getOffensesByReporter,
} from "../controllers/offenseControllers.js";

import { verifyJWT as auth } from "../middlewares/verifyJWT.js";

const router = express.Router();

// Para sa HR/Admin (kinukuha lahat, o para sa AgentOffences page)
router.get("/", auth, getOffenses);

// Para sa Reporter (AgentCreateOffenses page)
router.get("/reporter/:id", auth, getOffensesByReporter);

// Iba pang filter routes
router.get("/agent/:agentName", auth, getOffensesByAgent);
router.get("/category/:category", auth, getOffensesByCategory);
router.get("/status/:status", auth, getOffensesByStatus);

// Para sa pagkuha ng isang offense gamit ang _id
router.get("/:id", auth, getOffenseById);

// Para sa Reporter na nagsu-submit ng report
router.post("/", auth, addOffense);

router.put("/:id", auth, updateOffense);

router.delete("/:id", auth, deleteOffense);

export default router;