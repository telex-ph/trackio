// src/routes/requestRoutes.js
import express from "express";
const router = express.Router();

import {
  addRequest,
  getRequests,
  getRequestById,
  updateRequest,
  deleteRequest,
  getRequestsByAgent,
  getRequestsBySupervisor,
  getRequestsByStatus,
  getRequestsByType,
  approveRequest,  
  rejectRequest,
} from "./request.controller.js";

// GET all
router.get("/", getRequests);

// GET by ID
router.get("/:id", getRequestById);

// GET by agent
router.get("/agent/:agentName", getRequestsByAgent);

// GET by supervisor
router.get("/supervisor/:supervisor", getRequestsBySupervisor);

// GET by status
router.get("/status/:status", getRequestsByStatus);

// GET by type
router.get("/type/:type", getRequestsByType);

// POST new
router.post("/", addRequest);

// UPDATE existing
router.put("/:id", updateRequest);

// DELETE
router.delete("/:id", deleteRequest);

router.patch("/:id/approve", approveRequest);

router.patch("/:id/reject", rejectRequest);


export default router;
