import { Router } from "express";
import { verifyJWT } from "../../middlewares/verifyJWT.js";
import { getAccounts } from "../account/account.controller.js";
const router = Router();

router.get("/get-accounts", verifyJWT, getAccounts);

export default router;
