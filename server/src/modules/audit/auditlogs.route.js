import express from "express";
import { verifyJWT as auth } from "../../middlewares/verifyJWT.js";
import { addLog } from "./auditlogs.controller.js";

const router = express.Router();

router.post("/", auth, addLog);

export default router;
