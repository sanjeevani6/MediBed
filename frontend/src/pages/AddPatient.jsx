import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AddPatient = ({ user }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    weight: "",
    phoneNumber: "",
    bloodGroup: "A+",
    address: "",
    status: "ADMITTED",
    severity: "1",
    bedType: "Regular",
  });

  const [error, setError] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  // Ensure only logged-in users can access
  if (!user) {
    return <p className="error-message">YOU NEED TO BE LOGGED IN</p>;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Reset error before request
    try {
      console.log("formData",formData);
      const response = await axios.post("/api/v1/patients/add-patients", formData, { withCredentials: true });

      if (response.data?.message.includes("No vacant")) {
        setError(response.data.message);
        return;
      }

      // Show success pop-up
      setShowPopup(true);
      setTimeout(() => {
        setShowPopup(false);
        navigate("/dashboard"); // Redirect to dashboard
      }, 3000);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to add patient.");
    }
  };

  return (
    <div className="add-patient-container">
      <h2>Add Patient</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Patient's Name" value={formData.name} onChange={handleChange} required />
        <input type="number" name="age" placeholder="Age" value={formData.age} onChange={handleChange} required />
        <input type="number" name="weight" placeholder="Weight (kg)" value={formData.weight} onChange={handleChange} required />
        <input type="text" name="phoneNumber" placeholder="Phone Number" value={formData.phoneNumber} onChange={handleChange} required />
        
        <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} required>
          {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((group) => (
            <option key={group} value={group}>{group}</option>
          ))}
        </select>
        
        <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />
        
        <select name="status" value={formData.status} onChange={handleChange} required>
          <option value="ADMITTED">Admitted</option>
          <option value="DISCHARGED">Discharged</option>
        </select>
        
        <select name="severity" value={formData.severity} onChange={handleChange} required>
          <option value="1">Low</option>
          <option value="2">Moderate</option>
          <option value="3">Critical</option>
        </select>
        
        <select name="bedType" value={formData.bedType} onChange={handleChange} required>
          <option value="Regular">Regular</option>
          <option value="General">General</option>
          <option value="ICU">ICU</option>
        </select>
        
        <button type="submit">Add Patient</button>
      </form>
      
      {showPopup && <p className="success-popup">Patient added successfully!</p>}
    </div>
  );
};

export default AddPatient;

