import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SidebarLayout from "../components/SidebarLayout";

const AddStaff = ({ user }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    staffID: "",
    password: "",
    role: "staff",
  });
  const [error, setError] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-600 text-lg font-semibold">
          YOU NEED TO BE LOGGED IN
        </p>
      </div>
    );
  }

  if (user.role !== "superadmin") {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-600 text-lg font-semibold">
          Only superadmins can add staff members.
        </p>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/v1/staff/add", formData, {
        withCredentials: true,
      });
      setShowPopup(true);
      setTimeout(() => {
        setShowPopup(false);
        navigate("/dashboard");
      }, 3000);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to add staff member.");
    }
  };

  return (
    <SidebarLayout>
    <div className="add-staff-container">
      <h2>Add Staff Member</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Name" onChange={handleChange} required />
        <input type="text" name="staffID" placeholder="Staff ID" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
        <select name="role" onChange={handleChange}>
          <option value="staff">Staff</option>
          <option value="superadmin">Superadmin</option>
        </select>
        <button type="submit">Add Staff</button>
      </form>
    </div>
    </SidebarLayout>
  );
};

export default AddStaff;
