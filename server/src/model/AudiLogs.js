// src/model/Offense.js
import connectDB from "../config/db.js";
import { ObjectId } from "mongodb";

class AuditLogs {
    static #collection = "audit_logs";
    
    static async create(auditLogData) {
        const db = await connectDB();
        const collection = db.collection(this.#collection);

        const auditLogWithTimestamp = {
            ...auditLogData,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await collection.insertOne(auditLogWithTimestamp);
        return { _id: result.insertedId, ...auditLogWithTimestamp };
    }
}

export default AuditLogs;