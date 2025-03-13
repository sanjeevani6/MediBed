import Staff from "../models/staffmodel.js";

// Get all staff members
export const getStaff = async (req, res) => {
  try {
    const staff = await Staff.find();
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
    const deletedStaff = await Staff.findByIdAndDelete(id);

    if (!deletedStaff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    res.status(200).json({ message: "Staff member deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting staff member", error });
  }
};


