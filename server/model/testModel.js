import connectDB from "../config/db.js";


export const getAllComments = async () => {
  const db = await connectDB();

  const collection = db.collection("comments");

  return await collection.find({}).toArray();
};


