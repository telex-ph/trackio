import * as jose from "jose";
import fs from "fs/promises";

// Reading the PEM Keys
const privatePEM = await fs.readFile("./keys/private.pem", "utf8");
const publicPEM = await fs.readFile("./keys/public.pem", "utf8");

// Creation of access and refresh token
export const createToken = async (req, res) => {
  const user = req.body;

  // Importing the private key (PKCS8 format) for RS256 signing
  const privateKey = await jose.importPKCS8(privatePEM, "RS256");

  // Access token (short exp date)
  const accessToken = await new jose.SignJWT({ user })
    .setProtectedHeader({ alg: "RS256" })
    // .setExpirationTime("15m")
    // TODO: change this to 15m in production
    .setExpirationTime("10s")
    .sign(privateKey);

  // Refresh Token (longer expiration, we use this to generate new access tokn)
  const refreshToken = await new jose.SignJWT({ user })
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

  res.status(200).json({ message: "Sucessfully authenticated" });
};

// Generating new access token using refresh token
export const createNewToken = async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    return res.status(401).json({ message: "No refresh token found" });
  }

  try {
    const publicKey = await jose.importSPKI(publicPEM, "RS256");

    const { payload: user } = await jose.jwtVerify(token, publicKey);

    // Importing the private key (PKCS8 format) for RS256 signing
    const privateKey = await jose.importPKCS8(privatePEM, "RS256");

    // Signing JWT with the payload/user
    // Access token (short exp date)
    const accessToken = await new jose.SignJWT({ user })
      .setProtectedHeader({ alg: "RS256" })
      // .setExpirationTime("15m")
      // TODO: change this to 15m in production
      .setExpirationTime("10s")
      .sign(privateKey);

    // Setting cookies as httpOnly (not accessible by JavaScript)
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "Lax",
      secure: false,
      // secure: process.env.NODE_ENV === "production", // if true; https connection is required
      // sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // None means less strict, Lax is strict but no so strict
    });
    return res.json({ message: "New access token created" });
  } catch (error) {
    // Refresh token expired, user needs to login again
    if (error.code === "ERR_JWT_EXPIRED") {
      return res.status(401).json({
        code: "REFRESH_TOKEN_EXPIRED",
        message: "Refresh token expired",
      });
    }
    console.error("Error: ", error.code);
  }
};

export const getAuthUser = (req, res) => {
  res.status(200).json(req.user);
};
