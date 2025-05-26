import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SidebarLayout from "../components/SidebarLayout";

const AddPatient = ({ user }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    weight: "",
    phoneNumber: "",
    bloodGroup: "A+",
    address: "",
    email: "",
    status: "ADMITTED",
    severity: "1",
    bedType: "Regular",
  });

  const [error, setError] = useState("");

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600 text-lg font-semibold">YOU NEED TO BE LOGGED IN</p>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await axios.post(
        "https://medibed.onrender.com/api/v1/patients/add-patients",
        formData,
        { withCredentials: true }
      );

      if (response.data?.message?.includes("No vacant")) {
        setError(response.data.message);
        return;
      }

      navigate("/dashboard");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to add patient.");
    }
  };

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white shadow-lg rounded-xl p-10 w-full max-w-lg font-bold">
          <div className="text-2xl font-bold text-gray-500 mb-8 text-center py-2 px-10">
            Add Patient
          </div>

          {error && (
            <p className="text-red-500 text-sm mb-4 text-center font-semibold">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <input type="text" name="name" placeholder="Patient's Name" value={formData.name} onChange={handleChange} required className="input" />
            <input type="number" name="age" placeholder="Age" value={formData.age} onChange={handleChange} required className="input" />
            <input type="number" name="weight" placeholder="Weight (kg)" value={formData.weight} onChange={handleChange} required className="input" />
            <input type="text" name="phoneNumber" placeholder="Phone Number" value={formData.phoneNumber} onChange={handleChange} required className="input" />
            <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} required className="input">
              {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((group) => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
            <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} required className="input" />
            <input type="email" name="email" placeholder="Patient's Email" value={formData.email} onChange={handleChange} required className="input" />
            <select name="status" value={formData.status} onChange={handleChange} required className="input">
              <option value="ADMITTED">Admitted</option>
              <option value="DISCHARGED">Discharged</option>
            </select>
            <select name="severity" value={formData.severity} onChange={handleChange} required className="input">
              <option value="1">Low</option>
              <option value="2">Moderate</option>
              <option value="3">Critical</option>
            </select>
            <select name="bedType" value={formData.bedType} onChange={handleChange} required className="input">
              <option value="Regular">Regular</option>
              <option value="General">General</option>
              <option value="ICU">ICU</option>
            </select>

            <button type="submit" className="button">Add Patient</button>
          </form>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default AddPatient;
