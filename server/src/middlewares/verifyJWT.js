import * as jose from "jose";

export const verifyJWT = async (req, res, next) => {
  const accessToken = req.cookies?.accessToken;

  try {
    if (accessToken) {
      const publicPEM = process.env.PUBLIC_KEY;
      const publicKey = await jose.importSPKI(publicPEM, "RS256");
      const { payload } = await jose.jwtVerify(accessToken, publicKey);
      req.user = payload;
      return next();
    } else {
      return res.status(401).json({ code: "ACCESS_TOKEN_EXPIRED" });
    }
  } catch (error) {
    if (error instanceof jose.errors.JWTExpired) {
      return res.status(401).json({ code: "ACCESS_TOKEN_EXPIRED" });
    }
    console.error("JWT verification error:", error);
    return res.status(403).json({ message: "Invalid access token" });
  }
};
