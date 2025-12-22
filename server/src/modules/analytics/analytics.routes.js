import express from "express";
import { verifyJWT as auth } from "../../middlewares/verifyJWT.js";
import {
  getAttendanceAll,
  getAttendancePerOrganization,
  getAttendanceUsers,
  getAttendanceListPerUser,
  getTopThreePerOrganization,
} from "./analytics.controller.js";

const router = express.Router();

router.get("/get-attendances-all", auth, getAttendanceAll);
router.get("/get-attendances-per-org", auth, getAttendancePerOrganization);
router.get("/get-attendances-users", auth, getAttendanceUsers);
router.get("/get-attendances-per-user", auth, getAttendanceListPerUser);
router.get("/get-top-three", auth, getTopThreePerOrganization);

export default router;
