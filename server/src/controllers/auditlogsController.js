import { DateTime } from "luxon";
import { ObjectId } from "mongodb";
import AuditLogs from "../model/AudiLogs.js";

export const addLog = async (req, res) => {
  try {
    const auditLogData = req.body;
    const user = req.user;
    const timestamp = auditLogData.timestamp ? DateTime.fromISO(auditLogData.timestamp, { zone: "utc" }).toJSDate()
      : new Date();

    const transformAuditLogEntry = (entry) => {
      if (!entry) return undefined;

      const dateFields = [
        "startDate",
        "endDate",
        "approvedBySupervisorDate",
        "rejectedBySupervisorDate",
        "approvedByHRDate",
        "rejectedByHRDate",
        "createdAt",
        "updatedAt",
        "dateOfMistake",
        "coachingDate",
        "explanationDateTime",
      ];

      const objectIdFields = [
        "_id",
        "isRequestedToId", 
        "createdById", 
        "respondantId", 
        "coachId", 
        "reportedById"
      ];

      const transformed = { ...entry };

      objectIdFields.forEach((field) => {
        if (entry[field]) {
          transformed[field] = new ObjectId(entry[field]);
        }
      });

      dateFields.forEach((field) => {
        if (entry[field]) {
          transformed[field] = DateTime.fromISO(entry[field], { zone: "utc" }).toJSDate();
        }
      });

      return transformed;
    };

    const newAuditLogData = {
      ...auditLogData,
      actorId: new ObjectId(user._id),
      before: transformAuditLogEntry(auditLogData.before),
      after: transformAuditLogEntry(auditLogData.after),
      ...(auditLogData.timestamp && { timestamp: timestamp }),
    };

    const newAuditLog = await AuditLogs.create(newAuditLogData);

    res.status(201).json(newAuditLog);
  } catch (error) {
    console.error("CONTROLLER - Error adding audit log:", error);
    res
      .status(500)
      .json({ message: "Failed to add audit log", error: error.message });
  }
};