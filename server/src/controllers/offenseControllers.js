// controllers/offenseControllers.js
import Offense from "../model/Offense.js";
import { ObjectId } from "mongodb";

// Get all
export const getOffenses = async (req, res) => {
  try {
    const offenses = await Offense.getAll();
    res.status(200).json(offenses);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch offenses", error: error.message });
  }
};

// Get by ID
export const getOffenseById = async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id))
    return res.status(400).json({ message: "Invalid Offense ID" });

  try {
    const offense = await Offense.getById(id);
    if (!offense)
      return res.status(404).json({ message: "Offense not found" });
    res.status(200).json(offense);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch offense", error: error.message });
  }
};

export const addOffense = async (req, res) => {
  try {
    const offenseData = req.body;
    const user = req.user; // Galing sa auth middleware

    console.log("Backend req.user:", user);

    const newOffenseData = {
      ...offenseData,

      reportedById: new ObjectId(user._id),

      reporterName: `${user.firstName} ${user.lastName}`,
      status: "Pending Review",
      isReadByHR: false,
    };

    const newOffense = await Offense.create(newOffenseData);

    if (req.app.get("io")) {
      req.app.get("io").emit("offenseAdded", newOffense);
      console.log("Emitted offenseAdded event");
    }

    res.status(201).json(newOffense);
  } catch (error) {
    console.error("CONTROLLER - Error adding offense:", error);
    res
      .status(500)
      .json({ message: "Failed to add offense", error: error.message });
  }
};

export const updateOffense = async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id))
    return res.status(400).json({ message: "Invalid Offense ID" });

  try {
    const existingOffense = await Offense.getById(id);
    if (!existingOffense) {
      return res.status(404).json({ message: "Offense not found" });
    }

    const updatedOffense = await Offense.update(id, req.body);

    // --- EMIT SOCKET EVENT ---
    if (req.app.get("io")) {
      const io = req.app.get("io");
      io.emit("offenseUpdated", updatedOffense);
      console.log("Emitted offenseUpdated event");
    } else {
      console.log("Socket IO not attached to app — cannot emit event.");
    }

    res.status(200).json(updatedOffense);
  } catch (error) {
    console.error("Update error details:", error);
    res
      .status(500)
      .json({ message: "Failed to update offense", error: error.message });
  }
};


// Delete
export const deleteOffense = async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id))
    return res.status(400).json({ message: "Invalid Offense ID" });

  try {
    const deletedCount = await Offense.delete(id);
    if (deletedCount === 0)
      return res.status(404).json({ message: "Offense not found" });

    if (req.app.get("io")) {
      req.app.get("io").emit("offenseDeleted", id);
      console.log("Emitted offenseDeleted event");
    }

    res.status(200).json({ message: "Offense deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete offense", error: error.message });
  }
};

// Filters
export const getOffensesByAgent = async (req, res) => {
  try {
    const offenses = await Offense.getByAgent(req.params.agentName);
    res.status(200).json(offenses);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch offenses by agent",
      error: error.message,
    });
  }
};

export const getOffensesByCategory = async (req, res) => {
  try {
    const offenses = await Offense.getByCategory(req.params.category);
    res.status(200).json(offenses);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch offenses by category",
      error: error.message,
    });
  }
};

export const getOffensesByStatus = async (req, res) => {
  try {
    const offenses = await Offense.getByStatus(req.params.status);
    res.status(200).json(offenses);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch offenses by status",
      error: error.message,
    });
  }
};

// Get by Reporter ID (Para sa AgentCreateOffenses)
export const getOffensesByReporter = async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id))
    return res.status(400).json({ message: "Invalid Reporter ID" });

  try {
    const offenses = await Offense.getByReporterId(id);
    res.status(200).json(offenses);
  } catch (error) {
    // Iwan ang error log para sa production debugging
    console.error("CONTROLLER - Error fetching offenses by reporter:", error);
    res.status(500).json({
      message: "Failed to fetch offenses by reporter",
      error: error.message,
    });
  }
};