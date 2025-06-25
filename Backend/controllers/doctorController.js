import Doctor from "../models/doctormodel.js";

// Get all doctors
 export const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ hospital: req.user.hospital });
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: "Error fetching doctors", error });
  }
};

export const countDoctors=async (req, res) => {
  try {
    const count = await Doctor.countDocuments({ hospital: req.user.hospital });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch doctor count" });
  }
};

// Delete a doctor (Only superadmin can delete)
export const deleteDoctor = async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Unauthorized: Only superadmin can delete doctors" });
    }

    const { id } = req.params;
    // Check if the doctor belongs to the current hospital
    const doctor = await Doctor.findOne({ _id: id, hospital: req.user.hospital });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found in your hospital" });
    }

    await Doctor.findByIdAndDelete(id);

    res.status(200).json({ message: "Doctor deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting doctor", error });
  }
};



