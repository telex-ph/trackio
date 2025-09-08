import * as jose from "jose";
import fs from "fs/promises";
import User from "../model/User.js";

// Reading the PEM Keys
const privatePEM = await fs.readFile("./src/keys/private.pem", "utf8");
const publicPEM = await fs.readFile("./src/keys/public.pem", "utf8");

// Login
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const response = await User.login(email, password);
    res.status(200).json(response);
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(400).json({ error: error.message });
  }
};

// Creation of access and refresh token
export const createToken = async (req, res) => {
  const user = req.body;

  // Importing the private key (PKCS8 format) for RS256 signing
  const privateKey = await jose.importPKCS8(privatePEM, "RS256");

  // Access token (short exp date)
  const accessToken = await new jose.SignJWT(user)
    .setProtectedHeader({ alg: "RS256" })
    // .setExpirationTime("15m")
    // TODO: change this to 15m in production
    .setExpirationTime("15m")
    .sign(privateKey);

  // Refresh Token (longer expiration, we use this to generate new access tokn)
  const refreshToken = await new jose.SignJWT(user)
    .setProtectedHeader({ alg: "RS256" })
    // TODO: change this to 30d in production
    .setExpirationTime("30d")
    .sign(privateKey);

  // Setting cookies as httpOnly (not accessible by JavaScript)
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    // sameSite: "None",
    // secure: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  });

  // Setting cookies as httpOnly (not accessible by JavaScript)
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    // sameSite: "None",
    // secure: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
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
    const accessToken = await new jose.SignJWT(user)
      .setProtectedHeader({ alg: "RS256" })
      // .setExpirationTime("15m")
      // TODO: change this to 15m in production
      .setExpirationTime("15m")
      .sign(privateKey);

    // Setting cookies as httpOnly (not accessible by JavaScript)
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      // sameSite: "None",
      // secure: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
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

export const deleteToken = async (req, res) => {
  res.cookie("accessToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    path: "/",
    expires: new Date(0),
  });

  res.cookie("refreshToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    path: "/",
    expires: new Date(0),
  });

  res.json({ message: "Logged out successfully", isLoggedOut: true });
};

export const getAuthUser = (req, res) => {
  try {
    // Check if user exists (should be set by auth middleware)
    if (!req.user) {
      return res.status(401).json({
        message: "User not authenticated",
      });
    }

    // Remove sensitive fields before sending response
    const user = req.user;
    res.status(200).json(user);
  } catch (error) {
    console.error("Error getting authenticated user:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

export const getStatus = (req, res) => {
  const user = req.user;
  const now = Math.floor(Date.now() / 1000);

  if (!user) {
    return res
      .status(401)
      .json({ isValid: false, message: "User does not exist" });
  } else if (user.exp < now) {
    return res
      .status(401)
      .json({ isValid: false, message: "Invalid or expired token" });
  } else {
    return res.status(200).json({ isValid: true, message: "Valid user" });
  }
};
