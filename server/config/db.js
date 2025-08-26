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
    await client.connect();
    dbInstance = client.db("sample_mflix");
    console.log("Database connected");
  }
  return dbInstance;
};

export default connectDB;
