import connectDB from "../../config/db.js";

const COLLECTION = "recognitions";

export default async function recognitionWatcher(io) {
  try {
    const db = await connectDB();
    const collection = db.collection(COLLECTION);

    // Room system for admins and agents
    const adminRoom = "adminRoom";
    const agentRoom = "agentRoom";

    const changeStream = collection.watch([
      {
        $match: {
          operationType: { $in: ["insert", "update", "replace", "delete"] },
        },
      },
    ]);

    changeStream.on("change", async (change) => {
      console.log("🔄 Recognition Change Detected:", change.operationType);

      let recognition;
      if (change.operationType === "insert") {
        recognition = change.fullDocument;
      } else if (
        change.operationType === "update" ||
        change.operationType === "replace"
      ) {
        recognition = await collection.findOne({ _id: change.documentKey._id });
      } else if (change.operationType === "delete") {
        // For delete operations, emit event with just the ID
        io.to(agentRoom).emit("recognitionDeleted", {
          recognitionId: change.documentKey._id.toString(),
        });

        io.to(adminRoom).emit("adminRecognitionDeleted", {
          recognitionId: change.documentKey._id.toString(),
        });
        return;
      }

      if (!recognition) return;

      console.log(
        "📄 Recognition:",
        recognition?.title,
        "Status:",
        recognition?.status
      );

      // ========== INSERT ==========
      if (change.operationType === "insert") {
        console.log(
          "🆕 New recognition post:",
          recognition.title,
          "Status:",
          recognition.status
        );

        // Handle by STATUS
        switch (recognition.status) {
          case "published":
            // Show to AGENTS immediately
            console.log("📢 Publishing new recognition to agents");
            io.to(agentRoom).emit("newRecognition", recognition);
            break;

          case "scheduled":
            console.log("⏰ Scheduled recognition created");
            // Check if scheduled date is in future
            const scheduleDate = new Date(recognition.scheduleDate);
            const now = new Date();
            if (scheduleDate > now) {
              console.log("⏳ Scheduled for future:", scheduleDate);
              // Only show to admin in scheduled tab
            } else {
              console.log("⚠️ Scheduled date in past, auto-publishing");
              recognition.status = "published";
              await collection.updateOne(
                { _id: recognition._id },
                { $set: { status: "published", publishedAt: new Date() } }
              );
              io.to(agentRoom).emit("newRecognition", recognition);
            }
            break;

          case "draft":
            console.log("📝 Draft recognition created");
            // Only show to admin in drafts tab - NOT to agents
            break;

          case "archived":
            console.log("🗄️ Archived recognition created");
            // Only show to admin in archived tab - NOT to agents
            break;
        }

        // Always send to ADMIN
        io.to(adminRoom).emit("adminNewRecognition", recognition);
      }

      // ========== UPDATE ==========
      if (
        change.operationType === "update" ||
        change.operationType === "replace"
      ) {
        const updateDescription = change.updateDescription || {};
        const updatedFields = updateDescription.updatedFields || {};
        const removedFields = updateDescription.removedFields || [];

        console.log("📊 Updated fields:", Object.keys(updatedFields));
        console.log("🗑️ Removed fields:", removedFields);

        // Track previous status if changed
        const previousStatus = recognition.previousStatus || recognition.status;
        const statusChanged = updatedFields.status !== undefined;

        if (statusChanged) {
          console.log("🔄 STATUS CHANGE detected:", updatedFields.status);

          switch (updatedFields.status) {
            // ===== PUBLISHED =====
            case "published":
              console.log("📢 Recognition published:", recognition.title);

              // Send to AGENTS (now it's published)
              io.to(agentRoom).emit("newRecognition", recognition);

              // Send to ADMIN
              io.to(adminRoom).emit("adminRecognitionUpdated", recognition);
              break;

            // ===== SCHEDULED =====
            case "scheduled":
              console.log("⏰ Recognition scheduled:", recognition.title);

              // Check schedule date
              const scheduleDate = new Date(recognition.scheduleDate);
              const now = new Date();

              if (scheduleDate > now) {
                // Future scheduled - only show to ADMIN
                console.log("⏳ Scheduled for future");

                // Remove from AGENTS if it was published before
                if (previousStatus === "published") {
                  io.to(agentRoom).emit("recognitionArchived", {
                    recognitionId: recognition._id.toString(),
                    reason: "Scheduled for future",
                  });
                }
              } else {
                // Past scheduled - auto-publish
                console.log("⚠️ Scheduled date in past, auto-publishing");
                recognition.status = "published";
                await collection.updateOne(
                  { _id: recognition._id },
                  { $set: { status: "published", publishedAt: new Date() } }
                );
                io.to(agentRoom).emit("newRecognition", recognition);
              }

              io.to(adminRoom).emit("adminRecognitionUpdated", recognition);
              break;

            // ===== ARCHIVED =====
            case "archived":
              console.log("🗄️ Recognition archived:", recognition.title);

              // Remove from AGENTS immediately
              io.to(agentRoom).emit("recognitionArchived", {
                recognitionId: recognition._id.toString(),
                title: recognition.title,
                archivedBy: updatedFields.archivedBy || "Admin",
                archivedAt:
                  updatedFields.archivedAt || new Date().toISOString(),
              });

              // Send to ADMIN
              io.to(adminRoom).emit("adminRecognitionUpdated", recognition);
              break;

            // ===== RESTORED ===== (from archived)
            case "restored":
              console.log(
                "♻️ Recognition restored from archive:",
                recognition.title
              );

              // Send based on new status
              if (recognition.status === "published") {
                io.to(agentRoom).emit("newRecognition", recognition);
              }

              io.to(adminRoom).emit("adminRecognitionUpdated", recognition);
              break;

            // ===== DRAFT =====
            case "draft":
              console.log("📝 Recognition saved as draft:", recognition.title);

              // Remove from AGENTS if it was published
              if (previousStatus === "published") {
                io.to(agentRoom).emit("recognitionArchived", {
                  recognitionId: recognition._id.toString(),
                  reason: "Saved as draft",
                });
              }

              // Only notify admin
              io.to(adminRoom).emit("adminRecognitionUpdated", recognition);
              break;
          }
        }

        // ===== ENGAGEMENT UPDATES =====
        else if (
          updatedFields.likes ||
          updatedFields.comments ||
          updatedFields.views ||
          updatedFields["engagement.likes"] ||
          updatedFields["engagement.comments"]
        ) {
          console.log("❤️💬👀 Engagement update detected!");

          // Send to ADMIN with detailed data
          io.to(adminRoom).emit("adminEngagementUpdate", {
            recognitionId: recognition._id.toString(),
            title: recognition.title,
            totalLikes:
              recognition.engagement?.likes?.length ||
              recognition.likes?.length ||
              0,
            totalComments: recognition.comments?.length || 0,
            totalViews: recognition.views?.length || 0,
          });

          // Send to AGENTS with basic counts (only if published)
          if (recognition.status === "published") {
            io.to(agentRoom).emit("agentEngagementUpdate", {
              recognitionId: recognition._id.toString(),
              title: recognition.title,
              likes:
                recognition.engagement?.likes?.length ||
                recognition.likes?.length ||
                0,
              comments: recognition.comments?.length || 0,
              views: recognition.views?.length || 0,
            });
          }
        }

        // ===== CONTENT UPDATES =====
        else if (
          updatedFields.title ||
          updatedFields.description ||
          updatedFields.images ||
          updatedFields.tags ||
          updatedFields.recognitionType ||
          updatedFields.employeeId ||
          updatedFields.employeeName ||
          updatedFields.department
        ) {
          console.log("📄 Content update detected");

          // Send to ADMIN with full details
          io.to(adminRoom).emit("adminRecognitionUpdated", recognition);

          // Send to AGENTS only if published
          if (recognition.status === "published") {
            io.to(agentRoom).emit("recognitionUpdated", recognition);
          }
        }

        // ===== SCHEDULE DATE UPDATES =====
        else if (updatedFields.scheduleDate) {
          console.log("⏰ Schedule date updated");

          const scheduleDate = new Date(recognition.scheduleDate);
          const now = new Date();

          if (scheduleDate <= now && recognition.status === "scheduled") {
            // Schedule date passed - auto-publish
            console.log("⏰ Schedule date passed, auto-publishing");
            recognition.status = "published";
            await collection.updateOne(
              { _id: recognition._id },
              { $set: { status: "published", publishedAt: new Date() } }
            );
            io.to(agentRoom).emit("newRecognition", recognition);
          }

          io.to(adminRoom).emit("adminRecognitionUpdated", recognition);
        }

        // ===== OTHER UPDATES =====
        else {
          console.log("📝 General update detected");
          io.to(adminRoom).emit("adminRecognitionUpdated", recognition);

          // If published, also update agents
          if (recognition.status === "published") {
            io.to(agentRoom).emit("recognitionUpdated", recognition);
          }
        }
      }
    });

    // Handle socket connections and manual events
    io.on("connection", async (socket) => {
      // Join appropriate room based on user role
      socket.on("joinAdminRoom", () => {
        socket.join(adminRoom);
      });

      socket.on("joinAgentRoom", () => {
        socket.join(agentRoom);
      });

      // Get initial data with optimized query
      const getRecognitions = async () => {
        return await collection.find({}).sort({ createdAt: -1 }).toArray();
      };

      socket.on("getAdminRecognitionData", async () => {
        console.log("📥 Sending initial recognition data to admin");
        try {
          const recognitions = await getRecognitions();
          socket.emit("initialAdminRecognitionData", recognitions);
        } catch (error) {
          console.error("Error fetching admin recognition data:", error);
          socket.emit("socketError", { message: "Failed to fetch data" });
        }
      });

      socket.on("getAgentRecognitionData", async () => {
        console.log("📥 Sending initial recognition data to agent");
        try {
          const publishedRecognitions = await collection
            .find({
              status: "published",
            })
            .sort({ createdAt: -1 })
            .toArray();
          socket.emit("initialAgentRecognitionData", publishedRecognitions);
        } catch (error) {
          console.error("Error fetching agent recognition data:", error);
          socket.emit("socketError", { message: "Failed to fetch data" });
        }
      });

      // ========== MANUAL EVENTS FROM ADMIN ==========
      socket.on("manualRecognitionPublished", (recognition) => {
        console.log(
          "📢 Manual recognition publish from admin:",
          recognition._id,
          recognition.title
        );

        if (recognition.status === "published") {
          socket.to(agentRoom).emit("newRecognition", recognition);
        }
        socket.to(adminRoom).emit("adminNewRecognition", recognition);
      });

      socket.on("manualRecognitionUpdated", (recognition) => {
        console.log(
          "📝 Manual recognition update from admin:",
          recognition._id,
          recognition.title
        );

        if (recognition.status === "published") {
          socket.to(agentRoom).emit("recognitionUpdated", recognition);
        }
        socket.to(adminRoom).emit("adminRecognitionUpdated", recognition);
      });

      socket.on("manualRecognitionArchived", (data) => {
        console.log("🗄️ Manual archive from admin:", data.recognitionId);

        socket.to(agentRoom).emit("recognitionArchived", data);
        socket.to(adminRoom).emit("adminRecognitionArchived", data);
      });

      socket.on("manualRecognitionRestored", (data) => {
        console.log("♻️ Manual restore from admin:", data.recognitionId);

        if (data.post?.status === "published") {
          socket.to(agentRoom).emit("newRecognition", data.post);
        }
        socket.to(adminRoom).emit("adminRecognitionRestored", data);
      });

      // ========== ENGAGEMENT UPDATES ==========
      socket.on("manualLikeUpdate", (data) => {
        console.log("❤️ Manual like update:", data.recognitionId);
        socket.to(agentRoom).emit("agentEngagementUpdate", data);
        socket.to(adminRoom).emit("adminEngagementUpdate", data);
      });

      socket.on("manualCommentUpdate", (data) => {
        console.log("💬 Manual comment update:", data.recognitionId);
        socket.to(agentRoom).emit("agentEngagementUpdate", data);
        socket.to(adminRoom).emit("adminEngagementUpdate", data);
      });

      socket.on("manualViewUpdate", (data) => {
        console.log("👀 Manual view update:", data.recognitionId);
        socket.to(agentRoom).emit("agentEngagementUpdate", data);
        socket.to(adminRoom).emit("adminEngagementUpdate", data);
      });

      // ========== REFRESH REQUESTS ==========
      socket.on("refreshRecognitions", () => {
        console.log("🔄 Refresh recognitions requested");
        socket.broadcast.emit("refreshRecognitionData");
      });

      socket.on("disconnect", () => {
        console.log("👤 User disconnected from recognition socket:", socket.id);
      });
    });

    console.log("✅ Recognition watcher started - Real-time updates enabled");

    // ========== AUTO-PUBLISH SCHEDULED POSTS ==========
    const checkScheduledPosts = async () => {
      try {
        const now = new Date();
        console.log("⏰ Checking scheduled posts at:", now.toLocaleString());

        const scheduledPosts = await collection
          .find({
            status: "scheduled",
            scheduleDate: { $lte: now },
          })
          .toArray();

        console.log(
          `📅 Found ${scheduledPosts.length} scheduled posts to publish`
        );

        for (const post of scheduledPosts) {
          console.log(`📅 Auto-publishing scheduled post: ${post.title}`);

          // Update status to published
          const updateResult = await collection.updateOne(
            { _id: post._id },
            {
              $set: {
                status: "published",
                publishedAt: now,
                previousStatus: "scheduled",
              },
            }
          );

          if (updateResult.modifiedCount > 0) {
            // Get updated post
            const updatedPost = await collection.findOne({ _id: post._id });

            if (updatedPost) {
              console.log(`✅ Published scheduled post: ${updatedPost.title}`);

              // Send to AGENTS
              io.to(agentRoom).emit("newRecognition", updatedPost);

              // Send to ADMINS
              io.to(adminRoom).emit("adminRecognitionUpdated", updatedPost);
            }
          }
        }
      } catch (error) {
        console.error("❌ Error checking scheduled posts:", error);
      }
    };

    // Initial check on startup
    checkScheduledPosts();

    // Clean up interval on process exit
    process.on("SIGTERM", () => {
      clearInterval(scheduleCheckInterval);
    });
  } catch (err) {
    console.error("❌ Error in recognitionWatcher:", err);
  }
}
