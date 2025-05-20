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
      await axios.post("https://medibed.onrender.com/api/v1/staff/add", formData, {
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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-xl p-15 w-full max-w-lg font-bold">

        <div className="text-2xl font-bold text-gray-500 mb-8 text-center py-3 px-10 ">
          Add Staff Member
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
            placeholder="Name"
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-md text-lg"
          />

          <input
            type="text"
            name="staffID"
            placeholder="Staff ID"
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-md text-lg"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-md text-lg"
          />

          <select
            name="role"
            onChange={handleChange}
           className="w-full px-4 py-3 bg-white border-2 border-gray-500 rounded-md text-lg"
           style={{ border: '1px solid rgb(199, 200, 202)',
                    borderRadius: '0.375rem'
           }}
          >
            <option value="staff">Staff</option>
            <option value="superadmin">Superadmin</option>
          </select>

          <button
  type="submit"
  className="button"
  
>
  Add Staff
</button>


        </form>

        {showPopup && (
          <div className="mt-4 bg-green-100 text-green-700 p-3 rounded text-center text-sm font-semibold">
            Staff member added successfully! Redirecting...
          </div>
        )}
      </div>
    </div>
    </SidebarLayout>
  );
};

export default AddStaff;
