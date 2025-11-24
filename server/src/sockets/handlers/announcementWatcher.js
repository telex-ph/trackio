import connectDB from "../../config/db.js";

const COLLECTION = "announcements";

export default async function announcementWatcher(io) {
  try {
    const db = await connectDB();
    const collection = db.collection(COLLECTION);

    const changeStream = collection.watch([
      { $match: { operationType: { $in: ["insert", "update", "replace", "delete"] } } },
    ]);

    changeStream.on("change", async (change) => {
      console.log("🔄 MongoDB Change Detected:", change.operationType);
      
      if (change.operationType === "insert") {
        // Bagong announcement
        console.log("🆕 New announcement:", change.fullDocument?.title);
        io.emit("newAnnouncement", change.fullDocument);
      }

      if (change.operationType === "update" || change.operationType === "replace") {
        const updatedAnnouncement = await collection.findOne({ _id: change.documentKey._id });
        
        console.log("📝 Updated announcement:", updatedAnnouncement?.title);
        
        // ✅ DETECT LIKES/VIEWS CHANGES
        const updateDescription = change.updateDescription || {};
        const updatedFields = updateDescription.updatedFields || {};
        
        console.log("📊 Updated fields:", Object.keys(updatedFields));
        
        // Check if likes (acknowledgements) or views were updated
        if (updatedFields.acknowledgements || updatedFields.views) {
          console.log("❤️👀 Likes/Views update detected!");
          
          // Send to ADMIN with detailed user data
          io.emit("adminAnnouncementUpdate", {
            announcementId: updatedAnnouncement._id.toString(),
            totalLikes: updatedAnnouncement.acknowledgements?.length || 0,
            totalViews: updatedAnnouncement.views?.length || 0,
            likedBy: updatedAnnouncement.acknowledgements || [],
            viewedBy: updatedAnnouncement.views || []
          });

          // Send to AGENTS with basic counts
          io.emit("agentAnnouncementUpdate", {
            announcementId: updatedAnnouncement._id.toString(),
            likes: updatedAnnouncement.acknowledgements?.length || 0,
            views: updatedAnnouncement.views?.length || 0
          });
          
        } else {
          // Other updates (title, content, status, etc.)
          console.log("📄 Content update detected");
          io.emit("announcementUpdated", updatedAnnouncement);
        }
      }

      if (change.operationType === "delete") {
        console.log("🗑️ Deleted announcement:", change.documentKey._id);
        io.emit("announcementDeleted", change.documentKey._id);
      }
    });

    // ✅ DAGDAG: HANDLE MANUAL SOCKET EVENTS FOR CANCELLATION/REPOST
    io.on("connection", async (socket) => {
      console.log("👤 User connected via socket:", socket.id);
      
      const announcements = await collection.find({}).toArray();
      
      socket.on("getAdminData", () => {
        console.log("📥 Sending initial data to admin");
        socket.emit("initialAdminData", announcements);
      });

      socket.on("getAgentData", () => {
        console.log("📥 Sending initial data to agent");
        socket.emit("initialAgentData", announcements);
      });

      // ✅ CRITICAL: LISTEN FOR CANCELLATION EVENT FROM ADMIN
      socket.on("announcementCancelled", (data) => {
        console.log("🗑️ Admin cancelled announcement:", data.announcementId);
        // Broadcast to ALL agents
        socket.broadcast.emit("announcementCancelled", data);
        console.log("📢 Broadcasted cancellation to all agents");
      });

      // ✅ CRITICAL: LISTEN FOR REPOST EVENT FROM ADMIN
      socket.on("announcementReposted", (data) => {
        console.log("🔄 Admin reposted announcement:", data.announcementId);
        // Broadcast to ALL agents
        socket.broadcast.emit("announcementReposted", data);
        console.log("📢 Broadcasted repost to all agents");
      });

      // ✅ OPTIONAL: Listen for manual announcement updates
      socket.on("announcementUpdated", (data) => {
        console.log("📝 Manual announcement update:", data._id);
        socket.broadcast.emit("announcementUpdated", data);
      });

      socket.on("newAnnouncement", (data) => {
        console.log("🆕 Manual new announcement:", data.title);
        socket.broadcast.emit("newAnnouncement", data);
      });
    });

    console.log("✅ Announcement watcher started - Real-time likes/views enabled");
  } catch (err) {
    console.error("❌ Error in announcementWatcher:", err);
  }
}