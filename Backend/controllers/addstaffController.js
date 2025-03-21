import Staff from "../models/staffmodel.js";
import bcrypt from "bcryptjs";
const addstaff =
    async (req, res) => {
        try {
            console.log("Received request to add staff:", req.body);

            // Ensure the request body has all required fields
            if (!req.body.name || !req.body.staffID || !req.body.password) {
                return res.status(400).json({ message: "All fields are required" });
            }

            // Check if staffID already exists
         
    console.log("Checking if staff ID already exists...");
    const existingStaff = await Staff.findOne({ staffID:req.body.staffID });
    
    console.log("Query result for existing staff:", existingStaff);

    if (existingStaff) {
        return res.status(400).json({ message: "Staff ID already exists" });
      }

            const { name, staffID, password, role } = req.body;
           
            // Hash password before saving
            const hashedPassword = await bcrypt.hash(password, 10);
              // Create new staff
            const newStaff = new Staff({ name, staffID, password: hashedPassword, role });
            await newStaff.save();

            res.status(201).json({ message: "Staff member added successfully!" });
        } catch (error) {
            res.status(500).json({ message: "Error adding staff member", error });
        }
    }
export default addstaff;