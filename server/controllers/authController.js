import * as jose from "jose";

export const login = async (req, res) => {
  const user = req.body;

  // Importing the private key (PKCS8 format) for RS256 signing
  const privateKey = await jose.importPKCS8(
    process.env.JWT_SECRET_PRIVATE_KEY,
    "RS256"
  );

  // Signing JWT with the payload/user
  // Access token (short exp date)
  const accessToken = await new jose.SignJWT({ user })
    .setProtectedHeader({ alg: "RS256" })
    // .setExpirationTime("15m")
    // TODO: change this to 15m in production
    .setExpirationTime("15s")
    .sign(privateKey);

  // Refresh Token (longer expiration, we use this to generate new access tokn)
  const refreshToken = await new jose.SignJWT({ userId: user.id })
    .setProtectedHeader({ alg: "RS256" })
    // TODO: change this to 30d in production
    .setExpirationTime("30s")
    .sign(privateKey);

  // Setting cookies as httpOnly (not accessible by JavaScript)
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    sameSite: "Lax",
    secure: false,
    // secure: process.env.NODE_ENV === "production", // if true; https connection is required
    // sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // None means less strict, Lax is strict but no so strict
  });

  // Setting cookies as httpOnly (not accessible by JavaScript)
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: "Lax",
    secure: false,
    // secure: process.env.NODE_ENV === "production", // if true; https connection is required
    // sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // None means less strict, Lax is strict but no so strict
  });

  res.status(200).json({ message: "Sucessfully authentication" });
};
