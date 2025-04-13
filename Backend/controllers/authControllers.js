import Staff from "../models/staffmodel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
 
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "your_refresh_secret";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // Secure in production
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// Generate Access Token (expires in 15 minutes)
const generateAccessToken = (staff) => {
  return jwt.sign(
    { id: staff._id, staffID: staff.staffID, name: staff.name, role: staff.role },
    JWT_SECRET,
    { expiresIn: "15m" }
  );
};

// Generate Refresh Token (expires in 7 days)
const generateRefreshToken = (staff) => {
  return jwt.sign(
    { id: staff._id, staffID: staff.staffID, name: staff.name, role: staff.role },
    REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};


// Staff Login - Generates JWT Acess and Refresh Token in an HTTP-only cookie
export const loginStaff = async (req, res) => {
  const { staffID, password } = req.body;
  console.log( "request",req.body);
  console.log("Current database:", mongoose.connection.name);
 // console.log("Collections available:", await mongoose.connection.db.listCollections().toArray());
 // const staff = await Staff.findOne({ staffID: "202" });
//console.log("Matching staff document:", staff);
 


  try {



    
   const staff = await Staff.findOne({ staffID: req.body.staffID }); 
    console.log("staff",staff);
    if (!staff) return res.status(400).json({ message: "Invalid credentials" });
     console.log("matched id");
    // Check password
    const isMatch = await bcrypt.compare(password, staff.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
    console.log("password matched");

    // Generate tokens
    const accessToken = generateAccessToken(staff);
    const refreshToken = generateRefreshToken(staff);
 console.log("accessToken",accessToken);
 console.log("refreshToken",refreshToken);
    // Set cookie
    res.cookie("accessToken", accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 }); // 15 min
    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS); // 7 days
    console.log(" setting cookies done");
    const responseData = {
        message: "Login successful",
        staff: { name: staff.name, staffID: staff.staffID, role: staff.role,_id:staff._id },
        token:accessToken
      };
  
      console.log("Sending response:", responseData);
  
      return res.json(responseData);
   
  } catch (error) {
    res.status(8080).json({ message: "Server error" });
  }
};

// Logout - Clears both cookies
export const logoutStaff = (req, res) => {
  res.clearCookie("accessToken", COOKIE_OPTIONS);
  res.clearCookie("refreshToken", COOKIE_OPTIONS);
  return res.json({ message: "Logged out successfully" });
};

// checkAuth -for finally checking the authentication
export const checkAuth = (req, res) => {
  try {
    // `authMiddleware` has already verified the user and attached `req.user`
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Return user details
    return res.json({
      user: {
        id: req.user.id,
        staffID: req.user.staffID,
        name: req.user.name,
        role: req.user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

