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
} from "../controllers/offenseControllers.js";

const router = express.Router();

router.get("/", getOffenses);
router.get("/:id", getOffenseById);
router.get("/agent/:agentName", getOffensesByAgent);
router.get("/category/:category", getOffensesByCategory);
router.get("/status/:status", getOffensesByStatus);

router.post("/", addOffense);
router.put("/:id", updateOffense);
router.delete("/:id", deleteOffense);
export default router;