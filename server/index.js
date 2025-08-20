import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// Routes
import authRoutes from "./routes/authRoutes.js";

const app = express();
dotenv.config();

app.use(
  cors({
    origin: ["http://localhost:5173"],
  })
);

app.use("/auth", authRoutes);

const PORT = process.env.PORT;
app.listen(PORT, (err) => {
  if (err) {
    console.log(err);
  }
  console.log(`Listening to PORT ${PORT}`);
});
