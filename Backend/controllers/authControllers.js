import Staff from "../models/staffmodel.js";
import Hospital from "../models/hospitalModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "None",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// ✅ Generate Access Token with hospital ObjectId
const generateAccessToken = (staff, hospitalId) => {
  return jwt.sign(
    {
      id: staff._id,
      staffID: staff.staffID,
      name: staff.name,
      role: staff.role,
      hospital: hospitalId, // Use ObjectId
    },
    JWT_SECRET,
    { expiresIn: "15m" }
  );
};

// ✅ Generate Refresh Token with hospital ObjectId
const generateRefreshToken = (staff, hospitalId) => {
  return jwt.sign(
    {
      id: staff._id,
      staffID: staff.staffID,
      name: staff.name,
      role: staff.role,
      hospital: hospitalId, // Use ObjectId
    },
    REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};

// ✅ Staff Login
export const loginStaff = async (req, res) => {
  const { staffID, password, hospitalName } = req.body;

  if (!staffID || !password || !hospitalName) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const hospital = await Hospital.findOne({ name: hospitalName });
    if (!hospital) {
      return res.status(400).json({ message: "Hospital not found" });
    }

    const staff = await Staff.findOne({ staffID });
    if (!staff || staff.hospital.toString() !== hospital._id.toString()) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, staff.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const accessToken = generateAccessToken(staff, hospital._id);
    const refreshToken = generateRefreshToken(staff, hospital._id);

    res.cookie("accessToken", accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 }); // 15 min
    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS); // 7 days

    return res.json({
      message: "Login successful",
      staff: {
        name: staff.name,
        staffID: staff.staffID,
        role: staff.role,
        _id: staff._id,
      },
      token: accessToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Register Hospital + Admin
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

    const accessToken = generateAccessToken(newAdmin, newHospital._id);
    const refreshToken = generateRefreshToken(newAdmin, newHospital._id);

    res.cookie("accessToken", accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 }); // 15 min
    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS); // 7 days

    return res.status(201).json({
      message: "Registration successful",
      staff: {
        name: newAdmin.name,
        staffID: newAdmin.staffID,
        role: newAdmin.role,
        _id: newAdmin._id,
      },
      token: accessToken,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ message: "Server error during registration" });
  }
};

// ✅ Logout
export const logoutStaff = (req, res) => {
  res.clearCookie("accessToken", COOKIE_OPTIONS);
  res.clearCookie("refreshToken", COOKIE_OPTIONS);
  return res.json({ message: "Logged out successfully" });
};

// ✅ Check Authentication
export const checkAuth = (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    return res.json({
      user: {
        id: req.user.id,
        staffID: req.user.staffID,
        name: req.user.name,
        role: req.user.role,
        hospital: req.user.hospital, // This is now ObjectId
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};
