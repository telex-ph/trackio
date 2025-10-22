import * as jose from "jose";
import User from "../model/User.js";
import Auth from "../model/Auth.js";
import bcrypt from "bcrypt";
import { sendPasswordReset } from "../utils/sendPasswordReset.js";
import { CompactEncrypt, importSPKI, compactDecrypt, importPKCS8 } from "jose";

const privatePEM = process.env.PRIVATE_KEY;
const publicPEM = process.env.PUBLIC_KEY;

// Login
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.getByEmail(email);

    if (!user) throw new Error("User not found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid credentials");

    const response = await User.login(email, user.password);
    res.status(200).json(response);
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(400).json({ error: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  const email = req.body.email;
  try {
    const user = await User.getByEmail(email);
    if (!user) {
      console.error("Reset password error:", error?.message);
      res.status(404).json({
        success: false,
        message: "No account found with that email address.",
      });
    }
    // TODO: store the code in the db for enhanced security
    const payload = {
      userId: user._id,
      email: user.email,
      // code: crypto.randomBytes(4).toString("hex").toUpperCase(),
      exp: Math.floor(Date.now() / 1000) + 15 * 60,
      iat: Math.floor(Date.now() / 1000),
      nonce: crypto.randomUUID(),
    };

    const publicKey = await importSPKI(process.env.PUBLIC_KEY, "RSA-OAEP");

    const jwe = await new CompactEncrypt(
      new TextEncoder().encode(JSON.stringify(payload))
    )
      .setProtectedHeader({ alg: "RSA-OAEP", enc: "A256GCM" })
      .encrypt(publicKey);

    const resetLink = `${
      process.env.FRONTEND_URL
    }/reset-password?payload=${encodeURIComponent(jwe)}`;

    const result = await sendPasswordReset(email, resetLink);
    res.status(200).json({ id: result.id, redirect: true });
  } catch (error) {
    console.error("Password reset error:", error?.message);
    res.status(500).json({
      success: false,
      message: "An error occurred resetting user password.",
    });
  }
};

export const verifyForgotPassword = async (req, res) => {
  try {
    const { payload, newPassword } = req.body;

    if (!payload) return res.status(400).json({ message: "Missing payload" });

    const privateKey = await importPKCS8(process.env.PRIVATE_KEY, "RSA-OAEP");

    const { plaintext } = await compactDecrypt(payload, privateKey);

    const data = JSON.parse(new TextDecoder().decode(plaintext));

    if (Date.now() / 1000 > data.exp) {
      return res.status(400).json({ message: "Reset link expired" });
    }

    const SALT_ROUNDS = 10;
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    const result = await Auth.change(data.userId, hashedPassword);
    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Password not updated. It may be the same as your old password.",
      });
    }

    res.status(200).json({ isValid: true });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Invalid or tampered link" });
  }
};

export const changePassword = async (req, res) => {
  const { id, password, newPassword } = req.body;

  try {
    if (!id || !password || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const isValid = await Auth.compare(id, password);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message:
          "The current password you entered is incorrect. Please try again.",
      });
    }

    const SALT_ROUNDS = 10;
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    const result = await Auth.change(id, hashedPassword);

    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Password not updated. It may be the same as your old password.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (error) {
    console.error("Change password error:", error?.message);
    res.status(500).json({
      success: false,
      message: "An error occurred while changing your password.",
    });
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
    .setExpirationTime("15m")
    .sign(privateKey);

  const refreshToken = await new jose.SignJWT(user)
    .setProtectedHeader({ alg: "RS256" })
    .setExpirationTime("30d")
    .sign(privateKey);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    path: "/",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    path: "/",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  res.status(200).json({ message: "Sucessfully authenticated" });
};

export const createNewToken = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token found" });
  }

  try {
    const publicKey = await jose.importSPKI(publicPEM, "RS256");

    const { payload: user } = await jose.jwtVerify(refreshToken, publicKey);

    const privateKey = await jose.importPKCS8(privatePEM, "RS256");

    const accessToken = await new jose.SignJWT(user)
      .setProtectedHeader({ alg: "RS256" })
      .setExpirationTime("15m")
      .sign(privateKey);

    // Setting cookies as httpOnly (not accessible by JavaScript)
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      path: "/",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
    return res.json({ message: "New access token created" });
  } catch (error) {
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
    secure: true,
    sameSite: "None",
    path: "/",
    expires: new Date(0),
  });

  res.cookie("refreshToken", "", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    path: "/",
    expires: new Date(0),
  });

  res.json({ message: "Logged out successfully", isLoggedOut: true });
};

export const getAuthUser = (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "User not authenticated",
      });
    }

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
