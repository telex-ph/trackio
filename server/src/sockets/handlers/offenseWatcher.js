import connectDB from "../../config/db.js";

const COLLECTION = "offenses";

export default async function offenseWatcher(io) {
  try {
    const db = await connectDB();
    const collection = db.collection(COLLECTION);

    const changeStream = collection.watch([
      { $match: { operationType: { $in: ["insert", "update", "replace", "delete"] } } },
    ]);

    changeStream.on("change", async (change) => {
      if (change.operationType === "insert") {
        io.emit("offenseCreated", change.fullDocument);
      }

      if (change.operationType === "update" || change.operationType === "replace") {
        const updatedOffense = await collection.findOne({ _id: change.documentKey._id });
        io.emit("offenseUpdated", updatedOffense);
      }

      if (change.operationType === "delete") {
        io.emit("offenseDeleted", change.documentKey._id);
      }
    });

    // Send initial offenses to any new client
    io.on("connection", async (socket) => {
      const offenses = await collection.find({}).toArray();
      socket.emit("initialOffenses", offenses);
    });

    console.log("Offense watcher started");
  } catch (err) {
    console.error("Error in offenseWatcher:", err);
  }
}
