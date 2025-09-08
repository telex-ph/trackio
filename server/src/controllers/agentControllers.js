import Account from "../model/accountModel.js";

export const login = async (req, res) => {
  const accounts = await Account.getAccounts();
  res.status(200).json(accounts);
};
