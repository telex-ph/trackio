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
        
        const updateDescription = change.updateDescription || {};
        const updatedFields = updateDescription.updatedFields || {};
        
        console.log("📊 Updated fields:", Object.keys(updatedFields));
        
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
            // ANNOUNCEMENT STATUS CHANGED TO ACTIVE
            console.log("🟢 Announcement status changed to Active");
            
            const wasPreviouslyInactive = updatedAnnouncement.cancelledAt || 
                                        updatedAnnouncement.cancelledBy ||
                                        (change.updateDescription && 
                                         change.updateDescription.updatedFields && 
                                         change.updateDescription.updatedFields.cancelledAt === null);
            
            if (wasPreviouslyInactive) {
              // ✅ THIS IS A REPOST (was previously cancelled)
              console.log("✅ Detected as REPOST - emitting announcementReposted only");
              io.emit("announcementReposted", updatedAnnouncement);
            } else {
              // ✅ THIS IS A NEW ACTIVATION (not previously cancelled)
              console.log("✅ Detected as NEW ACTIVATION - emitting newAnnouncement");
              io.emit("newAnnouncement", updatedAnnouncement);
            }
          }
        }
        
        // ✅ DETECT CANCELLATION SPECIFIC FIELDS  
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
          console.log("📄 Content update detected - emitting announcementUpdated");
          io.emit("announcementUpdated", updatedAnnouncement);
          io.emit("updatedAnnouncement", updatedAnnouncement); // Alternative event name
        }
      }

      if (change.operationType === "delete") {
        console.log("🗑️ Deleted announcement:", change.documentKey._id);
        io.emit("announcementDeleted", {
          announcementId: change.documentKey._id.toString()
        });
      }
    });

    // Handle initial data requests and manual events
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

      // ✅ LISTEN FOR MANUAL CANCELLATION EVENT FROM ADMIN
      socket.on("manualAnnouncementCancelled", (data) => {
        console.log("🔴 Manual cancellation from admin:", data.announcementId);
        // Broadcast to ALL agents
        socket.broadcast.emit("announcementCancelled", data);
        console.log("📢 Manual cancellation broadcasted to all agents");
      });

      // ✅ LISTEN FOR MANUAL ANNOUNCEMENT UPDATES FROM ADMIN
      socket.on("announcementUpdated", (data) => {
        console.log("📝 Manual announcement update from admin:", data._id, data.title);
        // Broadcast to ALL agents and other admins
        socket.broadcast.emit("announcementUpdated", data);
        socket.broadcast.emit("updatedAnnouncement", data); // Alternative event
        console.log("📢 Manual update broadcasted to all clients");
      });

      // ✅ LISTEN FOR ALTERNATIVE UPDATE EVENT NAME
      socket.on("updatedAnnouncement", (data) => {
        console.log("📝 Alternative update event from admin:", data._id, data.title);
        socket.broadcast.emit("announcementUpdated", data);
        socket.broadcast.emit("updatedAnnouncement", data);
      });

      socket.on("newAnnouncement", (data) => {
        console.log("🆕 Manual new announcement:", data.title);
        socket.broadcast.emit("newAnnouncement", data);
      });

      // ✅ NEW: LISTEN FOR REFRESH REQUESTS
      socket.on("refreshAnnouncements", () => {
        console.log("🔄 Refresh requested, broadcasting to all clients");
        socket.broadcast.emit("refreshData");
      });

      socket.on("disconnect", () => {
        console.log("👤 User disconnected:", socket.id);
      });
    });

    console.log("✅ Announcement watcher started - Real-time updates enabled for edits");
  } catch (err) {
    console.error("❌ Error in announcementWatcher:", err);
  }
}