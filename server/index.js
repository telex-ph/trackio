import "./config/keyManager.js";
import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.js";

const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Listening to PORT ${PORT}`));
  } catch (error) {
    console.error("Failed to start the server: ", error);
  }
};

startServer();
