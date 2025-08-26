import connectDB from "../config/db.js";

const Account = {
  getAccounts: async () => {
    const db = await connectDB();
    const collection = db.collection("accounts");
    return await collection.find({}).toArray();
  },
};

export default Account;
