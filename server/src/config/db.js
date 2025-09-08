import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const client = new MongoClient(process.env.MONGO_URI, {
  ssl: true,
  tls: true,
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let dbInstance = null;

const connectDB = async () => {
  if (!dbInstance) {
    try {
      await client.connect();
      dbInstance = client.db("trackio"); // <-- make sure "trackio" matches Atlas DB name
      console.log("✅ Database connected");
    } catch (error) {
      console.error("❌ Database connection error:", error);
      throw error; // rethrow so app doesn't silently fail
    }
  }
  return dbInstance;
};

export default connectDB;
