// controllers/offenseControllers.js
import { DateTime } from "luxon";
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
    const user = req.user;
    const dateOfOffense = offenseData.dateOfOffense
      ? DateTime.fromISO(offenseData.dateOfOffense, { zone: "utc" }).toJSDate()
      : new Date();
    const dateOfMistake = offenseData.dateOfMistake
      ? DateTime.fromISO(offenseData.dateOfMistake, { zone: "utc" }).toJSDate()
      : new Date();
    const coachingDate = offenseData.coachingDate
      ? DateTime.fromISO(offenseData.coachingDate, { zone: "utc" }).toJSDate()
      : new Date();

    const newOffenseData = {
      ...offenseData,
      respondantId: new ObjectId(offenseData.respondantId),
      reportedById: new ObjectId(user._id),
      ...(offenseData.dateOfOffense && { dateOfOffense: dateOfOffense }),
      ...(offenseData.dateOfMistake && { dateOfMistake: dateOfMistake }),
      ...(offenseData.coachingDate && { coachingDate: coachingDate }),
      coachId: offenseData.coachId
        ? new ObjectId(offenseData.coachId)
        : new ObjectId(user._id),
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

    const payload = { ...req.body };

    ["agentName", "reporterName"].forEach((field) => delete payload[field]);

    [
      "respondantId",
      "coachId",
      "reportedById"
    ].forEach((field) => {
      if (payload[field] && ObjectId.isValid(payload[field])) {
        payload[field] = new ObjectId(payload[field]);
      }
    });

    [
      "createdAt",
      "dateOfMistake",
      "coachingDate",
      "explanationDateTime",
      "ndaSentDateTime",
      "acknowledgedDateTime",
      "dateOfOffense",
      "nteSentDateTime",
      "hearingDate",
      "schedHearingDateTime",
      "afterHearingDateTime",
      "momSentDateTime",
      "ndaSentDateTime"
    ].forEach((field) => {
      if (payload[field]) {
        payload[field] = DateTime.fromISO(payload[field], { zone: "utc" }).toJSDate();
      }
    });

    const updatedOffense = await Offense.update(id, payload);

    if (req.app.get("io")) {
      req.app.get("io").emit("offenseUpdated", updatedOffense);
      console.log("Emitted offenseUpdated event");
    }

    res.status(200).json(updatedOffense);
  } catch (error) {
    console.error("Update error details:", error);
    res.status(500).json({ message: "Failed to update offense", error: error.message });
  }
};

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