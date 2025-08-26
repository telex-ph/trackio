import { getAllComments } from "../model/testModel.js";

export const test = async (req, res) => {
  const data = await getAllComments();

  console.log(data);

  return res.status(200).json({ result: "okay" });
};
