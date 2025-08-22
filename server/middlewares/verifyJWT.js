import * as jose from "jose";

export const verifyJWT = async (req, res, next) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    return res.status(401).json({ message: "No access token found" });
  }

  try {
    const publicKey = await jose.importSPKI(
      process.env.JWT_SECRET_PUBLIC_KEY,
      "RS256"
    );

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
