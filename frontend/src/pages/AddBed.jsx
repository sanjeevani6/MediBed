import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SidebarLayout from "../components/SidebarLayout";

const AddBed = ({ user }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    bedNumber: "",
    type: "General",
  });
  const [error, setError] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  // Ensure only superadmins can access this page
  if (!user) {
    return <p className="error-message">YOU NEED TO BE LOGGED IN</p>;
  }
  if (user.role !== "superadmin") {
    return <p className="error-message">Only superadmins can add beds.</p>;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/v1/beds/add", formData, { withCredentials: true });

      // Show success pop-up
      setShowPopup(true);
      setTimeout(() => {
        setShowPopup(false);
        navigate("/beds"); // Redirect to beds page
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to add bed.");
    }
  };

  return (
    <SidebarLayout>
    <div className="add-bed-container">
      <h2>Add Bed</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="bedNumber"
          placeholder="Bed Number"
          onChange={handleChange}
          required
        />
        <select name="type" value={formData.type} onChange={handleChange}>
          <option value="General">General</option>
          <option value="ICU">ICU</option>
          <option value="Regular">Regular</option>
        </select>
        <button type="submit">Add Bed</button>
      </form>
      {showPopup && <p className="success-popup">Bed added successfully!</p>}
    </div>
    </SidebarLayout>
  );
};

export default AddBed;
