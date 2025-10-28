import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const client = new MongoClient(process.env.MONGO_URI, {
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
      dbInstance = client.db(process.env.trackio);
      console.log("Database connected");
    } catch (error) {
      console.error("Database connection error:", error);
      throw error;
    }
  }
  return dbInstance;
};

export default connectDB;
