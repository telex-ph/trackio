import { DateTime } from "luxon";
import { ObjectId } from "mongodb";
import Leave from "../model/Leave.js";

export const addLeave = async (req, res) => {
  try {
    const leaveData = req.body;
    const user = req.user;
    const startDate = leaveData.startDate ? DateTime.fromISO(leaveData.startDate, { zone: "utc" }).toJSDate()
      : new Date();
    const endDate = leaveData.endDate ? DateTime.fromISO(leaveData.endDate, { zone: "utc" }).toJSDate()
      : new Date();

    const newLeaveData = {
      ...leaveData,
      createdById: new ObjectId(user._id),
      ...(leaveData.isRequestedToId && { isRequestedToId: new ObjectId(leaveData.isRequestedToId) }),
      ...(leaveData.startDate && { startDate: startDate }),
      ...(leaveData.endDate && { endDate: endDate }),
    };

    const newLeave = await Leave.create(newLeaveData);

    if (req.app.get("io")) {
      req.app.get("io").emit("leaveAdded", newLeave);
    }

    res.status(201).json(newLeave);
  } catch (error) {
    console.error("CONTROLLER - Error adding leave:", error);
    res
      .status(500)
      .json({ message: "Failed to add leave", error: error.message });
  }
};

export const getLeaves = async (req, res) => {
  try {
    const leaves = await Leave.getAll();
    res.status(200).json(leaves);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch leaves", error: error.message });
  }
};

export const getLeaveById = async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id))
    return res.status(400).json({ message: "Invalid Leave ID" });

  try {
    const leave = await Leave.getById(id);
    if (!leave)
      return res.status(404).json({ message: "Leave not found" });
    res.status(200).json(leave);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch leave", error: error.message });
  }
};

export const updateLeave = async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id))
    return res.status(400).json({ message: "Invalid Leave ID" });

  try {
    const existingLeave = await Leave.getById(id);
    if (!existingLeave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    const payload = { ...req.body };

    [
      "isRequestedToId",
      "createdById",
    ].forEach((field) => {
      if (payload[field] && ObjectId.isValid(payload[field])) {
        payload[field] = new ObjectId(payload[field]);
      }
    });

    [
      "createdAt",
      "updatedAt",
      "startDate",
      "endDate",
      "approvedBySupervisorDate",
      "rejectedBySupervisorDate",
      "rejectedByHRDate",
      "approvedByHRDate"
    ].forEach((field) => {
      if (payload[field]) {
        payload[field] = DateTime.fromISO(payload[field], { zone: "utc" }).toJSDate();
      }
    });

    const updatedLeave = await Leave.update(id, payload);

    if (req.app.get("io")) {
      req.app.get("io").emit("leaveUpdated", updatedLeave);
    }

    res.status(200).json(updatedLeave);
  } catch (error) {
    console.error("Update error details:", error);
    res.status(500).json({ message: "Failed to update leave", error: error.message });
  }
};

export const deleteLeave = async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id))
    return res.status(400).json({ message: "Invalid Leave ID" });

  try {
    const deletedCount = await Leave.delete(id);
    if (deletedCount === 0)
      return res.status(404).json({ message: "Leave not found" });

    if (req.app.get("io")) {
      req.app.get("io").emit("leaveDeleted", id);
    }

    res.status(200).json({ message: "Leave deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete Leave", error: error.message });
  }
};