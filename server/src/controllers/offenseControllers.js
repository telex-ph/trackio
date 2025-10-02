// controllers/offenseControllers.js
import Offense from "../model/Offense.js";
import { ObjectId } from "mongodb";

// Get all
export const getOffenses = async (req, res) => {
  try {
    const offenses = await Offense.getAll();
    res.status(200).json(offenses);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch offenses", error: error.message });
  }
};

// Get by ID
export const getOffenseById = async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid Offense ID" });

  try {
    const offense = await Offense.getById(id);
    if (!offense) return res.status(404).json({ message: "Offense not found" });
    res.status(200).json(offense);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch offense", error: error.message });
  }
};

// Add
export const addOffense = async (req, res) => {
  try {
    const newOffense = await Offense.create(req.body);
    res.status(201).json(newOffense);
  } catch (error) {
    res.status(500).json({ message: "Failed to add offense", error: error.message });
  }
};

export const updateOffense = async (req, res) => {
  const { id } = req.params;
  
  console.log("Received ID on server for update:", id);
  
  if (!ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid Offense ID" });

  try {
    // Add this to check if the record exists before update
    const existingOffense = await Offense.getById(id);
    console.log("Existing offense before update:", existingOffense ? 'Found' : 'Not found');
    
    if (!existingOffense) {
      return res.status(404).json({ message: "Offense not found" });
    }

    const updatedOffense = await Offense.update(id, req.body);
    res.status(200).json(updatedOffense);
  } catch (error) {
    console.error("Update error details:", error); // Add this for more error info
    res.status(500).json({ message: "Failed to update offense", error: error.message });
  }
};

// Delete
export const deleteOffense = async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid Offense ID" });

  try {
    const deletedCount = await Offense.delete(id);
    if (deletedCount === 0) return res.status(404).json({ message: "Offense not found" });
    res.status(200).json({ message: "Offense deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete offense", error: error.message });
  }
};

// Filters
export const getOffensesByAgent = async (req, res) => {
  try {
    const offenses = await Offense.getByAgent(req.params.agentName);
    res.status(200).json(offenses);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch offenses by agent", error: error.message });
  }
};

export const getOffensesByCategory = async (req, res) => {
  try {
    const offenses = await Offense.getByCategory(req.params.category);
    res.status(200).json(offenses);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch offenses by category", error: error.message });
  }
};

export const getOffensesByStatus = async (req, res) => {
  try {
    const offenses = await Offense.getByStatus(req.params.status);
    res.status(200).json(offenses);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch offenses by status", error: error.message });
  }
};