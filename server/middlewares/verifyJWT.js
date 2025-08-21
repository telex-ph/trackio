import * as jose from "jose";

export const verifyJWT = async (req, res, next) => {
  const token = req.cookies?.accessToken;

  const publicKey = await jose.importSPKI(
    process.env.JWT_SECRET_PUBLIC_KEY,
    "RS256"
  );

  const result = await jose.jwtVerify(token, publicKey);
  console.log("result of verify JWT", result);

  next();
};
