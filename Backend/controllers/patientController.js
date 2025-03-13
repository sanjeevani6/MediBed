import { Patient } from "../models/patientmodel.js";

// to add patient
export const addPatient = async (req, res) => {
  try {
    const {
      name,
      age,
      weight,
      phoneNumber,
      bloodGroup,
      address,
      status,
      severity,
      bedType,
    } = req.body;
    console.log("request body",req.body);

    // Validate required fields
    if (!name || !age || !weight || !phoneNumber || !bloodGroup || !address || !status || !severity || !bedType) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Create a new patient
    const newPatient = new Patient({
      name,
      age,
      weight,
      phoneNumber,
      bloodGroup,
      address,
      status,
      severity,
      bedType,
    });

    await newPatient.save();
    res.status(201).json({ message: "Patient added successfully!", patient: newPatient });
  } catch (error) {
    console.error("Error adding patient:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//to get patient
export const getPatients = async (req, res) => {
  try {
    const patients = await Patient.find();
    res.status(200).json(patients);
  } catch (error) {
    console.error("Error fetching patients:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
