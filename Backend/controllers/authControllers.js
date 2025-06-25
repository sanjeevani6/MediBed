import Staff from "../models/staffmodel.js";
import Hospital from "../models/hospitalModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";


const JWT_SECRET = process.env.JWT_SECRET ;
const REFRESH_SECRET = process.env.REFRESH_SECRET ;

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true, // Secure in production
  sameSite: "None",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// Generate Access Token (expires in 15 minutes)
const generateAccessToken = (staff) => {
  return jwt.sign(
    { id: staff._id, staffID: staff.staffID, name: staff.name, role: staff.role, hospital: hospitalName, },
    JWT_SECRET,
    { expiresIn: "15m" }
  );
};

// Generate Refresh Token (expires in 7 days)
const generateRefreshToken = (staff) => {
  return jwt.sign(
    { id: staff._id, staffID: staff.staffID, name: staff.name, role: staff.role, hospital: hospitalName, },
    REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};


// Staff Login - Generates JWT Acess and Refresh Token in an HTTP-only cookie
export const loginStaff = async (req, res) => {
  const { staffID, password ,hospitalName} = req.body;
  if (!staffID || !password || !hospitalName) {
    return res.status(400).json({ message: "All fields are required" });
  }
  console.log( "request",req.body);
  console.log("Current database:", mongoose.connection.name);
 try {  
  const hospital = await Hospital.findOne({ name: hospitalName });
  if (!hospital) {
    return res.status(400).json({ message: "Hospital not found" });
  }
   const staff = await Staff.findOne({ staffID: req.body.staffID }); 
    console.log("staff",staff);
    if (!staff) return res.status(400).json({ message: "Invalid credentials" });
     console.log("matched id");
    // Check password
    const isMatch = await bcrypt.compare(password, staff.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
    console.log("password matched");

    // Generate tokens
    const accessToken = generateAccessToken(staff,hospital.name);
    const refreshToken = generateRefreshToken(staff,hospital.name);
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
    res.status(500).json({ message: "Server error" });
  }
};
//register-admin and hospital
export const registerAdmin = async (req, res) => {
  try {
    const { name, staffID, password, hospitalName } = req.body;

    if (!name || !staffID || !password || !hospitalName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingHospital = await Hospital.findOne({ name: hospitalName });
    if (existingHospital) {
      return res.status(400).json({ message: "Hospital already registered" });
    }

    const existingStaff = await Staff.findOne({ staffID });
    if (existingStaff) {
      return res.status(400).json({ message: "Staff ID already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newHospital = new Hospital({ name: hospitalName });
    await newHospital.save();

    const newAdmin = new Staff({
      name,
      staffID,
      password: hashedPassword,
      role: "superadmin",
      hospital: newHospital._id,
    });
    await newAdmin.save();

    newHospital.admin = newAdmin._id;
    await newHospital.save();

    // Generate tokens
    const accessToken = generateAccessToken(newAdmin, newHospital.name);
    const refreshToken = generateRefreshToken(newAdmin, newHospital.name);

    console.log("accessToken", accessToken);
    console.log("refreshToken", refreshToken);

    // Set cookie
    res.cookie("accessToken", accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 }); // 15 min
    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS); // 7 days

    console.log("setting cookies done");

    const responseData = {
      message: "Registration successful",
      staff: {
        name: newAdmin.name,
        staffID: newAdmin.staffID,
        role: newAdmin.role,
        _id: newAdmin._id,
      },
      token: accessToken,
    };

    console.log("Sending response:", responseData);

    return res.status(201).json(responseData);
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ message: "Server error during registration" });
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

