import Doctor from "../models/doctormodel.js";

export const addDoctor = async (req, res) => {
  try {
    const { name, specialization } = req.body;
    const hospitalId = req.user.hospital;

    if (!name || !specialization) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check for duplicate in same hospital
    const existingDoctor = await Doctor.findOne({ name, hospital: hospitalId });
    if (existingDoctor) {
      return res.status(400).json({ message: "Doctor already exists in this hospital" });
    }

    const newDoctor = new Doctor({
      name,
      specialization,
      patients: [],
      hospital: hospitalId,
    });

    await newDoctor.save();

    res.status(201).json({ message: "Doctor added successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error adding doctor", error });
  }
};

