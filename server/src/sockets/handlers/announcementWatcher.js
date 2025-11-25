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
        
        // ✅ DETECT STATUS CHANGES (CANCELLATION/REPOST)
        const updateDescription = change.updateDescription || {};
        const updatedFields = updateDescription.updatedFields || {};
        
        console.log("📊 Updated fields:", Object.keys(updatedFields));
        
        // Check if STATUS was changed (cancellation or repost)
        if (updatedFields.status !== undefined) {
          console.log("🔄 Status change detected:", updatedFields.status);
          
          if (updatedFields.status === "Inactive") {
            // ANNOUNCEMENT CANCELLED
            console.log("🔴 Announcement cancelled via socket");
            io.emit("announcementCancelled", {
              announcementId: updatedAnnouncement._id.toString(),
              cancelledBy: updatedFields.cancelledBy || "Admin",
              cancelledAt: updatedFields.cancelledAt || new Date().toISOString(),
            });
          } else if (updatedFields.status === "Active") {
            // ANNOUNCEMENT REPOSTED
            console.log("🟢 Announcement reposted via socket");
            
            // ✅ FIXED: Send the FULL announcement data, not just ID
            io.emit("announcementReposted", updatedAnnouncement);
            
            // Also send as new announcement for agents
            io.emit("newAnnouncement", updatedAnnouncement);
          }
        }
        
        // ✅ NEW: DETECT REPOST SPECIFIC FIELDS
        else if (updatedFields.repostedAt !== undefined || updatedFields.repostedBy !== undefined) {
          console.log("🟢 Repost detected via repost fields");
          io.emit("announcementReposted", updatedAnnouncement);
          io.emit("newAnnouncement", updatedAnnouncement);
        }
        
        // ✅ NEW: DETECT CANCELLATION SPECIFIC FIELDS  
        else if (updatedFields.cancelledAt !== undefined || updatedFields.cancelledBy !== undefined) {
          console.log("🔴 Cancellation detected via cancel fields");
          io.emit("announcementCancelled", {
            announcementId: updatedAnnouncement._id.toString(),
            cancelledBy: updatedFields.cancelledBy || "Admin",
            cancelledAt: updatedFields.cancelledAt || new Date().toISOString(),
          });
        }
        
        // Check if likes (acknowledgements) or views were updated
        else if (updatedFields.acknowledgements || updatedFields.views) {
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
          // Other updates (title, content, etc.)
          console.log("📄 Content update detected");
          io.emit("announcementUpdated", updatedAnnouncement);
        }
      }

      if (change.operationType === "delete") {
        console.log("🗑️ Deleted announcement:", change.documentKey._id);
        io.emit("announcementDeleted", {
          announcementId: change.documentKey._id.toString()
        });
      }
    });

    // Handle initial data requests
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

      // ✅ IMPROVED: LISTEN FOR MANUAL CANCELLATION EVENT FROM ADMIN
      socket.on("manualAnnouncementCancelled", (data) => {
        console.log("🔴 Manual cancellation from admin:", data.announcementId);
        // Broadcast to ALL agents
        socket.broadcast.emit("announcementCancelled", data);
        console.log("📢 Manual cancellation broadcasted to all agents");
      });

      // ✅ IMPROVED: LISTEN FOR MANUAL REPOST EVENT FROM ADMIN
      socket.on("manualAnnouncementReposted", (data) => {
        console.log("🟢 Manual repost from admin:", data.announcementId);
        // Broadcast to ALL agents
        socket.broadcast.emit("announcementReposted", data);
        console.log("📢 Manual repost broadcasted to all agents");
      });

      // Listen for manual announcement updates
      socket.on("announcementUpdated", (data) => {
        console.log("📝 Manual announcement update:", data._id);
        socket.broadcast.emit("announcementUpdated", data);
      });

      socket.on("newAnnouncement", (data) => {
        console.log("🆕 Manual new announcement:", data.title);
        socket.broadcast.emit("newAnnouncement", data);
      });

      socket.on("disconnect", () => {
        console.log("👤 User disconnected:", socket.id);
      });
    });

    console.log("✅ Announcement watcher started - Real-time cancellation/repost enabled");
  } catch (err) {
    console.error("❌ Error in announcementWatcher:", err);
  }
}