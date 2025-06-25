import Staff from "../models/staffmodel.js";

// Get all staff members
export const getStaff = async (req, res) => {
  try {
    const hospitalId = req.user.hospital;
    const staff = await Staff.find({ hospital: hospitalId }).select("-password");
    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ message: "Error fetching staff members", error });
  }
};

// Delete a staff member (Only superadmin can delete)
export const deleteStaff = async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Unauthorized: Only superadmin can delete staff" });
    }

    const { id } = req.params;

    // Make sure the staff belongs to the same hospital
    const staffToDelete = await Staff.findOne({ _id: id, hospital: req.user.hospital });

    if (!staffToDelete) {
      return res.status(404).json({ message: "Staff member not found in your hospital" });
    }

    await Staff.findByIdAndDelete(staffToDelete._id);
    res.status(200).json({ message: "Staff member deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: "Error deleting staff member", error });
  }
};



