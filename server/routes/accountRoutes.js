import { Router } from "express";
import { verifyJWT } from "../middlewares/verifyJWT.js";
import { handleExpiredToken } from "../middlewares/handleExpiredToken.js";
import { getAccounts } from "../controllers/accountControllers.js";
const router = Router();

router.get("/get-accounts", verifyJWT, handleExpiredToken, getAccounts);

export default router;
