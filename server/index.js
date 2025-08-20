import express from "express";
import dotenv from "dotenv";
import cors from "cors";

const app = express();
dotenv.config();

app.use(cors({ origin: ["http://localhost:5173"] }));

app.get("/test", (req, res) => {
  res.status(200).json({ message: "gumagana" });
});

const PORT = process.env.PORT;
app.listen(PORT, (err) => {
  if (err) {
    console.log(err);
  }
  console.log(`Listening to PORT ${PORT}`);
});
