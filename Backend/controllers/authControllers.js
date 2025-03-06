import Staff from "../models/staffmodel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // Secure in production
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// Staff Login - Generates JWT in an HTTP-only cookie
export const loginStaff = async (req, res) => {
  const { staffID, password } = req.body;
  console.log( "request",req.body);
  console.log("Current database:", mongoose.connection.name);
  console.log("Collections available:", await mongoose.connection.db.listCollections().toArray());
  const staff = await Staff.findOne({ staffID: "202" });
console.log("Matching staff document:", staff);
 


  try {



    
   const staff = await Staff.findOne({ staffID: req.body.staffID }); 
    console.log("staff",staff);
    if (!staff) return res.status(400).json({ message: "Invalid credentials" });
     console.log("matched id");
    // Check password
   // const isMatch = await bcrypt.compare(password, staff.password);
   // if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Generate JWT token
    const token = jwt.sign({ id: staff._id, role: staff.role }, JWT_SECRET, {
      expiresIn: "7d",
    });
 console.log("token1",token);
    // Set cookie
    res.cookie("token", token, COOKIE_OPTIONS);
    console.log("cookies done");
    const responseData = {
        message: "Login successful",
        staff: { name: staff.name, staffID: staff.staffID, role: staff.role },
      };
  
      console.log("Sending response:", responseData);
  
      return res.json(responseData);
   
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Logout - Clears the cookie
export const logoutStaff = (req, res) => {
  res.clearCookie("token", COOKIE_OPTIONS);
  return res.json({ message: "Logged out successfully" });
};

// Check Auth - Verify if user is logged in
export const checkAuth = (req, res) => {
  try {
    console.log("Cookies received in check-auth:", req.cookies); // Debugging
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });
      console.log("token",token);
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("decode:",decoded);
    console.log("successful");
   return res.json({ user: decoded });
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
