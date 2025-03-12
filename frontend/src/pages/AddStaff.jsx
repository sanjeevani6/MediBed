import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AddStaff = ({ user }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    staffID: "",
    password: "",
    role: "staff",
  });
  const [error, setError] = useState("");
  const [showPopup, setShowPopup] = useState(false); // Pop-up state

  console.log("user is:",user);
  if (!user ) {
    return <p className="error-message">YOU NEED TO BE LOGGED IN</p>;
  }
  // Prevent non-superadmins from accessing
  if ( user.role !== "superadmin") {
    return <p className="error-message">Only superadmins can add staff members.</p>;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/v1/staff/add", formData, { withCredentials: true });
          // Show pop-up
          setShowPopup(true);

          // Hide pop-up after 3 seconds
          setTimeout(() => {
            setShowPopup(false);
            navigate("/dashboard"); // Redirect back to dashboard
          }, 3000);
          
      navigate("/dashboard"); // Redirect back to dashboard
    } catch (error) {
      setError(error.response?.data?.message || "Failed to add staff member.");
    }
  };

  return (
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
  );
};

export default AddStaff;
