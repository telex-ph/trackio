import * as jose from "jose";
import User from "../model/User.js";

const privatePEM = process.env.PRIVATE_KEY;
const publicPEM = process.env.PUBLIC_KEY;

const isIOSSafari = (userAgent) => {
  return /iPad|iPhone|iPod/.test(userAgent) && /WebKit/.test(userAgent) && !/Edge/.test(userAgent);
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await User.login(email, password);

    // Create user session data
    const sessionData = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      loginTime: new Date().toISOString()
    };

    // Set session data
    req.session.user = sessionData;
    
    // Force session regeneration for iOS devices
    const userAgent = req.get('User-Agent') || '';
    if (isIOSSafari(userAgent)) {
      return new Promise((resolve) => {
        req.session.regenerate((err) => {
          if (err) {
            console.error("Session regeneration error:", err);
            return res.status(500).json({ error: "Session creation failed" });
          }
          
          // Set user data again after regeneration
          req.session.user = sessionData;
          
          // Explicitly save session
          req.session.save((saveErr) => {
            if (saveErr) {
              console.error("Session save error:", saveErr);
              return res.status(500).json({ error: "Session save failed" });
            }
            
            console.log("iOS Safari session created successfully");
            res.status(200).json({ 
              message: "Login successful",
              user: sessionData
            });
            resolve();
          });
        });
      });
    } else {
      // For non-iOS devices, use normal session save
      req.session.save((err) => {
        if (err) {
          console.error("Error saving session:", err);
          return res.status(500).json({ error: "Session save failed" });
        }

        console.log("Session created successfully for:", sessionData.email);
        res.status(200).json({ 
          message: "Login successful",
          user: sessionData
        });
      });
    }

  } catch (error) {
    console.error("Login error:", error.message);
    res.status(400).json({ error: error.message });
  }
};

export const getStatus = (req, res) => {
  console.log("Session ID:", req.sessionID);
  console.log("Session data:", req.session);
  
  const user = req.session?.user;

  if (user) {
    // Update last accessed time
    req.session.lastAccessed = new Date().toISOString();
    
    return res.status(200).json({ 
      isValid: true, 
      user: user,
      sessionId: req.sessionID
    });
  } else {
    console.log("No valid session found");
    return res.status(401).json({ 
      isValid: false, 
      message: "User not authenticated",
      sessionId: req.sessionID
    });
  }
};

export const logout = (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destruction error:", err);
        return res.status(500).json({ error: "Logout failed" });
      }
      
      res.clearCookie('trackio.sid'); // Clear the session cookie
      res.status(200).json({ 
        message: "Logged out successfully",
        isLoggedOut: true 
      });
    });
  } else {
    res.status(200).json({ 
      message: "No active session",
      isLoggedOut: true 
    });
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

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    path: "/",
  };

  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  res.status(200).json({ message: "Successfully authenticated" });
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
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    path: "/",
    expires: new Date(0),
  };

  res.cookie("accessToken", "", cookieOptions);
  res.cookie("refreshToken", "", cookieOptions);

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