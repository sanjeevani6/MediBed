import jwt from "jsonwebtoken";

const { JWT_SECRET, REFRESH_SECRET } = process.env;

// Sign a short-lived Access Token (15 minutes)
export function signAccessToken(userPayload) {
  return jwt.sign(userPayload, JWT_SECRET, { expiresIn: "15m" });
}

// Sign a long-lived Refresh Token (7 days)
export function signRefreshToken(userPayload) {
  return jwt.sign(userPayload, REFRESH_SECRET, { expiresIn: "7d" });
}
