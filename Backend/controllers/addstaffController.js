import Staff from "../models/staffmodel.js";
import Hospital from "../models/hospitalModel.js";
import bcrypt from "bcryptjs";

const addstaff = async (req, res) => {
  try {
    console.log("Received request to add staff:", req.body);

    const { name, staffID, password, role } = req.body;

    // Validate required fields
    if (!name || !staffID || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Get hospital ID from the authenticated user
    const hospitalId = req.user?.hospital;
    console.log("Hospital ID from token:", hospitalId);

    if (!hospitalId) {
      return res.status(400).json({ message: "Hospital not found in token" });
    }

    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    // Check for existing staff with same staffID in the same hospital
    const existingStaff = await Staff.findOne({
      staffID,
      hospital: hospital._id,
    });

    if (existingStaff) {
      return res.status(400).json({ message: "Staff ID already exists in this hospital" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new staff member
    const newStaff = new Staff({
      name,
      staffID,
      password: hashedPassword,
      role,
      hospital: hospital._id,
    });

    await newStaff.save();

    return res.status(201).json({ message: "Staff member added successfully!" });

  } catch (error) {
    console.error("Add staff error:", error);
    return res.status(500).json({ message: "Error adding staff member", error });
  }
};

export default addstaff;
