import { Router } from "express";
import { verifyJWT } from "../middlewares/verifyJWT.js";
import { getAccounts } from "../controllers/accountControllers.js";
const router = Router();

router.get("/get-accounts", verifyJWT, getAccounts);

export default router;
