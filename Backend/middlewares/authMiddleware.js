import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "your_refresh_secret";

/**
 * Generates a new Access Token
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, staffID: user.staffID, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: "15m" }
  );
};

/**
 * Verifies Refresh Token and issues a new Access Token
 */
const verifyAndRefreshToken = (refreshToken,req, res, next, attachToRequest = true) => {
  jwt.verify(refreshToken, REFRESH_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid refresh token" });

    const newAccessToken = generateAccessToken(decoded);

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 min
    });

    if (attachToRequest) req.user = decoded; // Attach user info
    next();
  });
};

export const authMiddleware = async(req, res, next) => {
  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  if (!accessToken) {
    if (!refreshToken) return res.status(401).json({ message: "Access denied" });
    return verifyAndRefreshToken(refreshToken, req,res, next);
  }

  try {
    const decoded = jwt.verify(accessToken, JWT_SECRET);
    // req.user = decoded;
    req.user=await User.findById(decoded.id).select("-password");
    next();
  } catch (error) {
    if (!refreshToken) return res.status(401).json({ message: "Session expired, please log in again" });
    return verifyAndRefreshToken(refreshToken,req, res, next);
  }
};


