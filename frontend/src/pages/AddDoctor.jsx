import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SidebarLayout from "../components/SidebarLayout";

const AddDoctor = ({ user }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    specialization: "",
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
          Only superadmins can add doctors.
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
      await axios.post("/api/v1/doctor/add-dr", formData, {
        withCredentials: true,
      });

      setShowPopup(true);
      setTimeout(() => {
        setShowPopup(false);
        navigate("/dashboard");
      }, 3000);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to add doctor.");
    }
  };

  return (
    <SidebarLayout>
    <div className="add-doctor-container">
      <h2>Add Doctor</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Doctor's Name" onChange={handleChange} required />
        <input type="text" name="specialization" placeholder="Specialization" onChange={handleChange} required />
        <button type="submit">Add Doctor</button>
      </form>
      {showPopup && <p className="success-popup">Doctor added successfully!</p>}
    </div>
    </SidebarLayout>
  );
};

export default AddDoctor;
