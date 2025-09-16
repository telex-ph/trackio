import * as jose from "jose";

export const verifyJWT = async (req, res, next) => {
  const token = req.cookies?.accessToken;
  if (!token) {
    return res.status(401).json({ code: "NO_TOKEN", message: "No token provided" });
  }

  try {
    const publicPEM = process.env.PUBLIC_KEY;
    const publicKey = await jose.importSPKI(publicPEM, "RS256");
    const { payload } = await jose.jwtVerify(token, publicKey);

    req.user = payload;
    return next();
  } catch (error) {
    if (error instanceof jose.errors.JWTExpired || error.code === "ERR_JWT_EXPIRED") {
      return res.status(401).json({ code: "ACCESS_TOKEN_EXPIRED", message: "Access token expired" });
    }

    console.error("JWT verification error:", error);
    return res.status(401).json({ code: "INVALID_TOKEN", message: "Invalid access token" });
  }
};
