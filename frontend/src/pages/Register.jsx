import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import loginImage from "../assets/image.png";
import medibedLogo from "../assets/logo.png";

const Register = ({ setUser }) => {
  const [hospitalName, setHospitalName] = useState("");
  const [staffID, setStaffID] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false); // Cold start state(for cold start)
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setIsRegistering(true);

    try {
      const { data } = await axios.post(
        "https://medibed.onrender.com/api/v1/auth/register",
        { hospitalName, staffID, name, password },
        { withCredentials: true }
      );

      if (data.staff && data.token) {
        setUser(data.staff); //  Set user immediately
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setIsRegistering(false); // Stop loading state
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <div className="w-full md:w-[60%] flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="rounded-full border-4 border-blue-50 p-2">
                <img
                  src={medibedLogo}
                  alt="MEDIBED Logo"
                  className="h-45 w-45 rounded-full object-contain"
                />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">REGISTER</h2>
            <p className="text-gray-500 text-lg font-extrabold">
              Hospital Admin Registration
            </p>
          </div>

          {isRegistering && (
            <div className="bg-blue-100 border border-blue-300 text-blue-700 px-4 py-3 rounded mb-6 text-sm">
              Registering your account... This may take a few seconds during first-time setup.
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form className="space-y-8" onSubmit={handleRegister}>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hospital Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg"
                  placeholder="Enter hospital name"
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Staff ID
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg"
                  placeholder="Create staff ID"
                  value={staffID}
                  onChange={(e) => setStaffID(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className={`login-button ${isRegistering ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={isRegistering}
            >
              {isRegistering ? "Registering..." : "Register"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Go back to{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-blue-600 hover:underline cursor-pointer font-semibold"
            >
              Login
            </span>
          </p>
        </div>
      </div>

      <div className="hidden md:block md:w-[40%] bg-blue-50 relative overflow-hidden">
        <img
          src={loginImage}
          alt="Hospital Bed Management System"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

export default Register;
