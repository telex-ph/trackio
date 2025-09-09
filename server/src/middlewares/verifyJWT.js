import * as jose from "jose";
import fs from "fs/promises";

export const verifyJWT = async (req, res, next) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    return res.status(401).json({ message: "No access token found" });
  }

  try {
    // Reading public PEM keys
    const publicKey = process.env.PUBLIC_KEY;

    const { payload } = await jose.jwtVerify(token, publicKey);
    req.user = payload;
    next();
  } catch (error) {
    if (error.code === "ERR_JWT_EXPIRED") {
      req.user = null;
      req.tokenExpired = true;
      return next();
    }
    console.error("JWT verification error:", error);
    return res.status(403).json({ message: "Invalid access token" });
  }
};
