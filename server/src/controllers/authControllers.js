import * as jose from "jose";
import User from "../model/User.js";

const privatePEM = process.env.PRIVATE_KEY;
const publicPEM = process.env.PUBLIC_KEY;

const isIOSSafari = (userAgent) => {
  return /iPad|iPhone|iPod/.test(userAgent) && /WebKit/.test(userAgent) && !/Edge/.test(userAgent);
};

const getCookieOptions = (req) => {
  const isProduction = process.env.NODE_ENV === "production";
  const userAgent = req.get('User-Agent') || '';
  const isIOS = isIOSSafari(userAgent);
  
  const sameSiteValue = isProduction ? 
    (isIOS ? "Lax" : "None") : 
    "Lax"; 

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: sameSiteValue,
    path: "/",
  };
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.login(email, password); // I-assume na tama ang User.login mo

    // I-save ang user data sa session
    req.session.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role
    };

    // I-save ang session bago mag-response
    req.session.save((err) => {
      if (err) {
        console.error("Error saving session:", err);
        return res.status(500).json({ error: "Session save failed" });
      }

      // I-send ang successful response
      res.status(200).json({ 
        message: "Login successful",
        user: req.session.user // I-return ang user data
      });
    });

  } catch (error) {
    console.error("Login error:", error.message);
    res.status(400).json({ error: error.message });
  }
};

// Baguhin ang getStatus function
export const getStatus = (req, res) => {
  // Gamitin ang req.session.user para i-check kung valid ang session
  const user = req.session.user;

  if (user) {
    return res.status(200).json({ isValid: true, user: user });
  } else {
    return res.status(401).json({ isValid: false, message: "User not authenticated" });
  }
};

export const createToken = async (req, res) => {
  const user = req.body;

  const privateKey = await jose.importPKCS8(privatePEM, "RS256");

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
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    path: "/",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
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
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
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

/*export const getStatus = (req, res) => {
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
};*/
