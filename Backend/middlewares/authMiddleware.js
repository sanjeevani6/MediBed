import jwt from "jsonwebtoken";
import Staff from "../models/staffmodel.js";

const JWT_SECRET = process.env.JWT_SECRET ;
const REFRESH_SECRET = process.env.REFRESH_SECRET ;
 
/**
 * Generates a new Access Token
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, staffID: user.staffID, name: user.name, role: user.role,hospital: user.hospital },
    JWT_SECRET,
    { expiresIn: "15m" }
  );
};

/**
 * Verifies Refresh Token and issues a new Access Token
 */
const verifyAndRefreshToken = (req, res, next) => { // ✅ Added `req` as a parameter
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ message: "No refresh token provided" });

  jwt.verify(refreshToken, REFRESH_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid refresh token" });

    const newAccessToken = generateAccessToken(decoded);

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 15 * 60 * 1000, // 15 min
    });

    req.user = decoded; // ✅ Attach user info to `req`
    next();
  });
};

export const authMiddleware = async(req, res, next) => {
  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  if (!accessToken) {
    if (!refreshToken) return res.status(401).json({ message: "Access denied" });
    return verifyAndRefreshToken(req, res, next); // ✅ Now passing `req`
  }

  try {
    const decoded = jwt.verify(accessToken, JWT_SECRET);
    console.log("decoded token:",decoded);
    req.user = decoded;
    //req.user=await Staff.findById(decoded.id).select("-password");
    next();
  } catch (error) {
    if (!refreshToken) return res.status(401).json({ message: "Session expired, please log in again" });
    return verifyAndRefreshToken(req, res, next); // ✅ Now passing `req`
  }
};
