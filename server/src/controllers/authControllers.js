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
    const userAgent = req.get('User-Agent') || '';
    const isIOS = isIOSSafari(userAgent);

    // Create user data
    const userData = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      loginTime: new Date().toISOString()
    };

    if (isIOS) {
      // For iOS devices, use JWT tokens instead of sessions
      console.log("iOS device detected, using JWT tokens");
      
      const privateKey = await jose.importPKCS8(privatePEM, "RS256");

      const accessToken = await new jose.SignJWT(userData)
        .setProtectedHeader({ alg: "RS256" })
        .setExpirationTime("24h") // Longer expiration for iOS
        .sign(privateKey);

      const refreshToken = await new jose.SignJWT(userData)
        .setProtectedHeader({ alg: "RS256" })
        .setExpirationTime("30d")
        .sign(privateKey);

      // Set cookies with iOS-friendly settings
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
      };

      res.cookie("accessToken", accessToken, {
        ...cookieOptions,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });

      res.cookie("refreshToken", refreshToken, {
        ...cookieOptions,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      // Also set a simple flag cookie for iOS
      res.cookie("isLoggedIn", "true", {
        ...cookieOptions,
        maxAge: 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({ 
        message: "Login successful",
        user: userData,
        authMethod: "jwt"
      });
      
    } else {
      // For non-iOS devices, use sessions
      req.session.user = userData;
      
      req.session.save((err) => {
        if (err) {
          console.error("Error saving session:", err);
          return res.status(500).json({ error: "Session save failed" });
        }

        console.log("Session created successfully for:", userData.email);
        res.status(200).json({ 
          message: "Login successful",
          user: userData,
          authMethod: "session"
        });
      });
    }

  } catch (error) {
    console.error("Login error:", error.message);
    res.status(400).json({ error: error.message });
  }
};

export const getStatus = async (req, res) => {
  console.log("Session ID:", req.sessionID);
  console.log("Session data:", req.session);
  console.log("Cookies:", req.cookies);
  
  const userAgent = req.get('User-Agent') || '';
  const isIOS = isIOSSafari(userAgent);
  
  if (isIOS) {
    // For iOS, check JWT tokens
    const accessToken = req.cookies?.accessToken;
    const isLoggedIn = req.cookies?.isLoggedIn;
    
    if (accessToken && isLoggedIn) {
      try {
        const publicKey = await jose.importSPKI(publicPEM, "RS256");
        const { payload: user } = await jose.jwtVerify(accessToken, publicKey);
        
        console.log("iOS JWT auth successful");
        return res.status(200).json({ 
          isValid: true, 
          user: user,
          authMethod: "jwt"
        });
      } catch (error) {
        console.log("JWT verification failed:", error.message);
        return res.status(401).json({ 
          isValid: false, 
          message: "Invalid token",
          authMethod: "jwt"
        });
      }
    } else {
      console.log("No JWT tokens found for iOS device");
      return res.status(401).json({ 
        isValid: false, 
        message: "No authentication tokens",
        authMethod: "jwt"
      });
    }
  } else {
    // For non-iOS, check session
    const user = req.session?.user;

    if (user) {
      req.session.lastAccessed = new Date().toISOString();
      
      return res.status(200).json({ 
        isValid: true, 
        user: user,
        sessionId: req.sessionID,
        authMethod: "session"
      });
    } else {
      console.log("No valid session found");
      return res.status(401).json({ 
        isValid: false, 
        message: "User not authenticated",
        sessionId: req.sessionID,
        authMethod: "session"
      });
    }
  }
};

export const logout = (req, res) => {
  const userAgent = req.get('User-Agent') || '';
  const isIOS = isIOSSafari(userAgent);
  
  if (isIOS) {
    // For iOS, clear JWT cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      expires: new Date(0),
    };

    res.cookie("accessToken", "", cookieOptions);
    res.cookie("refreshToken", "", cookieOptions);
    res.cookie("isLoggedIn", "", cookieOptions);
    
    return res.status(200).json({ 
      message: "Logged out successfully",
      isLoggedOut: true,
      authMethod: "jwt"
    });
  } else {
    // For non-iOS, destroy session
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destruction error:", err);
          return res.status(500).json({ error: "Logout failed" });
        }
        
        res.clearCookie('connect.sid');
        res.status(200).json({ 
          message: "Logged out successfully",
          isLoggedOut: true,
          authMethod: "session"
        });
      });
    } else {
      res.status(200).json({ 
        message: "No active session",
        isLoggedOut: true,
        authMethod: "session"
      });
    }
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