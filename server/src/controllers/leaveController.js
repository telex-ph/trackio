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
            ...(leaveData.startDate && { startDate: startDate }),
            ...(leaveData.endDate && { endDate: endDate }),
        };

        const newLeave = await Leave.create(newLeaveData);

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
      return res.status(404).json({ message: "Offense not found" });
    res.status(200).json(leave);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch leave", error: error.message });
  }
};