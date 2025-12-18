import connectDB from "../../config/db.js";

const COLLECTION = "announcements";

export default async function announcementWatcher(io) {
  try {
    const db = await connectDB();
    const collection = db.collection(COLLECTION);

    const changeStream = collection.watch([
      {
        $match: {
          operationType: { $in: ["insert", "update", "replace", "delete"] },
        },
      },
    ]);

    changeStream.on("change", async (change) => {
      console.log("🔄 MongoDB Change Detected:", change.operationType);

      if (change.operationType === "insert") {
        console.log("🆕 New announcement:", change.fullDocument?.title);
        io.emit("newAnnouncement", change.fullDocument);
      }

      if (
        change.operationType === "update" ||
        change.operationType === "replace"
      ) {
        // Kumuha ng buong updated document
        const updatedAnnouncement = await collection.findOne({
          _id: change.documentKey._id,
        });

        console.log(
          "📝 Updated announcement (via DB Watcher):",
          updatedAnnouncement?.title
        );

        io.emit("announcementUpdated", updatedAnnouncement);

        const updateDescription = change.updateDescription || {};
        const updatedFields = updateDescription.updatedFields || {};

        if (updatedFields.approvalStatus === "Approved") {
          console.log("📢 Approval detected, emitting announcementApproved");
          io.emit("announcementApproved", updatedAnnouncement);
        }
        if (updatedFields.approvalStatus === "Cancelled") {
          console.log("📢 Cancellation detected, emitting approvalCancelled");
          io.emit("approvalCancelled", updatedAnnouncement);
        }
      }

      if (change.operationType === "delete") {
        console.log("🗑️ Announcement deleted:", change.documentKey._id);
        io.emit("announcementDeleted", { _id: change.documentKey._id });
      }
    });

    io.on("connection", (socket) => {
      socket.on("announcementUpdated", (data) => {
        socket.broadcast.emit("announcementUpdated", data);
        socket.broadcast.emit("updatedAnnouncement", data);
      });

      socket.on("disconnect", () => {
        console.log("👤 User disconnected:", socket.id);
      });
    });

    console.log("✅ Announcement watcher started - Real-time updates enabled.");
  } catch (err) {
    console.error("❌ Fatal Error in Announcement Watcher:", err);
    // 💡 Recommendation: Mag-reconnect logic dito
  }
}
