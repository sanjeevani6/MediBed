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
      await axios.post("https://medibed.onrender.com/api/v1/doctor/add-dr", formData, {
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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-xl p-15 w-full max-w-lg font-bold">
        <div className="text-2xl font-bold text-gray-500 mb-8 text-center py-3 px-10">
          Add Doctor
        </div>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center font-semibold">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            name="name"
            placeholder="Doctor's Name"
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-md text-lg"
          />

          <input
            type="text"
            name="specialization"
            placeholder="Specialization"
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-md text-lg"
          />

          <button type="submit" className="button">
            Add Doctor
          </button>
        </form>

        {showPopup && (
          <div className="mt-4 bg-green-100 text-green-700 p-3 rounded text-center text-sm font-semibold">
            Doctor added successfully! Redirecting...
          </div>
        )}
      </div>
    </div>
    </SidebarLayout>
  );
};

export default AddDoctor;
